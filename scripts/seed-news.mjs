import {createClient} from '@sanity/client';
import {load} from 'cheerio';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const settings = JSON.parse(await read('config/sanity.json'));
const token = process.env.SANITY_WRITE_TOKEN;
const documents = new Map();

for (const archive of ['news-article', 'news-article-page2']) {
  const $ = load(await read(`src/templates/${archive}.html`));
  for (const element of $('a[href]').toArray()) {
    const link = $(element);
    const match = link.attr('href')?.match(/^(?:https:\/\/supertouchkindnessfoundation\.org)?(\/(\d{4})\/(\d{2})\/(\d{2})\/[a-z0-9-]+\/)$/);
    if (!match) continue;
    const [, path, year, month, day] = match;
    const id = createHash('sha256').update(path).digest('hex').slice(0, 24);
    const story = documents.get(path) ?? {
      _id: `news-${id}`, _type: 'newsStory', path, publishedOn: `${year}-${month}-${day}`, legacy: true,
    };
    const title = link.text().trim();
    const image = link.find('img').attr('src');
    if (title) story.title = title;
    if (image) story.legacyImage = image;
    documents.set(path, story);
  }
}

for (const story of documents.values()) {
  const template = await read(`src/templates/${story.path.slice(1, -1).replaceAll('/', '-')}.html`).catch(error => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  story.hasLegacyBody = template !== null;
  if (!story.hasLegacyBody) story._id = 'drafts.' + story._id;
  if (!story.title || !story.legacyImage) throw new Error(`Incomplete archive record: ${story.path}`);
}

if (process.argv.includes('--dry-run')) {
  const stories = [...documents.values()];
  console.log(JSON.stringify({total: stories.length, withoutLocalBody: stories.filter(story => !story.hasLegacyBody).map(story => story.path)}, null, 2));
} else if (process.argv.includes('--ndjson')) {
  for (const story of documents.values()) console.log(JSON.stringify(story));
} else {
  if (!token) throw new Error('Set SANITY_WRITE_TOKEN before importing news.');
  const client = createClient({...settings, token, apiVersion: '2026-10-10', useCdn: false});
  const tx = client.transaction();
  for (const story of documents.values()) tx.createIfNotExists(story);
  await tx.commit();
  console.log(`Imported up to ${documents.size} news records without overwriting existing edits.`);
}

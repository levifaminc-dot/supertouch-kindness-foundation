import {load} from 'cheerio';
import firstArchive from '../templates/news-article.html?raw';
import secondArchive from '../templates/news-article-page2.html?raw';
import {newsStories, type NewsStory} from './news';

export const newsPageSize = 6;

export async function archiveStories(): Promise<NewsStory[]> {
  const $ = load(firstArchive + secondArchive);
  const stories = new Map<string, { image?: string; title?: string; date: string }>();
  $('a[href]').each((_, element) => {
    const link = $(element);
    const href = link.attr('href') ?? '';
    const match = href.match(/^(?:https:\/\/supertouchkindnessfoundation\.org)?\/(\d{4})\/(\d{2})\/(\d{2})\/[^/]+\/$/);
    if (!match) return;
    const story = stories.get(href) ?? { date: match.slice(1).join('-') };
    const image = link.find('img').attr('src');
    const title = link.text().trim();
    if (image) story.image = image;
    if (title) story.title = title;
    stories.set(href, story);
  });

  const byPath = new Map<string, NewsStory>();
  for (const [href, {image, title, date}] of stories) {
    if (title) byPath.set(new URL(href, 'https://supertouchkindnessfoundation.org').pathname, {
      path: href, title, image, publishedOn: date,
    });
  }
  for (const story of await newsStories().catch(() => [])) byPath.set(story.path, story);
  return [...byPath.values()].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
}

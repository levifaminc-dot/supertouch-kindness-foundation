import type {toHTML} from '@portabletext/to-html';
import {contentClient} from './content';

export interface NewsStory {
  title: string;
  path: string;
  publishedOn: string;
  summary?: string;
  image?: string;
  alt?: string;
  body?: Extract<Parameters<typeof toHTML>[0], unknown[]>;
}

const fields = 'title,path,publishedOn,summary,alt,"image":coalesce(cover.asset->url,legacyImage)';
const published = '_type == "newsStory" && defined(title) && defined(path) && defined(publishedOn) && (hasLegacyBody == true || count(body) > 0)';

export async function newsStories(): Promise<NewsStory[]> {
  return (await contentClient()?.fetch<NewsStory[]>(`*[${published}] | order(publishedOn desc, _createdAt desc, _id asc){${fields}}`)) ?? [];
}

export async function newsStory(path: string): Promise<NewsStory | null> {
  return (await contentClient()?.fetch<NewsStory | null>(`*[${published} && path == $path] | order(_id asc)[0]{${fields},body}`, {path})) ?? null;
}

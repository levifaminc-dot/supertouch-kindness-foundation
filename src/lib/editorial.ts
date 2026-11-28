import defaults from '../data/editorial.json';
import {contentClient} from './content';

interface Entry { title: string; href?: string; order: number; featured?: boolean; coverUrl?: string }
export interface LibraryEntry extends Entry { category: string; year?: number; size?: string }
export interface ImpactProject extends Entry { year?: number; place: string; description?: string; alt?: string }
export interface ImpactFigure { label: string; value: number; suffix?: string; period?: string; source?: string; sourceUrl?: string }

function safeLink(value?: string) {
  if (!value || /[\\\x00-\x20]/.test(value)) return undefined;
  return /^(?:\/(?!\/)|https:\/\/[^/]+(?:\/|$))/.test(value) ? value : undefined;
}

async function entries<T>(type: string, fields: string): Promise<T[]> {
  const fallback = defaults.filter(entry => entry._type === type) as unknown as T[];
  try {
    const list = await contentClient()?.fetch<T[]>(
      `*[_type == $type] | order(coalesce(order, 100) asc, _id asc){${fields}}`, {type},
    );
    return list ?? fallback;
  } catch {
    return fallback;
  }
}

export async function libraryEntries() {
  const list = await entries<LibraryEntry>('libraryDocument',
    'title,category,year,order,featured,"href":coalesce(pdf.asset->url,href),"coverUrl":coalesce(cover.asset->url,coverUrl),"size":select(defined(pdf.asset)=>null,size)');
  return list.filter(entry => entry.title).map(entry => ({...entry, href:safeLink(entry.href), coverUrl:safeLink(entry.coverUrl)}));
}

export async function impactProjects() {
  const list = await entries<ImpactProject>('impactProject','title,year,place,description,href,order,featured,alt,"coverUrl":coalesce(cover.asset->url,coverUrl)');
  return list.filter(entry => entry.title && entry.place).map(entry => ({...entry, href:safeLink(entry.href), coverUrl:safeLink(entry.coverUrl)}));
}

export async function impactFigures() {
  const list = await entries<ImpactFigure>('impactFigure','label,value,suffix,period,source,sourceUrl');
  return list.filter(entry => entry.label && Number.isSafeInteger(entry.value) && entry.value >= 0)
    .map(entry => ({...entry, sourceUrl:safeLink(entry.sourceUrl)}));
}

import type {APIRoute} from 'astro';
import {contentClient} from '../../../../../lib/content';

export const GET: APIRoute = async ({redirect}) => {
  const url = await contentClient()?.fetch<string | null>(
    '(*[_id == "library-document-1"][0]).pdf.asset->url',
  ).catch(() => null);
  if (url?.startsWith('https://cdn.sanity.io/files/')) return redirect(url, 302);
  return new Response('The report download is temporarily unavailable.', {
    status: 503,
    headers: {'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8'},
  });
};

export const HEAD = GET;

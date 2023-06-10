import { NotionAPI } from 'notion-client';
import { Block } from 'notion-types';

const notion = new NotionAPI({
  authToken: process.env.NOTION_AUTH_TOKEN,
});

export function getRecordMap(id: string) {
  return notion.getPage(id);
}

export function mapImageUrl(url: string, block: Block): string | null {
  if (!url) {
    return null;
  }

  if (url.startsWith('data:')) {
    return url;
  }

  // more recent versions of notion don't proxy unsplash images
  if (url.startsWith('https://images.unsplash.com')) {
    return url;
  }

  try {
    const u = new URL(url);

    if (
      u.pathname.startsWith('/image') &&
      u.hostname === 'www.notion.so'
    ) {
      const notionImageUrl = new URL(url);
      let table = block.parent_table === 'space' ? 'block' : block.parent_table;
      if (table === 'collection' || table === 'team') {
        table = 'block';
      }
      notionImageUrl.searchParams.set('table', table);
      notionImageUrl.searchParams.set('id', block.id);
      notionImageUrl.searchParams.set('cache', 'v2');

      return notionImageUrl.toString();
    }

  } catch {
    return null;
  }

  if (url.startsWith('/images')) {
    url = `https://www.notion.so${url}`;
  }

  url = `https://www.notion.so${url.startsWith('/image') ? url : `/image/${encodeURIComponent(url)}`
    }`;

  const notionImageUrlV2 = new URL(url);
  let table = block.parent_table === 'space' ? 'block' : block.parent_table;
  if (table === 'collection' || table === 'team') {
    table = 'block';
  }
  notionImageUrlV2.searchParams.set('table', table);
  notionImageUrlV2.searchParams.set('id', block.id);
  notionImageUrlV2.searchParams.set('cache', 'v2');

  url = notionImageUrlV2.toString();

  return url;
}

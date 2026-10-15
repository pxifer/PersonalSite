import { describe, expect, it } from 'vitest';
import { searchPosts, type BlogEntry } from './content';

function post(
  slug: string,
  title: string,
  publishedAt: string,
  options: Partial<BlogEntry['data']> = {},
) {
  return {
    id: slug,
    collection: 'blog',
    body: '',
    filePath: `${slug}.md`,
    data: {
      slug,
      title,
      summary: '示例摘要',
      publishedAt: new Date(publishedAt),
      category: '工程实践',
      tags: ['Astro'],
      published: true,
      isExample: true,
      ...options,
    },
  } as BlogEntry;
}

const posts = [
  post('latest', 'TypeScript 搜索', '2026-03-03', { tags: ['Astro', 'Search'] }),
  post('older', '内容组织', '2026-02-01'),
  post('draft', '隐藏草稿', '2026-04-01', { published: false }),
];

describe('searchPosts', () => {
  it('filters drafts and sorts published posts newest first', () => {
    expect(searchPosts(posts, '').map(({ data }) => data.slug)).toEqual([
      'latest',
      'older',
    ]);
  });

  it('matches trimmed, case-insensitive text in title and tags', () => {
    expect(searchPosts(posts, '  typescript ').map(({ data }) => data.slug)).toEqual([
      'latest',
    ]);
    expect(searchPosts(posts, 'search').map(({ data }) => data.slug)).toEqual(['latest']);
  });

  it('combines query, category, and tag filters with AND', () => {
    expect(searchPosts(posts, 'search', '工程实践', 'Search')).toHaveLength(1);
    expect(searchPosts(posts, 'search', '工程实践', 'missing')).toHaveLength(0);
  });
});

import type { CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blog'>;

export function getPublishedPosts(posts: BlogEntry[]) {
  return posts
    .filter(({ data }) => data.published)
    .sort((a, b) => {
      const dateOrder = b.data.publishedAt.getTime() - a.data.publishedAt.getTime();
      return dateOrder || a.data.slug.localeCompare(b.data.slug);
    });
}

export function searchPosts(posts: BlogEntry[], query: string, category = '', tag = '') {
  const normalized = query.trim().toLowerCase();
  return getPublishedPosts(posts).filter(({ data }) => {
    const fields = [data.title, data.summary, data.category, ...data.tags];
    const matchesQuery =
      !normalized || fields.some((field) => field.toLowerCase().includes(normalized));
    const matchesCategory = !category || data.category === category;
    const matchesTag = !tag || data.tags.includes(tag);
    return matchesQuery && matchesCategory && matchesTag;
  });
}

export function getPostFilters(posts: BlogEntry[]) {
  const published = getPublishedPosts(posts);
  return {
    categories: [...new Set(published.map(({ data }) => data.category))].sort(),
    tags: [...new Set(published.flatMap(({ data }) => data.tags))].sort(),
  };
}

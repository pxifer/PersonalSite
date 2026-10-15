/** Prefix internal root-relative URLs with Astro's configured deployment base. */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}` || '/';
}

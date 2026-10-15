const repository = process.env.GITHUB_REPOSITORY;
const [owner, repoName] = repository?.split('/') ?? [];

export const siteBase =
  process.env.GITHUB_PAGES_BASE ||
  (repoName && repoName !== `${owner}.github.io` ? `/${repoName}/` : '/');

export function sitePath(path: string): string {
  return `${siteBase}${path.replace(/^\/+/, '')}`;
}

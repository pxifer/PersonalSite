import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const repository = process.env.GITHUB_REPOSITORY;
const [owner, repoName] = repository?.split('/') ?? [];
const site =
  process.env.SITE_URL ||
  (owner ? `https://${owner}.github.io` : 'https://example.github.io');
const base =
  process.env.GITHUB_PAGES_BASE ||
  (repoName && repoName !== `${owner}.github.io` ? `/${repoName}/` : '/');

export default defineConfig({
  site,
  base,
  integrations: [sitemap()],
  trailingSlash: 'never',
  output: 'static',
});

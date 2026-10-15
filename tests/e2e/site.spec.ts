import { expect, test } from '@playwright/test';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { sitePath } from './helpers';

const content = JSON.parse(
  readFileSync(new URL('../../src/data/profile.json', import.meta.url), 'utf8'),
);

test('homepage introduces the site and links to featured work', async ({ page }) => {
  await page.goto(sitePath('/'));
  await expect(page.getByRole('heading', { level: 1 })).toContainText('把复杂需求');
  await expect(page.getByRole('link', { name: /查看代表项目/ })).toHaveAttribute(
    'href',
    '#featured-projects',
  );
  await expect(page.getByText('演示站点', { exact: false })).toBeVisible();
});

test('project detail is statically rendered and returns to the list', async ({
  page,
}) => {
  await page.goto(sitePath('/projects/product-studio'));
  await expect(page.getByRole('heading', { name: '示例项目：产品工作台' })).toBeVisible();
  await expect(page.getByRole('link', { name: '← 返回项目列表' })).toHaveAttribute(
    'href',
    sitePath('/projects'),
  );
});

test('blog filters combine query, category, and tag and restore from URL', async ({
  page,
}) => {
  await page.goto(
    sitePath('/blog?category=%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5&tag=Search'),
  );
  await expect(
    page.getByRole('heading', { name: '示例文章：设计轻量的站内搜索' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '示例文章：长内容的响应式排版' }),
  ).toBeHidden();
  await page.getByLabel('搜索标题、摘要、分类或标签').fill('not a match');
  await expect(page.locator('[data-no-results]')).toBeVisible();
  await page.getByRole('button', { name: '清除筛选' }).click();
  await expect(page.getByText('共 3 篇文章')).toBeVisible();
});

test('mobile navigation opens and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(sitePath('/'));
  const toggle = page.locator('[data-menu-toggle]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '打开导航菜单' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});

test('unknown paths return a real not-found response', async ({ request }) => {
  const response = await request.get(sitePath('/this-page-does-not-exist'));
  expect(response.status()).toBe(404);
});

test('admin edits profile through GitHub without storing the token', async ({ page }) => {
  let savedContent = '';
  await page.route(
    'https://api.github.com/repos/pxifer/PersonalSite/contents/src/data/profile.json**',
    async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            type: 'file',
            encoding: 'base64',
            sha: 'initial-sha',
            content: Buffer.from(JSON.stringify(content)).toString('base64'),
          }),
        });
        return;
      }
      const body = route.request().postDataJSON() as { content: string; sha: string };
      expect(body.sha).toBe('initial-sha');
      savedContent = Buffer.from(body.content, 'base64').toString('utf8');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: { sha: 'new-sha' } }),
      });
    },
  );

  await page.goto(sitePath('/admin'));
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex,nofollow',
  );
  await page.getByLabel('GitHub 访问令牌').fill('test-token');
  await page.getByRole('button', { name: '加载当前资料' }).click();
  await expect(page.getByLabel('展示姓名')).toHaveValue('你的姓名');
  await page.getByLabel('展示姓名').fill('新名字');
  await page.getByRole('button', { name: '保存并发布' }).click();
  await expect(page.getByText('已提交到 GitHub。', { exact: false })).toBeVisible();
  expect(JSON.parse(savedContent).profile.name).toBe('新名字');
  expect(await page.evaluate(() => globalThis.localStorage.length)).toBe(0);
});

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const releaseMode = process.argv.includes('--release');
const contentDirectories = ['src/content/projects', 'src/content/blog'];
const failures = [];
const files = [];

async function collectMarkdown(directory) {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectMarkdown(relativePath);
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(relativePath);
  }
}

for (const directory of contentDirectories) await collectMarkdown(directory);

for (const file of files) {
  const source = await readFile(path.join(root, file), 'utf8');
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    failures.push(`${file}: 缺少 YAML frontmatter`);
    continue;
  }

  const frontmatter = match[1];
  if (!/^slug:\s*[a-z0-9]+(?:-[a-z0-9]+)*\s*$/m.test(frontmatter)) {
    failures.push(`${file}: slug 缺失或格式无效`);
  }
  if (
    file.startsWith('src/content/blog/') &&
    !/^published:\s*(true|false)\s*$/m.test(frontmatter)
  ) {
    failures.push(`${file}: 必须显式设置 published: true 或 false`);
  }
  if (!/^isExample:\s*(true|false)\s*$/m.test(frontmatter)) {
    failures.push(`${file}: 必须显式设置 isExample: true 或 false`);
  }
  if (releaseMode && /^isExample:\s*true\s*$/m.test(frontmatter)) {
    failures.push(`${file}: 正式发布前必须替换示例内容并设置 isExample: false`);
  }
}

if (releaseMode) {
  const profile = await readFile(path.join(root, 'src/data/profile.ts'), 'utf8');
  if (/isExample:\s*true/.test(profile))
    failures.push('src/data/profile.ts: 个人资料仍标记为示例');
  if (/your-name|example\.com|待替换|待补充|你的姓名/i.test(profile)) {
    failures.push('src/data/profile.ts: 仍有需要替换的占位资料');
  }
  const email = profile.match(/email:\s*['"]([^'"]*)['"]/)?.[1] ?? '';
  if (!email || email.includes('example.com')) {
    failures.push('src/data/profile.ts: 邮箱尚未替换为真实地址');
  }
}

if (failures.length) {
  console.error(
    `${releaseMode ? '正式发布' : '内容'}检查失败：\n- ${failures.join('\n- ')}`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `内容检查通过：${files.length} 个 Markdown 文件${releaseMode ? '；发布内容不含示例资料' : ''}。`,
  );
}

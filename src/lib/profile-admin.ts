import type { ProfileContent } from '@/data/profile';

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} 格式无效`);
  }
  return value as Record<string, unknown>;
}

function string(value: unknown, label: string, required = true): string {
  if (typeof value !== 'string') throw new Error(`${label} 必须是文字`);
  const result = value.trim();
  if (required && !result) throw new Error(`${label} 不能为空`);
  return result;
}

function array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} 必须是列表`);
  return value;
}

function httpsUrl(value: unknown, label: string, required = false): string {
  const result = string(value, label, required);
  if (!result) return '';
  try {
    const url = new URL(result);
    if (url.protocol !== 'https:' || !url.hostname) throw new Error();
  } catch {
    throw new Error(`${label} 必须是有效的 HTTPS 链接`);
  }
  return result;
}

export function validateProfileContent(value: unknown): ProfileContent {
  const source = record(value, '资料');
  const input = record(source.profile, '基本资料');
  const email = string(input.email, '邮箱', false);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('邮箱格式无效');
  }
  if (typeof input.isExample !== 'boolean') {
    throw new Error('演示资料标记格式无效');
  }

  return {
    profile: {
      name: string(input.name, '展示姓名'),
      wordmark: string(input.wordmark, '字标'),
      role: string(input.role, '专业方向'),
      headline: string(input.headline, '首页主张'),
      intro: string(input.intro, '个人简介'),
      availability: string(input.availability, '联系状态'),
      email,
      github: httpsUrl(input.github, 'GitHub 主页'),
      socialLinks: array(input.socialLinks, '社交链接').map((item, index) => {
        const link = record(item, `社交链接 ${index + 1}`);
        return {
          label: string(link.label, `社交链接 ${index + 1} 名称`),
          href: httpsUrl(link.href, `社交链接 ${index + 1} 地址`, true),
        };
      }),
      isExample: input.isExample,
    },
    skills: array(source.skills, '技能分组').map((item, index) => {
      const group = record(item, `技能分组 ${index + 1}`);
      const tools = array(group.tools, `技能分组 ${index + 1} 工具`).map((tool) =>
        string(tool, `技能分组 ${index + 1} 工具`),
      );
      if (!tools.length) throw new Error(`技能分组 ${index + 1} 至少需要一个工具`);
      return {
        title: string(group.title, `技能分组 ${index + 1} 名称`),
        description: string(group.description, `技能分组 ${index + 1} 描述`),
        tools,
        projectSlugs: array(group.projectSlugs, `技能分组 ${index + 1} 项目`).map(
          (slug) => {
            const result = string(slug, `技能分组 ${index + 1} 项目 slug`);
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result)) {
              throw new Error(`项目 slug 格式无效：${result}`);
            }
            return result;
          },
        ),
      };
    }),
    experience: array(source.experience, '精选经历').map((item, index) => {
      const entry = record(item, `经历 ${index + 1}`);
      return {
        period: string(entry.period, `经历 ${index + 1} 时间`),
        organization: string(entry.organization, `经历 ${index + 1} 机构`),
        role: string(entry.role, `经历 ${index + 1} 角色`),
        contribution: string(entry.contribution, `经历 ${index + 1} 贡献`),
      };
    }),
  };
}

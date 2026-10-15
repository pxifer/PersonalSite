export const profile = {
  name: '你的姓名',
  wordmark: 'YN',
  role: '全栈 / 软件工程师',
  headline: '把复杂需求，做成清晰可靠的产品。',
  intro:
    '我关注从界面到服务的完整实现，也在这里记录项目中的选择与思考。请在发布前替换为真实的个人介绍。',
  availability: '欢迎交流与合作',
  email: '',
  github: '',
  socialLinks: [] as { label: string; href: string }[],
  isExample: true,
} as const;

export const skills = [
  {
    title: '界面与体验',
    description: '从信息结构到响应式界面，关注清晰、可访问的交互。',
    tools: ['TypeScript', 'HTML', 'CSS'],
    projectSlugs: ['product-studio', 'engineering-notes'],
  },
  {
    title: '服务与数据',
    description: '围绕实际产品需求组织接口、数据与服务边界。',
    tools: ['Node.js', 'REST API', 'SQL'],
    projectSlugs: ['product-studio'],
  },
  {
    title: '交付与工程质量',
    description: '用自动检查、测试与持续交付，让修改更可靠。',
    tools: ['Git', 'Testing', 'CI/CD'],
    projectSlugs: ['engineering-notes'],
  },
];

export const experience = [
  {
    period: '[时间范围·待替换]',
    organization: '[机构或阶段·待替换]',
    role: '[角色·待替换]',
    contribution: '补充一条真实、可验证的职责或贡献。',
  },
  {
    period: '[时间范围·待替换]',
    organization: '[机构或阶段·待替换]',
    role: '[角色·待替换]',
    contribution: '内容不足时删除此条，不要用示例填满页面。',
  },
];

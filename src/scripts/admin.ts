import type { ProfileContent } from '@/data/profile';
import { validateProfileContent } from '@/lib/profile-admin';

const apiUrl =
  'https://api.github.com/repos/pxifer/PersonalSite/contents/src/data/profile.json';

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`管理页缺少元素：${selector}`);
  return element;
}

const tokenInput = requiredElement<HTMLInputElement>('#admin-token');
const loadButton = requiredElement<HTMLButtonElement>('#admin-load');
const clearButton = requiredElement<HTMLButtonElement>('#admin-clear-token');
const form = requiredElement<HTMLFormElement>('#admin-form');
const saveButton = requiredElement<HTMLButtonElement>('#admin-save');
const connectionStatus = requiredElement<HTMLElement>('#admin-status');
const saveStatus = requiredElement<HTMLElement>('#admin-save-status');

type ListName = 'social' | 'skill' | 'experience';
let currentSha: string | null = null;
let originalContent = '';
let busy = false;

function setStatus(element: HTMLElement, message: string, error = false): void {
  element.textContent = message;
  if (error) element.dataset.error = '';
  else delete element.dataset.error;
}

function setBusy(value: boolean): void {
  busy = value;
  loadButton.disabled = value;
  saveButton.disabled = value;
}

function inputValue(row: ParentNode, selector: string): string {
  const input = row.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
  if (!input) throw new Error(`管理页缺少字段：${selector}`);
  return input.value.trim();
}

function setInputValue(row: ParentNode, key: string, value: string): void {
  const input = row.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    `[data-field="${key}"]`,
  );
  if (input) input.value = value;
}

function listContainer(name: ListName): HTMLElement {
  return requiredElement<HTMLElement>(`[data-list="${name}"]`);
}

function appendRow(name: ListName, values: Record<string, string> = {}): void {
  const template = requiredElement<HTMLTemplateElement>(`#admin-${name}-template`);
  const fragment = template.content.cloneNode(true) as DocumentFragment;
  for (const [key, value] of Object.entries(values)) {
    setInputValue(fragment, key, value);
  }
  listContainer(name).append(fragment);
}

function rows(name: ListName): HTMLElement[] {
  return Array.from(listContainer(name).querySelectorAll<HTMLElement>('[data-row]'));
}

function setField(name: string, value: string): void {
  const input = form.elements.namedItem(name);
  if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
    input.value = value;
  }
}

function renderContent(content: ProfileContent): void {
  const { profile, skills, experience } = content;
  for (const key of [
    'name',
    'wordmark',
    'role',
    'headline',
    'intro',
    'availability',
    'email',
    'github',
  ] as const) {
    setField(key, profile[key]);
  }
  const example = form.elements.namedItem('isExample');
  if (example instanceof HTMLInputElement) example.checked = profile.isExample;

  for (const name of ['social', 'skill', 'experience'] as const) {
    listContainer(name).replaceChildren();
  }
  for (const link of profile.socialLinks) {
    appendRow('social', { label: link.label, href: link.href });
  }
  for (const group of skills) {
    appendRow('skill', {
      title: group.title,
      description: group.description,
      tools: group.tools.join(', '),
      projectSlugs: group.projectSlugs.join(', '),
    });
  }
  for (const item of experience) {
    appendRow('experience', {
      period: item.period,
      organization: item.organization,
      role: item.role,
      contribution: item.contribution,
    });
  }
  form.hidden = false;
}

function splitValues(value: string): string[] {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function collectContent(): ProfileContent {
  const fields = new FormData(form);
  const value = (name: string) => String(fields.get(name) ?? '').trim();
  return validateProfileContent({
    profile: {
      name: value('name'),
      wordmark: value('wordmark'),
      role: value('role'),
      headline: value('headline'),
      intro: value('intro'),
      availability: value('availability'),
      email: value('email'),
      github: value('github'),
      isExample: fields.has('isExample'),
      socialLinks: rows('social').map((row) => ({
        label: inputValue(row, '[data-field="label"]'),
        href: inputValue(row, '[data-field="href"]'),
      })),
    },
    skills: rows('skill').map((row) => ({
      title: inputValue(row, '[data-field="title"]'),
      description: inputValue(row, '[data-field="description"]'),
      tools: splitValues(inputValue(row, '[data-field="tools"]')),
      projectSlugs: splitValues(inputValue(row, '[data-field="projectSlugs"]')),
    })),
    experience: rows('experience').map((row) => ({
      period: inputValue(row, '[data-field="period"]'),
      organization: inputValue(row, '[data-field="organization"]'),
      role: inputValue(row, '[data-field="role"]'),
      contribution: inputValue(row, '[data-field="contribution"]'),
    })),
  });
}

function decodeContent(base64: string): string {
  const binary = atob(base64.replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function encodeContent(value: string): string {
  const bytes = new TextEncoder().encode(value);
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
}

async function githubRequest(method: 'GET' | 'PUT', body?: object): Promise<Response> {
  const token = tokenInput.value.trim();
  if (!token) throw new Error('请先输入 GitHub 访问令牌');
  const response = await fetch(method === 'GET' ? `${apiUrl}?ref=main` : apiUrl, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    credentials: 'omit',
    redirect: 'error',
    referrerPolicy: 'no-referrer',
  });
  return response;
}

function githubError(status: number): string {
  if (status === 401) return '令牌无效或已过期，请更换后重试。';
  if (status === 403) return '没有仓库内容写入权限，或 GitHub 请求额度已用完。';
  if (status === 404) return '找不到资料文件，请确认令牌可访问 pxifer/PersonalSite。';
  if (status === 409) return '资料已被其他提交更新，请重新加载后再保存。';
  if (status === 422) return 'GitHub 拒绝了本次提交，请重新加载并检查输入。';
  return `GitHub 请求失败（HTTP ${status}），请稍后重试。`;
}

loadButton.addEventListener('click', async () => {
  if (busy) return;
  setBusy(true);
  setStatus(connectionStatus, '正在读取仓库资料…');
  try {
    const response = await githubRequest('GET');
    if (!response.ok) throw new Error(githubError(response.status));
    const file = (await response.json()) as {
      type?: string;
      encoding?: string;
      content?: string;
      sha?: string;
    };
    if (
      file.type !== 'file' ||
      file.encoding !== 'base64' ||
      !file.content ||
      !file.sha
    ) {
      throw new Error('GitHub 返回的资料文件格式无法识别。');
    }
    const content = validateProfileContent(JSON.parse(decodeContent(file.content)));
    currentSha = file.sha;
    originalContent = JSON.stringify(content);
    renderContent(content);
    setStatus(connectionStatus, '已加载 main 分支上的最新资料，可以开始编辑。');
    setStatus(saveStatus, '');
  } catch (error) {
    currentSha = null;
    form.hidden = true;
    setStatus(
      connectionStatus,
      error instanceof Error ? error.message : '读取失败，请稍后重试。',
      true,
    );
  } finally {
    setBusy(false);
  }
});

clearButton.addEventListener('click', () => {
  tokenInput.value = '';
  currentSha = null;
  originalContent = '';
  form.hidden = true;
  setStatus(connectionStatus, '令牌已从当前页面清除。');
  setStatus(saveStatus, '');
});

document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach((button) => {
  button.addEventListener('click', () => appendRow(button.dataset.add as ListName));
});

document.querySelectorAll<HTMLElement>('[data-list]').forEach((container) => {
  container.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('[data-remove]')) {
      target.closest('[data-row]')?.remove();
    }
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy || !currentSha || !form.reportValidity()) return;
  let content: ProfileContent;
  try {
    content = collectContent();
  } catch (error) {
    setStatus(
      saveStatus,
      error instanceof Error ? error.message : '资料格式无效。',
      true,
    );
    return;
  }
  if (JSON.stringify(content) === originalContent) {
    setStatus(saveStatus, '没有检测到修改。');
    return;
  }

  setBusy(true);
  setStatus(saveStatus, '正在提交到 GitHub…');
  try {
    const response = await githubRequest('PUT', {
      message: 'Update personal website profile',
      content: encodeContent(`${JSON.stringify(content, null, 2)}\n`),
      sha: currentSha,
      branch: 'main',
    });
    if (!response.ok) throw new Error(githubError(response.status));
    const result = (await response.json()) as { content?: { sha?: string } };
    if (!result.content?.sha)
      throw new Error('提交已发送，但无法确认新版本。请到 GitHub 检查。');
    currentSha = result.content.sha;
    originalContent = JSON.stringify(content);
    setStatus(saveStatus, '已提交到 GitHub。自动部署完成后，网站将显示新资料。');
  } catch (error) {
    setStatus(
      saveStatus,
      error instanceof Error ? error.message : '保存失败，请重试。',
      true,
    );
  } finally {
    setBusy(false);
  }
});

window.addEventListener('pagehide', () => {
  tokenInput.value = '';
});

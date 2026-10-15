import { describe, expect, it } from 'vitest';
import content from '../data/profile.json';
import { validateProfileContent } from './profile-admin';

describe('profile administration validation', () => {
  it('accepts the current profile content', () => {
    expect(validateProfileContent(content).profile.name).toBe('你的姓名');
  });

  it('rejects unsafe social links', () => {
    const invalid = JSON.parse(JSON.stringify(content)) as Record<string, unknown>;
    const profile = invalid.profile as Record<string, unknown>;
    profile.socialLinks = [{ label: '链接', href: 'javascript:alert(1)' }];
    expect(() => validateProfileContent(invalid)).toThrow('HTTPS');
  });

  it('rejects missing required profile fields', () => {
    const invalid = JSON.parse(JSON.stringify(content)) as Record<string, unknown>;
    const profile = invalid.profile as Record<string, unknown>;
    profile.name = '  ';
    expect(() => validateProfileContent(invalid)).toThrow('展示姓名');
  });
});

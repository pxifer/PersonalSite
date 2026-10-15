import { defineConfig, devices } from '@playwright/test';
import { siteBase } from './tests/e2e/helpers';

const origin = 'http://127.0.0.1:4321';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: origin,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1',
    url: `${origin}${siteBase}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});

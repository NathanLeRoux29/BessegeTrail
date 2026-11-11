import { defineConfig, devices } from '@playwright/test'

// Tests de bout en bout sur les images Docker de production (docker/compose.e2e.yaml).
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    ...devices['Desktop Chrome'],
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'site', testDir: './e2e/site', use: { baseURL: 'http://127.0.0.1:14000' } },
    { name: 'admin', testDir: './e2e/admin', use: { baseURL: 'http://127.0.0.1:14001' } },
  ],
})

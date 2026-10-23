import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,                    // every test is independent; run them in parallel
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,        // one recorded retry in CI only; locally we want to see the failure
  workers: process.env.CI ? 3 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'on-failure' }]],
  use: {
    baseURL: 'https://practicesoftwaretesting.com',   // 1. relative goto()
    testIdAttribute: 'data-test',                     // 2. the Toolshop marks elements with data-test
    trace: 'on-first-retry',                          // 3. a recording when it fails
    screenshot: 'on',                                 //    screenshots of every test for the SIS 2 evidence folder
    actionTimeout: 15_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});

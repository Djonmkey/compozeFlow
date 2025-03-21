const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: 'html',
  use: {
    actionTimeout: 0,
    trace: 'on-first-retry',
    video: 'on',
    screenshot: 'on',
    headless: false, // Always run in headed mode
  },
  projects: [
    {
      name: 'smoke',
      testMatch: /.*\.smoke\.spec\.js/,
    },
    {
      name: 'regression',
      testMatch: /.*\.regression\.spec\.js/,
    },
    {
      name: 'electron',
      testMatch: /^(?!.*\.(smoke|regression)\.spec\.js$).*\.spec\.js$/,
    },
  ],
});

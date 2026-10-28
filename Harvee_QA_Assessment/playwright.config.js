const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/results.xml' }]],
  use: { baseURL: 'https://www.saucedemo.com', trace: 'retain-on-failure', screenshot: 'only-on-failure', ...devices['Desktop Chrome'] }
});

const { test: base, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');

// Custom test fixture that launches the app before each test
exports.test = base.extend({
  app: async ({}, use) => {
    const app = await electron.launch({
      args: [path.join(__dirname, '../')],
      env: {
        NODE_ENV: 'test'
      }
    });
    
    await use(app);
    
    await app.close();
  },
  
  window: async ({ app }, use) => {
    const window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    
    // Wait for the window to be visible
    await window.waitForSelector('body', { state: 'visible', timeout: 10000 });
    
    await use(window);
  }
});

exports.expect = expect;

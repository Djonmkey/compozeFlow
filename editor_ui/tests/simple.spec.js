const { test, expect } = require('@playwright/test');
const { electronApp } = require('electron-playwright-helpers');
const path = require('path');

test('should launch the app', async () => {
  console.log('Starting test');
  console.log('electronApp:', electronApp);
  
  try {
    const app = await electronApp.launch({
      args: [path.join(__dirname, '../')],
      env: {
        NODE_ENV: 'development'
      }
    });
    
    console.log('App launched');
    
    const window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    
    const title = await window.title();
    console.log('Window title:', title);
    
    await app.close();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
});

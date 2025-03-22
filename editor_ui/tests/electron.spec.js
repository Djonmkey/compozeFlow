const { _electron: electron } = require('@playwright/test');
const path = require('path');

const test = require('@playwright/test').test;
const expect = require('@playwright/test').expect;

test('should launch Electron app', async () => {
  console.log('Starting Electron test');
  
  try {
    // Launch Electron app
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '..')],
      env: {
        NODE_ENV: 'development'
      }
    });
    
    console.log('Electron app launched');
    
    // Get the first window
    const window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    
    // Wait for the window to be visible
    await window.waitForSelector('body', { state: 'visible', timeout: 10000 });
    
    // Log window dimensions
    const dimensions = await window.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    });
    console.log('Window dimensions:', dimensions);
    
    // Take a screenshot
    try {
      await window.screenshot({ path: 'editor_ui/tests/electron-app.png' });
      console.log('Screenshot taken successfully');
    } catch (screenshotError) {
      console.error('Screenshot error:', screenshotError);
    }
    
    // Get window title
    const title = await window.title();
    console.log('Window title:', title);
    
    // Close the app
    await electronApp.close();
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
});

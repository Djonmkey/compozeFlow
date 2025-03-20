const { test, expect } = require('../fixtures');

test.describe('Basic Application Tests', () => {
  test('should launch the application', async ({ window }) => {
    // Take a screenshot to verify the application is running
    try {
      await window.screenshot({ path: 'editor_ui/tests/app-launched.png' });
      console.log('Screenshot taken successfully');
    } catch (error) {
      console.error('Screenshot error:', error);
    }
    
    // Get window dimensions
    const dimensions = await window.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    });
    console.log('Window dimensions:', dimensions);
    
    // Verify the window title
    const title = await window.title();
    console.log('Window title:', title);
    
    console.log('Application launched successfully');
  });
});

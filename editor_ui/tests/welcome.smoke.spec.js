// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');

// Import test modules
const { welcomeScreenTests } = require('./modules/welcome_screen');
const { createNewVideoAssemblyDialogTests } = require('./modules/create_new_video_assembly_dialog');
const { leftIconBarTests } = require('./modules/left_icon_bar');
const { fileMenuTests } = require('./modules/file_menu');
const { tabTimelineTests } = require('./modules/tab_timeline');
const { renderBarTests } = require('./modules/render_bar');

/**
 * Smoke tests for the application
 * Note: All tests are run in headed mode
 */

test('Welcome screen tests', async ({ page }) => {
  console.log('Starting smoke test: Welcome screen tests');
  
  let electronApp;
  
  try {
    // Run all welcome screen tests
    const result = await welcomeScreenTests.runAllTests({ page, electronApp });
    electronApp = result.electronApp;
    
    // Test creating a new video assembly - commented out to focus on welcome screen tests
    await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    console.log('Welcome screen tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

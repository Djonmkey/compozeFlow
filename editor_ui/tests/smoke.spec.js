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
    // Run create new video assembly test
    const createNewVideoAssemblyResult = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssemblyFromWelcomeScreen({ page, electronApp });
    electronApp = createNewVideoAssemblyResult.electronApp;
    
    console.log('Welcome screen tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

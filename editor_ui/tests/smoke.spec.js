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

test('Welcome screen loads and can create a new video assembly', async ({ page }) => {
  console.log('Starting smoke test: Welcome screen and new video assembly');
  
  let electronApp;
  
  try {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '..')],
      env: {
        NODE_ENV: 'test'
      }
    });
    
    console.log('Electron app launched');
    
    // Test the welcome screen loads
    await welcomeScreenTests.testWelcomeScreenLoads({ page, electronApp });
    
    // Test clicking the New Video Assembly button
    await welcomeScreenTests.testClickNewVideoAssembly({ page, electronApp });
    
    // Test creating a new video assembly
    await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    console.log('Welcome screen and new video assembly tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

test('Left icon bar and file menu are functional', async ({ page }) => {
  console.log('Starting smoke test: Left icon bar and file menu');
  
  let electronApp;
  
  try {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '..')],
      env: {
        NODE_ENV: 'test'
      }
    });
    
    console.log('Electron app launched');
    
    // Test the left icon bar is present
    await leftIconBarTests.testLeftIconBarPresent({ page, electronApp });
    
    // Test the file menu is present and can be opened
    await fileMenuTests.testFileMenuPresent({ page, electronApp });
    
    console.log('Left icon bar and file menu tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

test('Timeline tab and render bar are functional', async ({ page }) => {
  console.log('Starting smoke test: Timeline tab and render bar');
  
  let electronApp;
  
  try {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '..')],
      env: {
        NODE_ENV: 'test'
      }
    });
    
    console.log('Electron app launched');
    
    // Test the timeline tab is present and can be selected
    await tabTimelineTests.testTimelineTabPresent({ page, electronApp });
    
    // Test the render bar is present
    await renderBarTests.testRenderBarPresent({ page, electronApp });
    
    console.log('Timeline tab and render bar tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

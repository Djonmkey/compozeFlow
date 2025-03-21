// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');

// Import test modules
const { welcomeScreenTests } = require('./modules/welcome_screen');
const { createNewVideoAssemblyDialogTests } = require('./modules/create_new_video_assembly_dialog');
const { leftIconBarTests } = require('./modules/left_icon_bar');
const { explorerBarContentSourcesTests } = require('./modules/explorer_bar_content_sources');
const { explorerBarSearchTests } = require('./modules/explorer_bar_search');
const { fileMenuTests } = require('./modules/file_menu');
const { renderBarTests } = require('./modules/render_bar');
const { tabTimelineTests } = require('./modules/tab_timeline');
const { tabFileTests } = require('./modules/tab_file');
const { tabRenderTests } = require('./modules/tab_render');
const { tabOverlayImagesTests } = require('./modules/tab_overlay_images');
const { tabMixedAudioTests } = require('./modules/tab_mixed_audio');
const { tabOutputTests } = require('./modules/tab_output');
const { tabGeneralTests } = require('./modules/tab_general');
const { tabRawTests } = require('./modules/tab_raw');
const { integrationRenderEngineTests } = require('./modules/integration_render_engine');

/**
 * Regression tests for the application
 * Note: All tests are run in headed mode
 */

test('Welcome screen and new video assembly dialog', async ({ page }) => {
  console.log('Starting regression test: Welcome screen and new video assembly dialog');
  
  let electronApp;
  
  try {
    // Run all welcome screen tests
    const result = await welcomeScreenTests.runAllTests({ page, electronApp });
    electronApp = result.electronApp;
    
    // Test the dialog loads
    await createNewVideoAssemblyDialogTests.testDialogLoads({ page, electronApp });
    
    // Test creating a new video assembly
    await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    console.log('Welcome screen and new video assembly dialog tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

test('Left icon bar and explorer bar', async ({ page }) => {
  console.log('Starting regression test: Left icon bar and explorer bar');
  
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
    
    // Test clicking icons in the left icon bar
    await leftIconBarTests.testClickLeftIconBarIcons({ page, electronApp });
    
    // Test the content sources panel is present
    await explorerBarContentSourcesTests.testContentSourcesPanelPresent({ page, electronApp });
    
    // Test navigating through content sources
    await explorerBarContentSourcesTests.testNavigateContentSources({ page, electronApp });
    
    // Test the search functionality is present
    await explorerBarSearchTests.testSearchFunctionalityPresent({ page, electronApp });
    
    // Test searching for content
    await explorerBarSearchTests.testSearchForContent({ page, electronApp });
    
    console.log('Left icon bar and explorer bar tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

test('File menu and render bar', async ({ page }) => {
  console.log('Starting regression test: File menu and render bar');
  
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
    
    // Test the file menu is present and can be opened
    await fileMenuTests.testFileMenuPresent({ page, electronApp });
    
    // Test clicking items in the file menu
    await fileMenuTests.testFileMenuItems({ page, electronApp });
    
    // Test the render bar is present
    await renderBarTests.testRenderBarPresent({ page, electronApp });
    
    // Test clicking buttons in the render bar
    await renderBarTests.testRenderBarButtons({ page, electronApp });
    
    console.log('File menu and render bar tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

test('Timeline and file tabs', async ({ page }) => {
  console.log('Starting regression test: Timeline and file tabs');
  
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
    
    // Test interacting with the timeline
    await tabTimelineTests.testTimelineInteraction({ page, electronApp });
    
    // Test the file tab is present and can be selected
    await tabFileTests.testFileTabPresent({ page, electronApp });
    
    // Test interacting with the file tab content
    await tabFileTests.testFileTabInteraction({ page, electronApp });
    
    console.log('Timeline and file tabs tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

test('Render and overlay images tabs', async ({ page }) => {
  console.log('Starting regression test: Render and overlay images tabs');
  
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
    
    // Test the render tab is present and can be selected
    await tabRenderTests.testRenderTabPresent({ page, electronApp });
    
    // Test interacting with the render tab content
    await tabRenderTests.testRenderTabInteraction({ page, electronApp });
    
    // Test the overlay images tab is present and can be selected
    await tabOverlayImagesTests.testOverlayImagesTabPresent({ page, electronApp });
    
    // Test interacting with the overlay images tab content
    await tabOverlayImagesTests.testOverlayImagesTabInteraction({ page, electronApp });
    
    console.log('Render and overlay images tabs tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

test('Mixed audio and output tabs', async ({ page }) => {
  console.log('Starting regression test: Mixed audio and output tabs');
  
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
    
    // Test the mixed audio tab is present and can be selected
    await tabMixedAudioTests.testMixedAudioTabPresent({ page, electronApp });
    
    // Test interacting with the mixed audio tab content
    await tabMixedAudioTests.testMixedAudioTabInteraction({ page, electronApp });
    
    // Test the output tab is present and can be selected
    await tabOutputTests.testOutputTabPresent({ page, electronApp });
    
    // Test interacting with the output tab content
    await tabOutputTests.testOutputTabInteraction({ page, electronApp });
    
    console.log('Mixed audio and output tabs tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

test('General and raw tabs', async ({ page }) => {
  console.log('Starting regression test: General and raw tabs');
  
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
    
    // Test the general tab is present and can be selected
    await tabGeneralTests.testGeneralTabPresent({ page, electronApp });
    
    // Test interacting with the general tab content
    await tabGeneralTests.testGeneralTabInteraction({ page, electronApp });
    
    // Test the raw tab is present and can be selected
    await tabRawTests.testRawTabPresent({ page, electronApp });
    
    // Test interacting with the raw tab content
    await tabRawTests.testRawTabInteraction({ page, electronApp });
    
    console.log('General and raw tabs tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

test('Integration with render engine', async ({ page }) => {
  console.log('Starting regression test: Integration with render engine');
  
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
    
    // Test that the render engine integration is present
    await integrationRenderEngineTests.testRenderEngineIntegrationPresent({ page, electronApp });
    
    // Test the render settings that would be passed to the render engine
    await integrationRenderEngineTests.testRenderEngineSettings({ page, electronApp });
    
    // Test the render queue interface
    await integrationRenderEngineTests.testRenderQueue({ page, electronApp });
    
    console.log('Integration with render engine tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

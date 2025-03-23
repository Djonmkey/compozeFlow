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
const { explorerBarContentSourcesTests } = require('./modules/explorer_bar_content_sources');
const { tabOverlayImagesTests } = require('./modules/tab_overlay_images');
const { tabMixedAudioTests } = require('./modules/tab_mixed_audio');
const { tabOutputTests } = require('./modules/tab_output');
const { tabRenderTests } = require('./modules/tab_render');
const { tabRawTests } = require('./modules/tab_raw');

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
    
    // Ensure the Icon bar is displayed
    const leftIconBarResult = await leftIconBarTests.testLeftIconBarPresent({ 
      page, 
      electronApp,
      window: createNewVideoAssemblyResult.window // Pass the window reference
    });
    electronApp = leftIconBarResult.electronApp;

    // Ensure the explorer is displayed
    const explorerResult = await explorerBarContentSourcesTests.testContentSourcesPanelPresent({ 
      page, 
      electronApp,
      window: leftIconBarResult.window // Pass the window reference
    });
    electronApp = explorerResult.electronApp;

    // Ensure the tabs are displayed
    const timelineTabResult = await tabTimelineTests.testTimelineTabPresent({ 
      page, 
      electronApp,
      window: explorerResult.window // Pass the window reference
    });
    electronApp = timelineTabResult.electronApp;
    
    const overlayImagesTabResult = await tabOverlayImagesTests.testOverlayImagesTabPresent({ 
      page, 
      electronApp,
      window: timelineTabResult.window // Pass the window reference
    });
    electronApp = overlayImagesTabResult.electronApp;
    
    const mixedAudioTabResult = await tabMixedAudioTests.testMixedAudioTabPresent({ 
      page, 
      electronApp,
      window: overlayImagesTabResult.window // Pass the window reference
    });
    electronApp = mixedAudioTabResult.electronApp;
    
    const outputTabResult = await tabOutputTests.testOutputTabPresent({ 
      page, 
      electronApp,
      window: mixedAudioTabResult.window // Pass the window reference
    });
    electronApp = outputTabResult.electronApp;
    
    // THE RENDER TAB SHOULD NOT BE PRESENT AT THIS POINT
    /*
    const renderTabResult = await tabRenderTests.testRenderTabPresent({ 
      page, 
      electronApp,
      window: outputTabResult.window // Pass the window reference
    });
    electronApp = renderTabResult.electronApp;
    */

    const rawTabResult = await tabRawTests.testRawTabPresent({ 
      page, 
      electronApp,
      window: outputTabResult.window // Pass the window reference
    });
    electronApp = rawTabResult.electronApp;

    console.log('Welcome screen tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

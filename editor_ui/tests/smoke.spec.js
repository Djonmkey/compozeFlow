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
const { tabRawTests } = require('./modules/tab_raw');
const { tabGeneralTests } = require('./modules/tab_general');

/**
 * Smoke tests for the application
 * Note: All tests are run in headed mode
 */

test('Smoke tests', async ({ page }) => {
  console.log('Starting smoke test');
  
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

    // Begin: Ensure the tabs are displayed
    // Timeline tab
    const timelineTabResult = await tabTimelineTests.testTimelineTabPresent({ 
      page, 
      electronApp,
      window: explorerResult.window // Pass the window reference
    });
    electronApp = timelineTabResult.electronApp;
    
    // Overlay Images tab
    const overlayImagesTabResult = await tabOverlayImagesTests.testOverlayImagesTabPresent({ 
      page, 
      electronApp,
      window: timelineTabResult.window // Pass the window reference
    });
    electronApp = overlayImagesTabResult.electronApp;
    
    // Mixed Audio tab
    const mixedAudioTabResult = await tabMixedAudioTests.testMixedAudioTabPresent({ 
      page, 
      electronApp,
      window: overlayImagesTabResult.window // Pass the window reference
    });
    electronApp = mixedAudioTabResult.electronApp;
    
    // Output tab
    const outputTabResult = await tabOutputTests.testOutputTabPresent({ 
      page, 
      electronApp,
      window: mixedAudioTabResult.window // Pass the window reference
    });
    electronApp = outputTabResult.electronApp;
    
    // General tab
    const generalTabResult = await tabGeneralTests.testGeneralTabPresent({ 
      page, 
      electronApp,
      window: outputTabResult.window // Pass the window reference
    });
    electronApp = generalTabResult.electronApp;
    
    // Raw tab
    const rawTabResult = await tabRawTests.testRawTabPresent({ 
      page, 
      electronApp,
      window: generalTabResult.window // Pass the window reference
    });
    electronApp = rawTabResult.electronApp;
    // End: Ensure the tabs are displayed

    // Check that the render bar is not present
    const renderBarNotPresentResult = await renderBarTests.testRenderBarNotPresent({ 
      page, 
      electronApp,
      window: rawTabResult.window // Pass the window reference
    });
    electronApp = renderBarNotPresentResult.electronApp


    console.log('Smoke tests completed successfully');
  } finally {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  }
});

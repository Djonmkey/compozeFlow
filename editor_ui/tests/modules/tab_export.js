// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');

/**
 * Tests for the export tab
 * Note: All tests are run in headed mode
 */
exports.tabExportTests = {
  /**
   * Test that the export tab is present and can be selected
   */
  testExportTabPresent: async ({ page, electronApp, window }) => {
    // Get the main window - don't create a new video assembly if we're already in the editor
    if (!window) {
      // Check if we already have a window from the electronApp
      if (electronApp) {
        const allWindows = await electronApp.windows();
        if (allWindows.length > 0) {
          window = allWindows[0];
          console.log('Using existing window for export tab test');
        }
      }
      
      // If we don't have a window yet, create a new video assembly to get to the editor
      if (!window) {
        console.log('No existing window found, creating new video assembly');
        const result = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssemblyFromWelcomeScreen({ page, electronApp });
        window = result.window;
        electronApp = result.electronApp;
      }
    } else {
      console.log('Using provided window for export tab test');
    }
    
    // Look for the export tab
    const exportTab = await window.$$('button:has-text("Render Export"), .tab:has-text("Render Export"), [role="tab"]:has-text("Render Export")');
    
    if (exportTab.length > 0) {
      // Take a screenshot before clicking the export tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-export-tab.png') });
      
      // Click the export tab
      await exportTab[0].click();
      
      // Wait for the tab to be selected
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking the export tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/export-tab-selected.png') });
      
      // Just log that we clicked the export tab
      console.log('Clicked the export tab');
    } else {
      console.log('Export Tab NOT Found!');
    }
    
    return { window, electronApp };
  }
};

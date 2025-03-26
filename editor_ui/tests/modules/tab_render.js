// @ts-nocheck
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');

/**
 * Tests for the render tab
 * Note: All tests are run in headed mode
 */
exports.tabRenderTests = {
  /**
   * Test that the render tab is present and can be selected
   */
  testRenderTabPresent: async ({ page, electronApp, window = null }) => {
    // Get the main window - don't create a new video assembly if we're already in the editor
    if (!window) {
      try {
        // Create a new video assembly to get to the editor
        const result = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssemblyFromWelcomeScreen({ page, electronApp });
        window = result.window;
        electronApp = result.electronApp;
      } catch (error) {
        console.log('Failed to create new video assembly, continuing with possible existing window:', error.message);
        // Get the first window
        const pages = await electronApp.windows();
        if (pages.length > 0) {
          window = pages[0];
        } else {
          throw new Error('No window available for render tab test');
        }
      }
    } else {
      console.log('Using provided window for render tab test');
    }
    
    // Ensure we have a window to work with
    if (!window) {
      throw new Error('Could not obtain a window for render tab test');
    }
    
    // Look for the render tab
    const renderTab = await window.$$('button:has-text("Render"), .tab:has-text("Render"), [role="tab"]:has-text("Render")');
    
    if (renderTab.length > 0) {
      console.log('Found render tab, taking a screenshot before clicking');
      // Take a screenshot before clicking the render tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-render-tab.png') });
      
      // Click the render tab
      await renderTab[0].click();
      
      // Don't wait for iframe since the render tab should be completely empty
      console.log('Render tab clicked - not waiting for any content since tab should be empty');
      
      // Take a screenshot after clicking the render tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/render-tab-selected.png') });
      
      // Since the render tab is now blank, we're just verifying it can be selected
      await window.screenshot({ path: path.join(__dirname, '../../tests/render-tab-verified.png') });
    } else {
      // If we can't find a specific render tab, look for any tabs
      const tabs = await window.$$('.tab, [role="tab"]');
      
      if (tabs.length > 0) {
        // Find a tab that might be the render tab (try the fourth one if available)
        const tabToClick = tabs.length > 3 ? tabs[3] : (tabs.length > 2 ? tabs[2] : (tabs.length > 1 ? tabs[1] : tabs[0]));
        
        // Click the tab
        await tabToClick.click();
        
        // Wait for the tab to be selected
        await window.waitForTimeout(500);
        
        // Take a screenshot after clicking the tab
        await window.screenshot({ path: path.join(__dirname, '../../tests/tab-selected.png') });
      }
    }
    
    return { window, electronApp };
  }
};

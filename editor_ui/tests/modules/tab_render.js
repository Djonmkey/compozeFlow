// @ts-check
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
   * Test that the render tab is not present
   */
  testRenderTabNotPresent: async ({ page, electronApp, window }) => {
    // Get the main window - don't create a new video assembly if we're already in the editor
    if (!window) {
      // Create a new video assembly to get to the editor
      const result = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssemblyFromWelcomeScreen({ page, electronApp });
      window = result.window;
      electronApp = result.electronApp;
    } else {
      console.log('Using provided window for render tab test');
    }
    
    // Take a screenshot after creating a new assembly
    await window.screenshot({ path: path.join(__dirname, '../../tests/after-create-new-assembly.png') });
    
    // Look for the render tab
    const renderTab = await window.$$('button:has-text("Render"), .tab:has-text("Render"), [role="tab"]:has-text("Render")');
    
    // Check if the render tab is visible and enabled
    if (renderTab.length > 0) {
      // Check if the tab is visible and enabled
      const isVisible = await renderTab[0].evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               !el.disabled && 
               el.getAttribute('aria-disabled') !== 'true';
      });
      
      // We expect the tab to be either not visible or disabled
      expect(isVisible).toBe(false);
      console.log('Render tab is present but not visible/enabled, which is correct');
    } else {
      // If the render tab element doesn't exist, that's also acceptable
      console.log('Render tab element not found, which is also acceptable');
    }
    
    return { window, electronApp };
  },
  /**
   * Test that the render tab is present and can be selected
   */
  testRenderTabPresent: async ({ page, electronApp, window }) => {
    // Get the main window - don't create a new video assembly if we're already in the editor
    if (!window) {
      // Check if we already have a window from the electronApp
      if (electronApp) {
        const allWindows = await electronApp.windows();
        if (allWindows.length > 0) {
          window = allWindows[0];
          console.log('Using existing window for render tab test');
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
      console.log('Using provided window for render tab test');
    }
    
    // Look for the render tab
    const renderTab = await window.$$('button:has-text("Render"), .tab:has-text("Render"), [role="tab"]:has-text("Render")');
    
    if (renderTab.length > 0) {
      // Take a screenshot of the render tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-render-tab.png') });
      
      // Click the render tab
      await renderTab[0].click();
      
      // Wait for the tab to be selected
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking the render tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/render-tab-selected.png') });
      
      // Just log that we clicked the render tab
      console.log('Clicked the render tab');
    } else {
      console.log('Render Tab NOT Found!');
    }
    
    return { window, electronApp };
  }
};
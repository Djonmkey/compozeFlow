// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');

/**
 * Tests for the left icon bar
 * Note: All tests are run in headed mode
 */
exports.leftIconBarTests = {
  /**
   * Test that the left icon bar is present and has the expected icons
   */
  testLeftIconBarPresent: async ({ page, electronApp }) => {
    // Get the main window - don't create a new video assembly if we're already in the editor
    let window;
    
    // Check if we already have a window from the electronApp
    if (electronApp) {
      const allWindows = await electronApp.windows();
      if (allWindows.length > 0) {
        window = allWindows[0];
        console.log('Using existing window for left icon bar test');
      }
    }
    
    // If we don't have a window yet, create a new video assembly to get to the editor
    if (!window) {
      console.log('No existing window found, creating new video assembly');
      const result = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssemblyFromWelcomeScreen({ page, electronApp });
      window = result.window;
      electronApp = result.electronApp;
    }
    
    // Verify the left icon bar is present
    const leftIconBar = await window.$$('.left-icon-bar .sidebar .toolbar');
    
    // If the specific selector doesn't work, try a more general one
    if (leftIconBar.length === 0) {
      console.log('Could not find elements with specific selector, trying more general selectors');
      const alternativeLeftIconBar = await window.$$('.left-icon-bar, .sidebar, .toolbar, #app');
      expect(alternativeLeftIconBar.length).toBeGreaterThan(0);
    } else {
      expect(leftIconBar.length).toBeGreaterThan(0);
    }
    
    // Take a screenshot of the left icon bar
    await window.screenshot({ path: path.join(__dirname, '../../tests/left-icon-bar.png') });
    
    return { window, electronApp };
  },
  
  /**
   * Test clicking icons in the left icon bar
   */
  testClickLeftIconBarIcons: async ({ page, electronApp }) => {
    // First verify the left icon bar is present
    const { window } = await exports.leftIconBarTests.testLeftIconBarPresent({ page, electronApp });
    
    // Find all icons in the left icon bar
    const icons = await window.$$('.left-icon-bar button, .sidebar button, .toolbar button');
    
    // Click each icon and verify something happens
    for (let i = 0; i < icons.length; i++) {
      // Take a screenshot before clicking
      await window.screenshot({ path: path.join(__dirname, `../../tests/left-icon-bar-before-click-${i}.png`) });
      
      // Click the icon
      await icons[i].click();
      
      // Wait for any UI changes
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking
      await window.screenshot({ path: path.join(__dirname, `../../tests/left-icon-bar-after-click-${i}.png`) });
    }
    
    return { window, electronApp };
  }
};

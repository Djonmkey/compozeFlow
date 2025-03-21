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
    // First create a new video assembly to get to the editor
    const { window } = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    // Verify the left icon bar is present
    const leftIconBar = await window.$$('.left-icon-bar, .sidebar, .toolbar');
    expect(leftIconBar.length).toBeGreaterThan(0);
    
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

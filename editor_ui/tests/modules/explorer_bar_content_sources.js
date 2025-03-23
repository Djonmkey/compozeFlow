// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { leftIconBarTests } = require('./left_icon_bar');

/**
 * Tests for the explorer bar content sources
 * Note: All tests are run in headed mode
 */
exports.explorerBarContentSourcesTests = {
  /**
   * Test that the explorer bar content sources panel is present
   */
  testContentSourcesPanelPresent: async ({ page, electronApp }) => {
    // First get to the editor with the left icon bar
    const { window } = await leftIconBarTests.testLeftIconBarPresent({ page, electronApp });
    
    // Look for the "Add Content Source" button without clicking anything
    const addContentSourceButton = await window.$$('button:has-text("Add Content Source"), button[title*="Add Content Source"]');
    
    // Take a screenshot of the current state
    await window.screenshot({ path: path.join(__dirname, '../../tests/content-sources-panel.png') });
    
    // Verify the "Add Content Source" button is present
    console.log(`Found ${addContentSourceButton.length} "Add Content Source" buttons`);
    expect(addContentSourceButton.length).toBeGreaterThan(0);
    
    return { window, electronApp };
  },
  
  /**
   * Test navigating through content sources
   */
  testNavigateContentSources: async ({ page, electronApp }) => {
    // First get to the content sources panel
    const { window } = await exports.explorerBarContentSourcesTests.testContentSourcesPanelPresent({ page, electronApp });
    
    // Look for folders or items in the content sources panel
    const items = await window.$$('.content-sources .item, .explorer-panel .item, .file-explorer .item, .tree-item');
    
    if (items.length > 0) {
      // Click on the first item
      await items[0].click();
      
      // Wait for any UI changes
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking
      await window.screenshot({ path: path.join(__dirname, '../../tests/content-sources-item-clicked.png') });
      
      // If there are sub-items, try to expand them
      const expandIcons = await items[0].$$('.expand-icon, .collapse-icon, .arrow');
      if (expandIcons.length > 0) {
        await expandIcons[0].click();
        
        // Wait for expansion
        await window.waitForTimeout(500);
        
        // Take a screenshot after expansion
        await window.screenshot({ path: path.join(__dirname, '../../tests/content-sources-item-expanded.png') });
      }
    }
    
    return { window, electronApp };
  }
};

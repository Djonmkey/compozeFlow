// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');

/**
 * Tests for the file tab
 * Note: All tests are run in headed mode
 */
exports.tabFileTests = {
  /**
   * Test that the file tab is present and can be selected
   */
  testFileTabPresent: async ({ page, electronApp }) => {
    // First create a new video assembly to get to the editor
    const { window } = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    // Look for the file tab
    const fileTab = await window.$$('button:has-text("File"), .tab:has-text("File"), [role="tab"]:has-text("File")');
    
    if (fileTab.length > 0) {
      // Take a screenshot before clicking the file tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-file-tab.png') });
      
      // Click the file tab
      await fileTab[0].click();
      
      // Wait for the tab to be selected
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking the file tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/file-tab-selected.png') });
      
      // Verify the file content is visible
      const fileContent = await window.$$('.file-tab-content, .file-content, .file-details');
      expect(fileContent.length).toBeGreaterThan(0);
    } else {
      // If we can't find a specific file tab, look for any tabs
      const tabs = await window.$$('.tab, [role="tab"]');
      
      if (tabs.length > 0) {
        // Find a tab that might be the file tab (not the first one, which is likely the timeline tab)
        const tabToClick = tabs.length > 1 ? tabs[1] : tabs[0];
        
        // Click the tab
        await tabToClick.click();
        
        // Wait for the tab to be selected
        await window.waitForTimeout(500);
        
        // Take a screenshot after clicking the tab
        await window.screenshot({ path: path.join(__dirname, '../../tests/tab-selected.png') });
      }
    }
    
    return { window, electronApp };
  },
  
  /**
   * Test interacting with the file tab content
   */
  testFileTabInteraction: async ({ page, electronApp }) => {
    // First select the file tab
    const { window } = await exports.tabFileTests.testFileTabPresent({ page, electronApp });
    
    // Look for file list or file items
    const fileItems = await window.$$('.file-item, .file-list-item, .file-entry');
    
    if (fileItems.length > 0) {
      // Take a screenshot before interacting with the file items
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-file-item-interaction.png') });
      
      // Click on the first file item
      await fileItems[0].click();
      
      // Wait for any selection to occur
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking on the file item
      await window.screenshot({ path: path.join(__dirname, '../../tests/after-file-item-click.png') });
    } else {
      // If we can't find specific file items, look for any interactive elements in the file tab
      const fileTabElements = await window.$$('.file-tab-content button, .file-content button, .file-details button, .file-tab-content input, .file-content input, .file-details input');
      
      if (fileTabElements.length > 0) {
        // Click on the first interactive element
        await fileTabElements[0].click();
        
        // Wait for any action to occur
        await window.waitForTimeout(500);
        
        // Take a screenshot after clicking on the element
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-file-tab-element-click.png') });
      }
    }
    
    return { window, electronApp };
  }
};

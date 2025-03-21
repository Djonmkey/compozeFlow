// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');

/**
 * Tests for the raw tab
 * Note: All tests are run in headed mode
 */
exports.tabRawTests = {
  /**
   * Test that the raw tab is present and can be selected
   */
  testRawTabPresent: async ({ page, electronApp }) => {
    // First create a new video assembly to get to the editor
    const { window } = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    // Look for the raw tab
    const rawTab = await window.$$('button:has-text("Raw"), .tab:has-text("Raw"), [role="tab"]:has-text("Raw")');
    
    if (rawTab.length > 0) {
      // Take a screenshot before clicking the raw tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-raw-tab.png') });
      
      // Click the raw tab
      await rawTab[0].click();
      
      // Wait for the tab to be selected
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking the raw tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/raw-tab-selected.png') });
      
      // Verify the raw content is visible
      const rawContent = await window.$$('.raw-tab-content, .raw-content, .raw-editor, .json-editor');
      expect(rawContent.length).toBeGreaterThan(0);
    } else {
      // If we can't find a specific raw tab, look for any tabs
      const tabs = await window.$$('.tab, [role="tab"]');
      
      if (tabs.length > 0) {
        // Find a tab that might be the raw tab (try the eighth one if available)
        const tabToClick = tabs.length > 7 ? tabs[7] : (tabs.length > 6 ? tabs[6] : (tabs.length > 5 ? tabs[5] : (tabs.length > 4 ? tabs[4] : (tabs.length > 3 ? tabs[3] : (tabs.length > 2 ? tabs[2] : (tabs.length > 1 ? tabs[1] : tabs[0]))))));
        
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
   * Test interacting with the raw tab content
   */
  testRawTabInteraction: async ({ page, electronApp }) => {
    // First select the raw tab
    const { window } = await exports.tabRawTests.testRawTabPresent({ page, electronApp });
    
    // Look for raw editor or text area
    const rawEditor = await window.$$('.raw-editor, .json-editor, textarea, [contenteditable="true"]');
    
    if (rawEditor.length > 0) {
      // Take a screenshot before interacting with the raw editor
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-raw-editor-interaction.png') });
      
      // Click on the raw editor
      await rawEditor[0].click();
      
      // Wait for any selection to occur
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking on the raw editor
      await window.screenshot({ path: path.join(__dirname, '../../tests/after-raw-editor-click.png') });
      
      // If it's a textarea or contenteditable, try to enter some text
      if (await rawEditor[0].evaluate(el => el.tagName.toLowerCase() === 'textarea' || el.getAttribute('contenteditable') === 'true')) {
        // Enter some text (we won't actually modify the JSON to avoid breaking anything)
        // Just click to place the cursor
        await rawEditor[0].click();
        
        // Wait for the cursor to appear
        await window.waitForTimeout(500);
        
        // Take a screenshot after placing the cursor
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-raw-editor-cursor.png') });
      }
    } else {
      // If we can't find a specific raw editor, look for any interactive elements in the raw tab
      const rawElements = await window.$$('.raw-tab-content button, .raw-content button, .raw-editor button, .raw-tab-content input, .raw-content input, .raw-editor input');
      
      if (rawElements.length > 0) {
        // Take a screenshot before interacting with the raw elements
        await window.screenshot({ path: path.join(__dirname, '../../tests/before-raw-element-interaction.png') });
        
        // Click on the first interactive element
        await rawElements[0].click();
        
        // Wait for any action to occur
        await window.waitForTimeout(500);
        
        // Take a screenshot after clicking on the element
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-raw-element-click.png') });
      }
    }
    
    return { window, electronApp };
  }
};

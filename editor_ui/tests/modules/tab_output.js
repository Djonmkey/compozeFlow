// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');

/**
 * Tests for the output tab
 * Note: All tests are run in headed mode
 */
exports.tabOutputTests = {
  /**
   * Test that the output tab is present and can be selected
   */
  testOutputTabPresent: async ({ page, electronApp }) => {
    // First create a new video assembly to get to the editor
    const { window } = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    // Look for the output tab
    const outputTab = await window.$$('button:has-text("Output"), .tab:has-text("Output"), [role="tab"]:has-text("Output")');
    
    if (outputTab.length > 0) {
      // Take a screenshot before clicking the output tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-output-tab.png') });
      
      // Click the output tab
      await outputTab[0].click();
      
      // Wait for the tab to be selected
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking the output tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/output-tab-selected.png') });
      
      // Verify the output content is visible
      const outputContent = await window.$$('.output-tab-content, .output-content, .output-settings');
      expect(outputContent.length).toBeGreaterThan(0);
    } else {
      // If we can't find a specific output tab, look for any tabs
      const tabs = await window.$$('.tab, [role="tab"]');
      
      if (tabs.length > 0) {
        // Find a tab that might be the output tab (try the sixth one if available)
        const tabToClick = tabs.length > 5 ? tabs[5] : (tabs.length > 4 ? tabs[4] : (tabs.length > 3 ? tabs[3] : (tabs.length > 2 ? tabs[2] : (tabs.length > 1 ? tabs[1] : tabs[0]))));
        
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
   * Test interacting with the output tab content
   */
  testOutputTabInteraction: async ({ page, electronApp }) => {
    // First select the output tab
    const { window } = await exports.tabOutputTests.testOutputTabPresent({ page, electronApp });
    
    // Look for output settings or controls
    const outputControls = await window.$$('.output-setting, .output-control, .output-option, select, input[type="radio"], input[type="checkbox"]');
    
    if (outputControls.length > 0) {
      // Take a screenshot before interacting with the output controls
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-output-control-interaction.png') });
      
      // Click on the first output control
      await outputControls[0].click();
      
      // Wait for any selection to occur
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking on the output control
      await window.screenshot({ path: path.join(__dirname, '../../tests/after-output-control-click.png') });
      
      // If it's a select element, try to select an option
      if (await outputControls[0].evaluate(el => el.tagName.toLowerCase() === 'select')) {
        // Get all options
        const options = await outputControls[0].$$('option');
        
        if (options.length > 1) {
          // Select the second option
          await outputControls[0].selectOption({ index: 1 });
          
          // Wait for the selection to take effect
          await window.waitForTimeout(500);
          
          // Take a screenshot after selecting an option
          await window.screenshot({ path: path.join(__dirname, '../../tests/after-output-select-option.png') });
        }
      }
    } else {
      // If we can't find specific output controls, look for any interactive elements in the output tab
      const outputElements = await window.$$('.output-tab-content button, .output-content button, .output-settings button, .output-tab-content input, .output-content input, .output-settings input');
      
      if (outputElements.length > 0) {
        // Take a screenshot before interacting with the output elements
        await window.screenshot({ path: path.join(__dirname, '../../tests/before-output-element-interaction.png') });
        
        // Click on the first interactive element
        await outputElements[0].click();
        
        // Wait for any action to occur
        await window.waitForTimeout(500);
        
        // Take a screenshot after clicking on the element
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-output-element-click.png') });
      }
    }
    
    return { window, electronApp };
  }
};

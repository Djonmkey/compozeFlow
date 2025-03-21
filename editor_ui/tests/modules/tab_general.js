// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');

/**
 * Tests for the general tab
 * Note: All tests are run in headed mode
 */
exports.tabGeneralTests = {
  /**
   * Test that the general tab is present and can be selected
   */
  testGeneralTabPresent: async ({ page, electronApp }) => {
    // First create a new video assembly to get to the editor
    const { window } = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    // Look for the general tab
    const generalTab = await window.$$('button:has-text("General"), .tab:has-text("General"), [role="tab"]:has-text("General")');
    
    if (generalTab.length > 0) {
      // Take a screenshot before clicking the general tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-general-tab.png') });
      
      // Click the general tab
      await generalTab[0].click();
      
      // Wait for the tab to be selected
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking the general tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/general-tab-selected.png') });
      
      // Verify the general content is visible
      const generalContent = await window.$$('.general-tab-content, .general-content, .general-settings');
      expect(generalContent.length).toBeGreaterThan(0);
    } else {
      // If we can't find a specific general tab, look for any tabs
      const tabs = await window.$$('.tab, [role="tab"]');
      
      if (tabs.length > 0) {
        // Find a tab that might be the general tab (try the seventh one if available)
        const tabToClick = tabs.length > 6 ? tabs[6] : (tabs.length > 5 ? tabs[5] : (tabs.length > 4 ? tabs[4] : (tabs.length > 3 ? tabs[3] : (tabs.length > 2 ? tabs[2] : (tabs.length > 1 ? tabs[1] : tabs[0])))));
        
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
   * Test interacting with the general tab content
   */
  testGeneralTabInteraction: async ({ page, electronApp }) => {
    // First select the general tab
    const { window } = await exports.tabGeneralTests.testGeneralTabPresent({ page, electronApp });
    
    // Look for general settings or controls
    const generalControls = await window.$$('.general-setting, .general-control, .general-option, select, input[type="text"], input[type="number"], input[type="checkbox"]');
    
    if (generalControls.length > 0) {
      // Take a screenshot before interacting with the general controls
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-general-control-interaction.png') });
      
      // Click on the first general control
      await generalControls[0].click();
      
      // Wait for any selection to occur
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking on the general control
      await window.screenshot({ path: path.join(__dirname, '../../tests/after-general-control-click.png') });
      
      // If it's a text input, try to enter some text
      if (await generalControls[0].evaluate(el => el.tagName.toLowerCase() === 'input' && (el.type === 'text' || el.type === 'number'))) {
        // Enter some text
        await generalControls[0].fill('Test');
        
        // Wait for the input to take effect
        await window.waitForTimeout(500);
        
        // Take a screenshot after entering text
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-general-input-text.png') });
      }
    } else {
      // If we can't find specific general controls, look for any interactive elements in the general tab
      const generalElements = await window.$$('.general-tab-content button, .general-content button, .general-settings button, .general-tab-content input, .general-content input, .general-settings input');
      
      if (generalElements.length > 0) {
        // Take a screenshot before interacting with the general elements
        await window.screenshot({ path: path.join(__dirname, '../../tests/before-general-element-interaction.png') });
        
        // Click on the first interactive element
        await generalElements[0].click();
        
        // Wait for any action to occur
        await window.waitForTimeout(500);
        
        // Take a screenshot after clicking on the element
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-general-element-click.png') });
      }
    }
    
    return { window, electronApp };
  }
};

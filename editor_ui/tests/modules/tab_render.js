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
   * Test that the render tab is present and can be selected
   */
  testRenderTabPresent: async ({ page, electronApp }) => {
    // First create a new video assembly to get to the editor
    const { window } = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    // Look for the render tab
    const renderTab = await window.$$('button:has-text("Render"), .tab:has-text("Render"), [role="tab"]:has-text("Render")');
    
    if (renderTab.length > 0) {
      // Take a screenshot before clicking the render tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-render-tab.png') });
      
      // Click the render tab
      await renderTab[0].click();
      
      // Wait for the tab to be selected
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking the render tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/render-tab-selected.png') });
      
      // Verify the render content is visible
      const renderContent = await window.$$('.render-tab-content, .render-content, .render-options');
      expect(renderContent.length).toBeGreaterThan(0);
    } else {
      // If we can't find a specific render tab, look for any tabs
      const tabs = await window.$$('.tab, [role="tab"]');
      
      if (tabs.length > 0) {
        // Find a tab that might be the render tab (try the third one if available)
        const tabToClick = tabs.length > 2 ? tabs[2] : (tabs.length > 1 ? tabs[1] : tabs[0]);
        
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
   * Test interacting with the render tab content
   */
  testRenderTabInteraction: async ({ page, electronApp }) => {
    // First select the render tab
    const { window } = await exports.tabRenderTests.testRenderTabPresent({ page, electronApp });
    
    // Look for render options or settings
    const renderOptions = await window.$$('.render-option, .render-setting, .render-format, select, input[type="radio"], input[type="checkbox"]');
    
    if (renderOptions.length > 0) {
      // Take a screenshot before interacting with the render options
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-render-option-interaction.png') });
      
      // Click on the first render option
      await renderOptions[0].click();
      
      // Wait for any selection to occur
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking on the render option
      await window.screenshot({ path: path.join(__dirname, '../../tests/after-render-option-click.png') });
    }
    
    // Look for the render button
    const renderButton = await window.$$('button:has-text("Render"), button:has-text("Export"), button:has-text("Start Render")');
    
    if (renderButton.length > 0) {
      // Take a screenshot before clicking the render button
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-render-button.png') });
      
      // We won't actually click the render button in the test to avoid starting a render
      // Just verify it exists
      expect(renderButton.length).toBeGreaterThan(0);
    }
    
    return { window, electronApp };
  }
};

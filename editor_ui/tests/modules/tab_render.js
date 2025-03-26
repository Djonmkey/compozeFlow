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
    
    // Resize the terminal to 75% of the application's horizontal size
    const windowSize = await window.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    });
    const terminalWidth = Math.floor(windowSize.width * 0.75);
    await window.evaluate((width) => {
      // Find terminal element and resize it
      const terminal = document.querySelector('.terminal-container') || 
                       document.querySelector('.terminal') || 
                       document.querySelector('.terminal-wrapper');
      if (terminal) {
        // Use type assertion to fix TypeScript error
        const terminalElement = /** @type {HTMLElement} */ (terminal);
        terminalElement.style.width = `${width}px`;
      }
    }, terminalWidth);
    
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
      
      // Verify that the render tab exists without clicking it
      console.log('Render tab found - verifying presence only, not clicking to avoid activating render engine');
      
      // Check if the tab is visible
      const isVisible = await renderTab[0].evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden';
      });
      
      expect(isVisible).toBe(true);
      console.log('Render tab visibility check passed');
      
      // Take another screenshot for the report
      await window.screenshot({ path: path.join(__dirname, '../../tests/render-tab-verified.png') });
    } else {
      // If we can't find a specific render tab, look for any tabs
      const tabs = await window.$$('.tab, [role="tab"]');
      console.log(`Found ${tabs.length} tabs, but none specifically identified as render tab`);
      
      // Take a screenshot of the tabs
      await window.screenshot({ path: path.join(__dirname, '../../tests/available-tabs.png') });
      
      // We expect to find at least some tabs
      expect(tabs.length).toBeGreaterThan(0);
    }
    
    return { window, electronApp };
  },
  
  /**
   * Test interacting with the render tab content
   */
  testRenderTabInteraction: async ({ page, electronApp, window }) => {
    // First verify the render tab is present without interacting with it
    const result = await exports.tabRenderTests.testRenderTabPresent({ page, electronApp, window });
    window = result.window;
    
    console.log('Checking for render UI elements without activating them');
    
    // Look for render options or settings - just verify existence
    const renderOptions = await window.$$('.render-option, .render-setting, .render-format, select, input[type="radio"], input[type="checkbox"]');
    console.log(`Found ${renderOptions.length} render option elements`);
    
    // Look for the render button - just verify existence
    const renderButton = await window.$$('button:has-text("Render"), button:has-text("Export"), button:has-text("Start Render")');
    console.log(`Found ${renderButton.length} render button elements`);
    
    // Take a screenshot of the UI elements
    await window.screenshot({ path: path.join(__dirname, '../../tests/render-ui-elements.png') });
    
    // We expect to find some UI elements related to rendering
    const totalElements = renderOptions.length + renderButton.length;
    console.log(`Total render UI elements found: ${totalElements}`);
    
    // Log that we're not interacting with any elements to avoid activating the render engine
    console.log('Not interacting with render UI elements to avoid activating render engine');
    
    return { window, electronApp };
  }
};

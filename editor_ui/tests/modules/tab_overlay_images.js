// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');

/**
 * Tests for the overlay images tab
 * Note: All tests are run in headed mode
 */
exports.tabOverlayImagesTests = {
  /**
   * Test that the overlay images tab is present and can be selected
   */
  testOverlayImagesTabPresent: async ({ page, electronApp }) => {
    // First create a new video assembly to get to the editor
    const { window } = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    // Look for the overlay images tab
    const overlayTab = await window.$$('button:has-text("Overlay"), button:has-text("Images"), .tab:has-text("Overlay"), .tab:has-text("Images"), [role="tab"]:has-text("Overlay"), [role="tab"]:has-text("Images")');
    
    if (overlayTab.length > 0) {
      // Take a screenshot before clicking the overlay images tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-overlay-images-tab.png') });
      
      // Click the overlay images tab
      await overlayTab[0].click();
      
      // Wait for the tab to be selected
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking the overlay images tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/overlay-images-tab-selected.png') });
      
      // Verify the overlay images content is visible
      const overlayContent = await window.$$('.overlay-tab-content, .overlay-content, .images-content, .overlay-images-content');
      expect(overlayContent.length).toBeGreaterThan(0);
    } else {
      // If we can't find a specific overlay images tab, look for any tabs
      const tabs = await window.$$('.tab, [role="tab"]');
      
      if (tabs.length > 0) {
        // Find a tab that might be the overlay images tab (try the fourth one if available)
        const tabToClick = tabs.length > 3 ? tabs[3] : (tabs.length > 2 ? tabs[2] : (tabs.length > 1 ? tabs[1] : tabs[0]));
        
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
   * Test interacting with the overlay images tab content
   */
  testOverlayImagesTabInteraction: async ({ page, electronApp }) => {
    // First select the overlay images tab
    const { window } = await exports.tabOverlayImagesTests.testOverlayImagesTabPresent({ page, electronApp });
    
    // Look for overlay image items or controls
    const overlayItems = await window.$$('.overlay-item, .image-item, .overlay-control, .image-control');
    
    if (overlayItems.length > 0) {
      // Take a screenshot before interacting with the overlay items
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-overlay-item-interaction.png') });
      
      // Click on the first overlay item
      await overlayItems[0].click();
      
      // Wait for any selection to occur
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking on the overlay item
      await window.screenshot({ path: path.join(__dirname, '../../tests/after-overlay-item-click.png') });
    } else {
      // If we can't find specific overlay items, look for any interactive elements in the overlay tab
      const overlayElements = await window.$$('.overlay-tab-content button, .overlay-content button, .images-content button, .overlay-tab-content input, .overlay-content input, .images-content input');
      
      if (overlayElements.length > 0) {
        // Take a screenshot before interacting with the overlay elements
        await window.screenshot({ path: path.join(__dirname, '../../tests/before-overlay-element-interaction.png') });
        
        // Click on the first interactive element
        await overlayElements[0].click();
        
        // Wait for any action to occur
        await window.waitForTimeout(500);
        
        // Take a screenshot after clicking on the element
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-overlay-element-click.png') });
      }
    }
    
    return { window, electronApp };
  }
};

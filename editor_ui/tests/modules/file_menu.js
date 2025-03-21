// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');

/**
 * Tests for the file menu
 * Note: All tests are run in headed mode
 */
exports.fileMenuTests = {
  /**
   * Test that the file menu is present and can be opened
   */
  testFileMenuPresent: async ({ page, electronApp }) => {
    // First create a new video assembly to get to the editor
    const { window } = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    // Look for the file menu button
    const fileMenuButton = await window.$$('button:has-text("File"), .menu-bar button:first-child, .top-menu button:first-child');
    
    if (fileMenuButton.length > 0) {
      // Take a screenshot before clicking the file menu
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-file-menu.png') });
      
      // Click the file menu button
      await fileMenuButton[0].click();
      
      // Wait for the menu to appear
      await window.waitForTimeout(500);
      
      // Take a screenshot of the file menu
      await window.screenshot({ path: path.join(__dirname, '../../tests/file-menu-open.png') });
      
      // Verify the file menu is open
      const menuItems = await window.$$('.menu-item, .dropdown-item, li.menu-option');
      expect(menuItems.length).toBeGreaterThan(0);
      
      // Click outside the menu to close it
      await window.click('body', { position: { x: 10, y: 10 } });
      
      // Wait for the menu to close
      await window.waitForTimeout(500);
    } else {
      // If we can't find a specific file menu button, look for any menu bar
      const menuBar = await window.$$('.menu-bar, .top-menu, .main-menu');
      expect(menuBar.length).toBeGreaterThan(0);
    }
    
    return { window, electronApp };
  },
  
  /**
   * Test clicking items in the file menu
   */
  testFileMenuItems: async ({ page, electronApp }) => {
    // First open the file menu
    const { window } = await exports.fileMenuTests.testFileMenuPresent({ page, electronApp });
    
    // Open the file menu again
    const fileMenuButton = await window.$$('button:has-text("File"), .menu-bar button:first-child, .top-menu button:first-child');
    
    if (fileMenuButton.length > 0) {
      // Click the file menu button
      await fileMenuButton[0].click();
      
      // Wait for the menu to appear
      await window.waitForTimeout(500);
      
      // Look for the "Save" menu item
      const saveMenuItem = await window.$$('.menu-item:has-text("Save"), .dropdown-item:has-text("Save"), li.menu-option:has-text("Save")');
      
      if (saveMenuItem.length > 0) {
        // Take a screenshot before clicking Save
        await window.screenshot({ path: path.join(__dirname, '../../tests/before-save-menu-item.png') });
        
        // Click the Save menu item
        await saveMenuItem[0].click();
        
        // Wait for any dialog or action to complete
        await window.waitForTimeout(1000);
        
        // Take a screenshot after clicking Save
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-save-menu-item.png') });
      } else {
        // If we can't find the Save menu item, just click the first menu item
        const menuItems = await window.$$('.menu-item, .dropdown-item, li.menu-option');
        
        if (menuItems.length > 0) {
          // Get the text of the menu item for logging
          const menuItemText = await menuItems[0].textContent();
          
          // Take a screenshot before clicking the menu item
          await window.screenshot({ path: path.join(__dirname, '../../tests/before-menu-item-click.png') });
          
          // Click the menu item
          await menuItems[0].click();
          
          // Wait for any dialog or action to complete
          await window.waitForTimeout(1000);
          
          // Take a screenshot after clicking the menu item
          await window.screenshot({ path: path.join(__dirname, '../../tests/after-menu-item-click.png') });
        }
      }
    }
    
    return { window, electronApp };
  }
};

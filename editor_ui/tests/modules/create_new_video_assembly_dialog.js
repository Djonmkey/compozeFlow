// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const crypto = require('crypto');
const { welcomeScreenTests } = require('./welcome_screen');

/**
 * Tests for the create new video assembly dialog
 * Note: All tests are run in headed mode
 */
exports.createNewVideoAssemblyDialogTests = {
  /**
   * Test that the create new video assembly dialog loads correctly
   */
  testDialogLoads: async ({ page, electronApp }) => {
    // First click the New Video Assembly button on the welcome screen
    const { window } = await welcomeScreenTests.testClickNewVideoAssembly({ page, electronApp });
    
    // Verify dialog elements are present
    const templateDropdown = await window.$$('select, [role="combobox"]');
    expect(templateDropdown.length).toBeGreaterThan(0);
    
    const titleInput = await window.$$('input[type="text"], input:not([type])');
    expect(titleInput.length).toBeGreaterThan(0);
    
    const createButton = await window.$$('button:has-text("Create & Save As"), button:has-text("Save")');
    expect(createButton.length).toBeGreaterThan(0);
    
    return { window, electronApp };
  },
  
  /**
   * Test creating a new video assembly
   */
  testCreateNewVideoAssembly: async ({ page, electronApp }) => {
    // First load the dialog
    const { window } = await exports.createNewVideoAssemblyDialogTests.testDialogLoads({ page, electronApp });
    
    // Generate a UUID for the test
    const uuid = crypto.randomUUID();
    
    // Select "default" from the template dropdown
    const templateDropdown = await window.$$('select, [role="combobox"]');
    await templateDropdown[0].selectOption('default');
    
    // Enter a title
    const titleInput = await window.$$('input[type="text"], input:not([type])');
    await titleInput[0].fill(`Test Video ${uuid}`);
    
    // Take a screenshot before clicking Create & Save As
    await window.screenshot({ path: path.join(__dirname, '../../tests/before-create-new-assembly.png') });
    
    // Click the Create & Save As button
    const createButton = await window.$$('button:has-text("Create & Save As"), button:has-text("Save")');
    await createButton[0].click();
    
    // Wait for the editor to load
    await window.waitForTimeout(3000);
    
    // Take a screenshot after creation
    await window.screenshot({ path: path.join(__dirname, '../../tests/after-create-new-assembly.png') });
    
    // Verify the editor loaded
    const timelineElement = await window.$$('.timeline-container, .editor-container');
    expect(timelineElement.length).toBeGreaterThan(0);
    
    return { window, electronApp };
  }
};

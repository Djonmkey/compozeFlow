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
    const { electronApp: updatedElectronApp, dialogWindow } = 
      await welcomeScreenTests.testClickNewVideoAssembly({ page, electronApp });
    
    // Verify dialog elements are present
    const templateDropdown = await dialogWindow.$$('select#template-select');
    console.log(`Found ${templateDropdown.length} template dropdowns in the dialog`);
    expect(templateDropdown.length).toBeGreaterThan(0);
    
    const titleInput = await dialogWindow.$$('input#title-input');
    console.log(`Found ${titleInput.length} title inputs in the dialog`);
    expect(titleInput.length).toBeGreaterThan(0);

    const createButton = await dialogWindow.$$('button#save-btn, button#cancel-btn');
    console.log(`Found ${createButton.length} buttons in the dialog`);
    expect(createButton.length).toBeGreaterThan(0);
    
    return { window: dialogWindow, electronApp: updatedElectronApp };
  },
  
  /**
   * Test creating a new video assembly
   */
  testCreateNewVideoAssembly: async ({ page, electronApp }) => {
    // First load the dialog
    const { window: dialogWindow, electronApp: updatedElectronApp } = 
      await exports.createNewVideoAssemblyDialogTests.testDialogLoads({ page, electronApp });
    
    // Generate a UUID for the test
    const uuid = crypto.randomUUID();
    
    // Select "default" from the template dropdown
    const templateDropdown = await dialogWindow.$$('select#template-select');
    console.log(`Selecting default template from dropdown`);
    await templateDropdown[0].selectOption(0); // Select first option
    
    // Enter a title
    const titleInput = await dialogWindow.$$('input#title-input');
    console.log(`Entering title: Test Video ${uuid}`);
    await titleInput[0].fill(`Test Video ${uuid}`);
    
    // Take a screenshot before clicking Create & Save As
    await dialogWindow.screenshot({ path: path.join(__dirname, '../../tests/before-create-new-assembly.png') });
    
    // Click the Create & Save As button
    const saveButton = await dialogWindow.$$('button#save-btn');
    console.log(`Clicking Create & Save As button`);
    await saveButton[0].click();
    
    // Wait for the dialog to close and the editor to load
    await dialogWindow.waitForTimeout(3000);
    
    // Get the main window again (should be the only window after dialog closes)
    const allWindows = await updatedElectronApp.windows();
    const mainWindow = allWindows[0];
    
    // Take a screenshot after creation
    await mainWindow.screenshot({ path: path.join(__dirname, '../../tests/after-create-new-assembly.png') });
    
    // Verify the editor loaded
    const timelineElement = await mainWindow.$$('.timeline-container, .editor-container');
    console.log(`Found ${timelineElement.length} timeline elements`);
    expect(timelineElement.length).toBeGreaterThan(0);
    
    return { window: mainWindow, electronApp: updatedElectronApp };
  }
};

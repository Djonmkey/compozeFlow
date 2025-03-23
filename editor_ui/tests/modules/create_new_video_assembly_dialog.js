// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const crypto = require('crypto');
const { welcomeScreenTests } = require('./welcome_screen');
const fs = require('fs');

/**
 * Tests for the create new video assembly dialog
 * Note: All tests are run in headed mode
 */
exports.createNewVideoAssemblyDialogTests = {
  /**
   * Test that the create new video assembly dialog loads correctly from welcome screen
   */
  testDialogLoadsFromWelcomeScreen: async ({ page, electronApp }) => {
    // First load the app and get to the welcome screen
    const { window, electronApp: updatedElectronApp } = 
      await welcomeScreenTests.testWelcomeScreenLoads({ page, electronApp });
    
    // Trigger the New Video Assembly action via the File menu
    await window.evaluate(() => {
      if (window.electronSetup && window.electronSetup.ipcRenderer) {
        window.electronSetup.ipcRenderer.send('menu-action', 'new-video-assembly');
      }
    });
    
    // Wait for the dialog to appear
    await window.waitForTimeout(2000);
    
    // Get all BrowserWindow instances
    const allWindows = await updatedElectronApp.windows();
    console.log(`Found ${allWindows.length} windows`);
    
    // The template selector should be the most recently created window
    const dialogWindow = allWindows.length > 1 ? allWindows[1] : allWindows[0];
    
    // Take a screenshot of the dialog window
    await dialogWindow.screenshot({ path: path.join(__dirname, '../../tests/new-video-assembly-dialog.png') });
    
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
    
    return { window: dialogWindow, mainWindow: window, electronApp: updatedElectronApp };
  },
  
  /**
   * Test that the create new video assembly dialog loads correctly from file menu
   */
  testDialogLoadsFromFileMenu: async ({ page, electronApp }) => {
    // First launch the app
    if (!electronApp) {
      electronApp = await electron.launch({
        args: [path.join(__dirname, '../..')],
        env: {
          NODE_ENV: 'development'
        }
      });
    }
    
    // Get the first window
    const window = await electronApp.firstWindow();
    
    // Wait for the window to load
    await window.waitForLoadState('domcontentloaded');
    await window.waitForTimeout(2000);
    
    // Open an existing video assembly file
    const videoAssemblyPath = path.join(__dirname, '../../video_assemblies/example_video_assembly.json');
    
    // Check if the file exists
    if (!fs.existsSync(videoAssemblyPath)) {
      console.log('Example video assembly file not found, using File->New Video Assembly directly');
    } else {
      // Load the file via IPC
      await window.evaluate((filePath) => {
        if (window.electronSetup && window.electronSetup.ipcRenderer) {
          // First clear any existing data
          window.videoAssemblyManager.clearVideoAssemblyData();
          
          // Read the file and parse it
          const fs = window.electronSetup.fs;
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          
          // Load the data
          window.videoAssemblyManager.handleVideoAssemblyData(data);
          window.videoAssemblyManager.setCurrentVideoAssemblyPath(filePath);
        }
      }, videoAssemblyPath);
      
      // Wait for the file to load
      await window.waitForTimeout(1000);
    }
    
    // Trigger the New Video Assembly action via the File menu
    await window.evaluate(() => {
      if (window.electronSetup && window.electronSetup.ipcRenderer) {
        window.electronSetup.ipcRenderer.send('menu-action', 'new-video-assembly');
      }
    });
    
    // Wait for the dialog to appear
    await window.waitForTimeout(2000);
    
    // Get all BrowserWindow instances
    const allWindows = await electronApp.windows();
    console.log(`Found ${allWindows.length} windows`);
    
    // The template selector should be the most recently created window
    const dialogWindow = allWindows.length > 1 ? allWindows[1] : allWindows[0];
    
    // Take a screenshot of the dialog window
    await dialogWindow.screenshot({ path: path.join(__dirname, '../../tests/new-video-assembly-dialog-from-file-menu.png') });
    
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
    
    return { window: dialogWindow, mainWindow: window, electronApp: electronApp };
  },
  
  /**
   * Common function to complete the new video assembly creation process
   */
  completeNewVideoAssemblyCreation: async (dialogWindow, electronApp) => {
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
    const allWindows = await electronApp.windows();
    const mainWindow = allWindows[0];
    
    // Take a screenshot after creation
    await mainWindow.screenshot({ path: path.join(__dirname, '../../tests/after-create-new-assembly.png') });
    
    // Verify the editor loaded
    const timelineElement = await mainWindow.$$('.timeline-container, .editor-container');
    console.log(`Found ${timelineElement.length} timeline elements`);
    expect(timelineElement.length).toBeGreaterThan(0);
    
    return { window: mainWindow, electronApp: electronApp };
  },
  
  /**
   * Test creating a new video assembly from the welcome screen
   */
  testCreateNewVideoAssemblyFromWelcomeScreen: async ({ page, electronApp }) => {
    // First load the dialog from welcome screen
    const { window: dialogWindow, electronApp: updatedElectronApp } = 
      await exports.createNewVideoAssemblyDialogTests.testDialogLoadsFromWelcomeScreen({ page, electronApp });
    
    // Complete the creation process
    return await exports.createNewVideoAssemblyDialogTests.completeNewVideoAssemblyCreation(dialogWindow, updatedElectronApp);
  },
  
  /**
   * Test creating a new video assembly from the file menu
   */
  testCreateNewVideoAssemblyFromFileMenu: async ({ page, electronApp }) => {
    // First load the dialog from file menu
    const { window: dialogWindow, electronApp: updatedElectronApp } = 
      await exports.createNewVideoAssemblyDialogTests.testDialogLoadsFromFileMenu({ page, electronApp });
    
    // Complete the creation process
    return await exports.createNewVideoAssemblyDialogTests.completeNewVideoAssemblyCreation(dialogWindow, updatedElectronApp);
  }
};

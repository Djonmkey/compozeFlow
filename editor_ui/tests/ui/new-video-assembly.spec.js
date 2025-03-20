const { test, expect } = require('../fixtures');
const { generateUUID, fileExists, cleanupTestFile, getVideoAssembliesDir } = require('../utils');
const path = require('path');
const fs = require('fs');

test.describe('New Video Assembly', () => {
  let uuid;
  let filePath;
  let videoAssembliesDir;

  test.beforeEach(() => {
    // Generate a new UUID for each test
    uuid = generateUUID();
    
    // Create video_assemblies directory if it doesn't exist
    videoAssembliesDir = path.join(__dirname, '../../video_assemblies');
    if (!fs.existsSync(videoAssembliesDir)) {
      fs.mkdirSync(videoAssembliesDir, { recursive: true });
    }
    
    filePath = path.join(videoAssembliesDir, `${uuid}.json`);
    console.log(`Test will create file: ${filePath}`);
  });

  test.afterEach(() => {
    // Clean up the test file
    if (fs.existsSync(filePath)) {
      console.log(`Cleaning up test file: ${filePath}`);
      fs.unlinkSync(filePath);
    }
  });

  test('should create a new video assembly with default template', async ({ window }) => {
    console.log('Starting test: create new video assembly');
    
    // Take a screenshot of the initial state
    await window.screenshot({ path: path.join(__dirname, '../../tests/initial-state.png') });
    console.log('Initial screenshot taken');
    
    // Click on "New Video Assembly" button or menu item
    console.log('Looking for File menu');
    
    // Take a screenshot to see what's available
    await window.screenshot({ path: path.join(__dirname, '../../tests/before-file-menu.png') });
    
    // Try different approaches to find and click on menu items
    try {
      // First approach: Try to use keyboard shortcuts
      console.log('Trying keyboard shortcut Alt+F for File menu');
      await window.keyboard.press('Alt+F');
      await window.waitForTimeout(1000);
      
      // Take a screenshot after Alt+F
      await window.screenshot({ path: path.join(__dirname, '../../tests/after-alt-f.png') });
      
      // Try to find New Video Assembly in the menu
      const menuItems = await window.$$('text=/New Video Assembly|New/');
      if (menuItems.length > 0) {
        console.log('Found menu item, clicking it');
        await menuItems[0].click();
      } else {
        // If keyboard shortcut didn't work, try clicking on File menu
        console.log('Menu item not found after keyboard shortcut, trying to click File menu');
        
        // Press Escape to close any open menu
        await window.keyboard.press('Escape');
        await window.waitForTimeout(500);
        
        // Try to find the File menu
        const fileMenu = await window.$$('text=File');
        if (fileMenu.length > 0) {
          console.log('Found File menu, clicking it');
          await fileMenu[0].click();
          
          // Wait a moment for the menu to appear
          await window.waitForTimeout(1000);
          
          // Take a screenshot with the menu open
          await window.screenshot({ path: path.join(__dirname, '../../tests/file-menu-open.png') });
          
          // Try different selectors for the New Video Assembly menu item
          const selectors = [
            'text=New Video Assembly',
            'text=New',
            'text=/New.*/i',
            '.menu-item:has-text("New")',
            'li:has-text("New")'
          ];
          
          let found = false;
          for (const selector of selectors) {
            console.log(`Trying selector: ${selector}`);
            const items = await window.$$(selector);
            if (items.length > 0) {
              console.log(`Found ${items.length} items with selector ${selector}`);
              await items[0].click();
              found = true;
              break;
            }
          }
          
          if (!found) {
            console.log('New Video Assembly menu item not found with any selector');
            throw new Error('New Video Assembly menu item not found');
          }
        } else {
          console.log('File menu not found');
          throw new Error('File menu not found');
        }
      }
    } catch (error) {
      console.log('Error in menu navigation:', error);
      
      // As a last resort, try to find a New Video Assembly button
      console.log('Looking for New Video Assembly button');
      const newAssemblyButton = await window.$$('button:has-text("New")');
      if (newAssemblyButton.length > 0) {
        console.log('Found button, clicking it');
        await newAssemblyButton[0].click();
      } else {
        console.log('New Video Assembly button not found');
        throw new Error('Could not find any way to create a new video assembly');
      }
    } else {
      console.log('File menu not found, looking for New Video Assembly button');
      
      // Try to find a New Video Assembly button
      const newAssemblyButton = await window.$$('button:has-text("New Video Assembly")');
      if (newAssemblyButton.length > 0) {
        console.log('Found New Video Assembly button, clicking it');
        await newAssemblyButton[0].click();
      } else {
        console.log('New Video Assembly button not found');
        throw new Error('Neither File menu nor New Video Assembly button found');
      }
    }
    
    // Wait for template selector dialog
    console.log('Waiting for template selector dialog');
    await window.waitForSelector('text=Select a Template', { timeout: 10000 });
    
    // Take a screenshot of the template selector
    await window.screenshot({ path: path.join(__dirname, '../../tests/template-selector.png') });
    console.log('Template selector screenshot taken');
    
    // Select the "default" template
    console.log('Selecting default template');
    const defaultTemplate = await window.$$('text=default');
    if (defaultTemplate.length > 0) {
      console.log('Found default template by text');
      await defaultTemplate[0].click();
    } else {
      console.log('Default template not found by text, selecting first template');
      // If not found by name, select the first template in the list
      await window.click('.template-item >> nth=0');
    }
    
    // Enter the UUID as the title
    console.log(`Entering UUID as title: ${uuid}`);
    await window.fill('input[name="title"]', uuid);
    
    // Take a screenshot before clicking Save
    await window.screenshot({ path: path.join(__dirname, '../../tests/before-save.png') });
    console.log('Before save screenshot taken');
    
    // Click Save button
    console.log('Clicking Save button');
    await window.click('button:has-text("Save")');
    
    // Wait for the save dialog and file selection
    console.log('Waiting for save dialog');
    
    // We need to handle the native file dialog, but Playwright can't interact with it directly
    // Instead, we'll wait for a reasonable amount of time and then check if the file was created
    await window.waitForTimeout(5000);
    
    // Take a screenshot after save dialog
    await window.screenshot({ path: path.join(__dirname, '../../tests/after-save-dialog.png') });
    console.log('After save dialog screenshot taken');
    
    // Verify the file was created
    const fileCreated = fs.existsSync(filePath);
    console.log(`File created check: ${fileCreated}`);
    
    // Take a final screenshot
    await window.screenshot({ path: path.join(__dirname, '../../tests/final-state.png') });
    console.log('Final screenshot taken');
    
    console.log(`Test completed. File created: ${filePath}`);
    
    // Assert that the file was created
    expect(fileCreated).toBeTruthy();
  });
});

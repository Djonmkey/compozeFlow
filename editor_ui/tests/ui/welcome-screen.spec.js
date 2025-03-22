const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const crypto = require('crypto');

test('should click New Video Assembly from welcome screen', async () => {
  console.log('Starting test: click New Video Assembly from welcome screen');
  
  // Generate a UUID for the test
  const uuid = crypto.randomUUID();
  console.log(`Generated UUID: ${uuid}`);
  
  try {
    // Launch Electron app with specific window size
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../..')],
      env: {
        NODE_ENV: 'development'
      }
    });
    
    console.log('Electron app launched');
    
    // Get the first window
    const window = await electronApp.firstWindow();
    
    // Set window size to 1024x768
    await window.setViewportSize({ width: 1024, height: 768 });
    console.log('Window size set to 1024x768');
    
    // Wait for the window to load
    await window.waitForLoadState('domcontentloaded');
    console.log('Window loaded');
    
    // Toggle off developer tools if they're open
    try {
      await window.evaluate(() => {
        if (window.electronAPI && window.electronAPI.toggleDevTools) {
          // Check if DevTools are open and close them if they are
          const devToolsOpen = window.document.title.includes('DevTools');
          if (devToolsOpen) {
            window.electronAPI.toggleDevTools();
          }
        }
      });
      console.log('Developer tools toggled off if they were open');
    } catch (error) {
      console.log('Error toggling developer tools:', error);
    }
    
    // Take a screenshot of the initial state
    await window.screenshot({ path: path.join(__dirname, '../../tests/welcome-screen.png') });
    console.log('Welcome screen screenshot taken');
    
    // Wait for 5 seconds
    console.log('Waiting 5 seconds after launch');
    await window.waitForTimeout(5000);
    
    // Verify welcome screen header is present
    const welcomeHeader = await window.$$('h1:has-text("Welcome to compozeFlow"), h2:has-text("Welcome to compozeFlow")');
    expect(welcomeHeader.length).toBeGreaterThan(0);
    console.log('Welcome header verified');
    
    // Look for the "New Video Assembly" button on the welcome screen
    console.log('Looking for New Video Assembly button');
    
    // Take another screenshot to see what's available
    await window.screenshot({ path: path.join(__dirname, '../../tests/before-click.png') });
    
    // Try to find and click the New Video Assembly button
    const newAssemblyButton = await window.$$('button:has-text("New Video Assembly")');
    if (newAssemblyButton.length > 0) {
      console.log('Found New Video Assembly button, clicking it');
      await newAssemblyButton[0].click();
    } else {
      console.log('Button not found by text, trying to find by other means');
      
      // Try to find by any text containing "New"
      const newButtons = await window.$$('button:has-text("New")');
      if (newButtons.length > 0) {
        console.log('Found button with "New" text, clicking it');
        await newButtons[0].click();
      } else {
        console.log('No buttons with "New" text found');
        throw new Error('Could not find New Video Assembly button');
      }
    }
    
    // Wait for 5 seconds after clicking the button
    console.log('Waiting 5 seconds after clicking New Video Assembly');
    await window.waitForTimeout(5000);
    
    // Take a screenshot to see if the dialog appeared
    await window.screenshot({ path: path.join(__dirname, '../../tests/create-dialog.png') });
    console.log('Create dialog screenshot taken');
    
    // Look for the "From Template" dropdown
    console.log('Looking for From Template dropdown');
    const templateDropdown = await window.$$('select, [role="combobox"]');
    if (templateDropdown.length > 0) {
      console.log('Found template dropdown, selecting "default"');
      
      // Select "default" from the dropdown
      await templateDropdown[0].selectOption('default');
      
      // Or try clicking and then selecting if the above doesn't work
      if (!(await templateDropdown[0].evaluate(el => el.value === 'default'))) {
        await templateDropdown[0].click();
        await window.waitForTimeout(500);
        await window.click('text=default');
      }
    } else {
      console.log('Template dropdown not found');
    }
    
    // Look for the "Video Title" text box
    console.log('Looking for Video Title text box');
    const titleInput = await window.$$('input[type="text"], input:not([type])');
    if (titleInput.length > 0) {
      console.log(`Found title input, entering UUID: ${uuid}`);
      await titleInput[0].fill(uuid);
    } else {
      console.log('Title input not found');
    }
    
    // Take a screenshot before clicking Create & Save As
    await window.screenshot({ path: path.join(__dirname, '../../tests/before-create.png') });
    console.log('Before create screenshot taken');
    
    // Look for the "Create & Save As" button
    console.log('Looking for Create & Save As button');
    const createButton = await window.$$('button:has-text("Create & Save As"), button:has-text("Save")');
    if (createButton.length > 0) {
      console.log('Found create button, clicking it');
      await createButton[0].click();
    } else {
      console.log('Create button not found');
    }
    
    // Wait for 5 seconds after clicking Create & Save As
    console.log('Waiting 5 seconds after clicking Create & Save As');
    await window.waitForTimeout(5000);
    
    // Take a final screenshot
    await window.screenshot({ path: path.join(__dirname, '../../tests/after-create.png') });
    console.log('Final screenshot taken');
    
    // Close the app
    await electronApp.close();
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test error:', error);
    throw error;
  }
});

test('should click Open Video Assembly from welcome screen', async () => {
  console.log('Starting test: click Open Video Assembly from welcome screen');
  
  try {
    // Launch Electron app with specific window size
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../..')],
      env: {
        NODE_ENV: 'development'
      }
    });
    
    console.log('Electron app launched');
    
    // Get the first window
    const window = await electronApp.firstWindow();
    
    // Set window size to 1024x768
    await window.setViewportSize({ width: 1024, height: 768 });
    console.log('Window size set to 1024x768');
    
    // Wait for the window to load
    await window.waitForLoadState('domcontentloaded');
    console.log('Window loaded');
    
    // Toggle off developer tools if they're open
    try {
      await window.evaluate(() => {
        if (window.electronAPI && window.electronAPI.toggleDevTools) {
          // Check if DevTools are open and close them if they are
          const devToolsOpen = window.document.title.includes('DevTools');
          if (devToolsOpen) {
            window.electronAPI.toggleDevTools();
          }
        }
      });
      console.log('Developer tools toggled off if they were open');
    } catch (error) {
      console.log('Error toggling developer tools:', error);
    }
    
    // Take a screenshot of the initial state
    await window.screenshot({ path: path.join(__dirname, '../../tests/welcome-screen-open.png') });
    console.log('Welcome screen screenshot taken');
    
    // Wait for 5 seconds
    console.log('Waiting 5 seconds after launch');
    await window.waitForTimeout(5000);
    
    // Verify welcome screen header is present
    const welcomeHeader = await window.$$('h1:has-text("Welcome to compozeFlow"), h2:has-text("Welcome to compozeFlow")');
    expect(welcomeHeader.length).toBeGreaterThan(0);
    console.log('Welcome header verified');
    
    // Look for the "Open Video Assembly" button on the welcome screen
    console.log('Looking for Open Video Assembly button');
    
    // Take another screenshot to see what's available
    await window.screenshot({ path: path.join(__dirname, '../../tests/before-open-click.png') });
    
    // Try to find and click the Open Video Assembly button
    const openAssemblyButton = await window.$$('button:has-text("Open Video Assembly")');
    if (openAssemblyButton.length > 0) {
      console.log('Found Open Video Assembly button, clicking it');
      await openAssemblyButton[0].click();
    } else {
      console.log('Button not found by text, trying to find by other means');
      
      // Try to find by any text containing "Open"
      const openButtons = await window.$$('button:has-text("Open")');
      if (openButtons.length > 0) {
        console.log('Found button with "Open" text, clicking it');
        await openButtons[0].click();
      } else {
        console.log('No buttons with "Open" text found');
        throw new Error('Could not find Open Video Assembly button');
      }
    }
    
    // Wait for 5 seconds after clicking the button
    console.log('Waiting 5 seconds after clicking Open Video Assembly');
    await window.waitForTimeout(5000);
    
    // Take a screenshot to see if the dialog appeared
    await window.screenshot({ path: path.join(__dirname, '../../tests/open-dialog.png') });
    console.log('Open dialog screenshot taken');
    
    // Close the app
    await electronApp.close();
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test error:', error);
    throw error;
  }
});

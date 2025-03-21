// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');

/**
 * Tests for the welcome screen
 * Note: All tests are run in headed mode
 */
exports.welcomeScreenTests = {
  /**
   * Test that the welcome screen loads correctly
   */
  testWelcomeScreenLoads: async ({ page, electronApp }) => {
    // Launch Electron app if not already launched
    if (!electronApp) {
      electronApp = await electron.launch({
        args: [path.join(__dirname, '../..')],
        env: {
          NODE_ENV: 'test'
        }
      });
    }
    
    // Get the first window
    const window = await electronApp.firstWindow();
    
    // Wait for the window to load
    await window.waitForLoadState('domcontentloaded');
    
    // Take a screenshot of the welcome screen
    await window.screenshot({ path: path.join(__dirname, '../../tests/welcome-screen-test.png') });
    
    // Verify welcome screen header is present
    const welcomeHeader = await window.$$('h1:has-text("Welcome to compozeFlow"), h2:has-text("Welcome to compozeFlow")');
    expect(welcomeHeader.length).toBeGreaterThan(0);
    
    // Verify welcome screen buttons are present
    const newAssemblyButton = await window.$$('button:has-text("New Video Assembly")');
    expect(newAssemblyButton.length).toBeGreaterThan(0);
    
    const openAssemblyButton = await window.$$('button:has-text("Open Video Assembly")');
    expect(openAssemblyButton.length).toBeGreaterThan(0);
    
    return { window, electronApp };
  },
  
  /**
   * Test clicking the New Video Assembly button
   */
  testClickNewVideoAssembly: async ({ page, electronApp }) => {
    // First load the welcome screen
    const { window } = await exports.welcomeScreenTests.testWelcomeScreenLoads({ page, electronApp });
    
    // Find and click the New Video Assembly button
    const newAssemblyButton = await window.$$('button:has-text("New Video Assembly")');
    await newAssemblyButton[0].click();
    
    // Wait for the dialog to appear
    await window.waitForTimeout(1000);
    
    // Take a screenshot to verify the dialog appeared
    await window.screenshot({ path: path.join(__dirname, '../../tests/new-video-assembly-dialog.png') });
    
    // Verify the dialog elements are present
    const createButton = await window.$$('button:has-text("Create & Save As"), button:has-text("Save")');
    expect(createButton.length).toBeGreaterThan(0);
    
    return { window, electronApp };
  },
  
  /**
   * Test clicking the Open Video Assembly button
   */
  testClickOpenVideoAssembly: async ({ page, electronApp }) => {
    // First load the welcome screen
    const { window } = await exports.welcomeScreenTests.testWelcomeScreenLoads({ page, electronApp });
    
    // Find and click the Open Video Assembly button
    const openAssemblyButton = await window.$$('button:has-text("Open Video Assembly")');
    await openAssemblyButton[0].click();
    
    // Wait for the dialog to appear
    await window.waitForTimeout(1000);
    
    // Take a screenshot to verify the dialog appeared
    await window.screenshot({ path: path.join(__dirname, '../../tests/open-video-assembly-dialog.png') });
    
    // Verify the Open File Dialog appeared
    // Note: We can't directly check for the native file dialog, but we can check
    // that the app is in the expected state after the dialog would appear
    // This might need to be adjusted based on how the app behaves after the dialog is shown
    
    return { window, electronApp };
  },
  
  /**
   * Run all welcome screen tests
   */
  runAllTests: async ({ page, electronApp }) => {
    console.log('Starting welcome screen tests');
    
    // Launch Electron app if not already launched
    if (!electronApp) {
      electronApp = await electron.launch({
        args: [path.join(__dirname, '../..')],
        env: {
          NODE_ENV: 'test'
        }
      });
      console.log('Electron app launched');
    }
    
    try {
      // Test the welcome screen loads
      await exports.welcomeScreenTests.testWelcomeScreenLoads({ page, electronApp });
      console.log('Welcome screen load test completed successfully');
      
      // Test clicking the New Video Assembly button
      await exports.welcomeScreenTests.testClickNewVideoAssembly({ page, electronApp });
      console.log('New Video Assembly button test completed successfully');
      
      // Test clicking the Open Video Assembly button
      await exports.welcomeScreenTests.testClickOpenVideoAssembly({ page, electronApp });
      console.log('Open Video Assembly button test completed successfully');
      
      console.log('All welcome screen tests completed successfully');
    } catch (error) {
      console.error('Welcome screen test error:', error);
      throw error;
    } finally {
      // Don't close the app here, let the caller decide
    }
    
    return { electronApp };
  }
};

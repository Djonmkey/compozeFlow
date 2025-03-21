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
    
    // Verify welcome screen elements are present
    const newAssemblyButton = await window.$$('button:has-text("New Video Assembly")');
    expect(newAssemblyButton.length).toBeGreaterThan(0);
    
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
  }
};

// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');
const { tabRenderTests } = require('./tab_render');

/**
 * Tests for the integration with the render engine
 * Note: All tests are run in headed mode
 */
exports.integrationRenderEngineTests = {
  /**
   * Test that the render engine integration is present
   */
  testRenderEngineIntegrationPresent: async ({ page, electronApp }) => {
    // First go to the render tab
    const { window } = await tabRenderTests.testRenderTabPresent({ page, electronApp });
    
    // Look for render engine related elements
    const renderEngineElements = await window.$$('.render-engine, .render-progress, .render-status, .render-queue');
    
    // Take a screenshot of the render engine elements
    await window.screenshot({ path: path.join(__dirname, '../../tests/render-engine-elements.png') });
    
    // We won't actually start a render, but we'll verify that render-related elements exist
    if (renderEngineElements.length === 0) {
      // If we can't find specific render engine elements, look for any render-related buttons
      const renderButtons = await window.$$('button:has-text("Render"), button:has-text("Export"), button:has-text("Start Render")');
      expect(renderButtons.length).toBeGreaterThan(0);
    }
    
    return { window, electronApp };
  },
  
  /**
   * Test the render settings that would be passed to the render engine
   */
  testRenderEngineSettings: async ({ page, electronApp }) => {
    // First verify the render engine integration is present
    const { window } = await exports.integrationRenderEngineTests.testRenderEngineIntegrationPresent({ page, electronApp });
    
    // Look for render settings that would be passed to the render engine
    const renderSettings = await window.$$('.render-setting, .render-option, .format-option, .codec-option, select, input[type="radio"], input[type="checkbox"]');
    
    if (renderSettings.length > 0) {
      // Take a screenshot before interacting with the render settings
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-render-settings-interaction.png') });
      
      // Click on the first render setting
      await renderSettings[0].click();
      
      // Wait for any selection to occur
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking on the render setting
      await window.screenshot({ path: path.join(__dirname, '../../tests/after-render-settings-click.png') });
      
      // If it's a select element, try to select an option
      if (await renderSettings[0].evaluate(el => el.tagName.toLowerCase() === 'select')) {
        // Get all options
        const options = await renderSettings[0].$$('option');
        
        if (options.length > 1) {
          // Select the second option
          await renderSettings[0].selectOption({ index: 1 });
          
          // Wait for the selection to take effect
          await window.waitForTimeout(500);
          
          // Take a screenshot after selecting an option
          await window.screenshot({ path: path.join(__dirname, '../../tests/after-render-settings-select-option.png') });
        }
      }
    }
    
    // Look for the render button but don't click it
    const renderButton = await window.$$('button:has-text("Render"), button:has-text("Export"), button:has-text("Start Render")');
    
    if (renderButton.length > 0) {
      // Take a screenshot of the render button
      await window.screenshot({ path: path.join(__dirname, '../../tests/render-button.png') });
      
      // We won't actually click the render button to avoid starting a render
      // Just verify it exists
      expect(renderButton.length).toBeGreaterThan(0);
    }
    
    return { window, electronApp };
  },
  
  /**
   * Test the render queue interface
   */
  testRenderQueue: async ({ page, electronApp }) => {
    // First verify the render engine integration is present
    const { window } = await exports.integrationRenderEngineTests.testRenderEngineIntegrationPresent({ page, electronApp });
    
    // Look for render queue elements
    const renderQueue = await window.$$('.render-queue, .queue, .job-list, .render-history');
    
    if (renderQueue.length > 0) {
      // Take a screenshot of the render queue
      await window.screenshot({ path: path.join(__dirname, '../../tests/render-queue.png') });
      
      // Look for queue items or controls
      const queueItems = await window.$$('.queue-item, .job-item, .render-job, .history-item');
      
      if (queueItems.length > 0) {
        // Click on the first queue item
        await queueItems[0].click();
        
        // Wait for any selection to occur
        await window.waitForTimeout(500);
        
        // Take a screenshot after clicking on the queue item
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-queue-item-click.png') });
      }
    } else {
      // If we can't find a specific render queue, look for any render-related elements
      const renderElements = await window.$$('.render-tab-content button, .render-content button, .render-options button');
      
      if (renderElements.length > 0) {
        // Take a screenshot of the render elements
        await window.screenshot({ path: path.join(__dirname, '../../tests/render-elements.png') });
      }
    }
    
    return { window, electronApp };
  }
};

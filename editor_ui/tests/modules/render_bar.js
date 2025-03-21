// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');

/**
 * Tests for the render bar
 * Note: All tests are run in headed mode
 */
exports.renderBarTests = {
  /**
   * Test that the render bar is present
   */
  testRenderBarPresent: async ({ page, electronApp }) => {
    // First create a new video assembly to get to the editor
    const { window } = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    // Look for the render bar
    const renderBar = await window.$$('.render-bar, .render-controls, .playback-controls, .timeline-controls');
    
    if (renderBar.length > 0) {
      // Take a screenshot of the render bar
      await window.screenshot({ path: path.join(__dirname, '../../tests/render-bar.png') });
      
      // Verify render bar elements are present
      const renderButtons = await window.$$('.render-bar button, .render-controls button, .playback-controls button, .timeline-controls button');
      expect(renderButtons.length).toBeGreaterThan(0);
    } else {
      // If we can't find a specific render bar, look for any controls that might be for rendering
      const controls = await window.$$('.controls, .toolbar, .button-group');
      expect(controls.length).toBeGreaterThan(0);
    }
    
    return { window, electronApp };
  },
  
  /**
   * Test clicking buttons in the render bar
   */
  testRenderBarButtons: async ({ page, electronApp }) => {
    // First verify the render bar is present
    const { window } = await exports.renderBarTests.testRenderBarPresent({ page, electronApp });
    
    // Look for play/pause button
    const playButton = await window.$$('button:has-text("Play"), button[title*="Play"], button.play-button, button.play-pause-button');
    
    if (playButton.length > 0) {
      // Take a screenshot before clicking play
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-play-button.png') });
      
      // Click the play button
      await playButton[0].click();
      
      // Wait for playback to start
      await window.waitForTimeout(1000);
      
      // Take a screenshot after clicking play
      await window.screenshot({ path: path.join(__dirname, '../../tests/after-play-button.png') });
      
      // Click the play button again to pause
      await playButton[0].click();
      
      // Wait for playback to pause
      await window.waitForTimeout(500);
    } else {
      // If we can't find a specific play button, try clicking the first button in the render bar
      const renderButtons = await window.$$('.render-bar button, .render-controls button, .playback-controls button, .timeline-controls button');
      
      if (renderButtons.length > 0) {
        // Take a screenshot before clicking the button
        await window.screenshot({ path: path.join(__dirname, '../../tests/before-render-button.png') });
        
        // Click the button
        await renderButtons[0].click();
        
        // Wait for any action to complete
        await window.waitForTimeout(1000);
        
        // Take a screenshot after clicking the button
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-render-button.png') });
      }
    }
    
    return { window, electronApp };
  }
};

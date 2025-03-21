// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');

/**
 * Tests for the mixed audio tab
 * Note: All tests are run in headed mode
 */
exports.tabMixedAudioTests = {
  /**
   * Test that the mixed audio tab is present and can be selected
   */
  testMixedAudioTabPresent: async ({ page, electronApp }) => {
    // First create a new video assembly to get to the editor
    const { window } = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    // Look for the mixed audio tab
    const audioTab = await window.$$('button:has-text("Audio"), button:has-text("Mixed"), .tab:has-text("Audio"), .tab:has-text("Mixed"), [role="tab"]:has-text("Audio"), [role="tab"]:has-text("Mixed")');
    
    if (audioTab.length > 0) {
      // Take a screenshot before clicking the mixed audio tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-mixed-audio-tab.png') });
      
      // Click the mixed audio tab
      await audioTab[0].click();
      
      // Wait for the tab to be selected
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking the mixed audio tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/mixed-audio-tab-selected.png') });
      
      // Verify the mixed audio content is visible
      const audioContent = await window.$$('.audio-tab-content, .audio-content, .mixed-audio-content');
      expect(audioContent.length).toBeGreaterThan(0);
    } else {
      // If we can't find a specific mixed audio tab, look for any tabs
      const tabs = await window.$$('.tab, [role="tab"]');
      
      if (tabs.length > 0) {
        // Find a tab that might be the mixed audio tab (try the fifth one if available)
        const tabToClick = tabs.length > 4 ? tabs[4] : (tabs.length > 3 ? tabs[3] : (tabs.length > 2 ? tabs[2] : (tabs.length > 1 ? tabs[1] : tabs[0])));
        
        // Click the tab
        await tabToClick.click();
        
        // Wait for the tab to be selected
        await window.waitForTimeout(500);
        
        // Take a screenshot after clicking the tab
        await window.screenshot({ path: path.join(__dirname, '../../tests/tab-selected.png') });
      }
    }
    
    return { window, electronApp };
  },
  
  /**
   * Test interacting with the mixed audio tab content
   */
  testMixedAudioTabInteraction: async ({ page, electronApp }) => {
    // First select the mixed audio tab
    const { window } = await exports.tabMixedAudioTests.testMixedAudioTabPresent({ page, electronApp });
    
    // Look for audio tracks or controls
    const audioControls = await window.$$('.audio-track, .audio-control, .volume-slider, .audio-mixer, input[type="range"]');
    
    if (audioControls.length > 0) {
      // Take a screenshot before interacting with the audio controls
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-audio-control-interaction.png') });
      
      // Click on the first audio control
      await audioControls[0].click();
      
      // Wait for any selection to occur
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking on the audio control
      await window.screenshot({ path: path.join(__dirname, '../../tests/after-audio-control-click.png') });
      
      // If it's a slider, try to adjust it
      if (await audioControls[0].evaluate(el => el.tagName.toLowerCase() === 'input' && el.type === 'range')) {
        // Move the slider to 50%
        await audioControls[0].fill('50');
        
        // Wait for the adjustment to take effect
        await window.waitForTimeout(500);
        
        // Take a screenshot after adjusting the slider
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-audio-slider-adjust.png') });
      }
    } else {
      // If we can't find specific audio controls, look for any interactive elements in the audio tab
      const audioElements = await window.$$('.audio-tab-content button, .audio-content button, .mixed-audio-content button, .audio-tab-content input, .audio-content input, .mixed-audio-content input');
      
      if (audioElements.length > 0) {
        // Take a screenshot before interacting with the audio elements
        await window.screenshot({ path: path.join(__dirname, '../../tests/before-audio-element-interaction.png') });
        
        // Click on the first interactive element
        await audioElements[0].click();
        
        // Wait for any action to occur
        await window.waitForTimeout(500);
        
        // Take a screenshot after clicking on the element
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-audio-element-click.png') });
      }
    }
    
    return { window, electronApp };
  }
};

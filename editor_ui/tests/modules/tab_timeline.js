// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');

/**
 * Tests for the timeline tab
 * Note: All tests are run in headed mode
 */
exports.tabTimelineTests = {
  /**
   * Test that the timeline tab is present and can be selected
   */
  testTimelineTabPresent: async ({ page, electronApp }) => {
    // First create a new video assembly to get to the editor
    const { window } = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssembly({ page, electronApp });
    
    // Look for the timeline tab
    const timelineTab = await window.$$('button:has-text("Timeline"), .tab:has-text("Timeline"), [role="tab"]:has-text("Timeline")');
    
    if (timelineTab.length > 0) {
      // Take a screenshot before clicking the timeline tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-timeline-tab.png') });
      
      // Click the timeline tab
      await timelineTab[0].click();
      
      // Wait for the tab to be selected
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking the timeline tab
      await window.screenshot({ path: path.join(__dirname, '../../tests/timeline-tab-selected.png') });
      
      // Verify the timeline content is visible
      const timelineContent = await window.$$('.timeline, .timeline-container, .timeline-content');
      expect(timelineContent.length).toBeGreaterThan(0);
    } else {
      // If we can't find a specific timeline tab, look for any tabs
      const tabs = await window.$$('.tab, [role="tab"]');
      
      if (tabs.length > 0) {
        // Click the first tab
        await tabs[0].click();
        
        // Wait for the tab to be selected
        await window.waitForTimeout(500);
      } else {
        // If no tabs are found, look for the timeline directly
        const timelineContent = await window.$$('.timeline, .timeline-container, .timeline-content');
        expect(timelineContent.length).toBeGreaterThan(0);
      }
    }
    
    return { window, electronApp };
  },
  
  /**
   * Test interacting with the timeline
   */
  testTimelineInteraction: async ({ page, electronApp }) => {
    // First select the timeline tab
    const { window } = await exports.tabTimelineTests.testTimelineTabPresent({ page, electronApp });
    
    // Look for timeline tracks or clips
    const timelineTracks = await window.$$('.timeline-track, .track, .clip-container');
    
    if (timelineTracks.length > 0) {
      // Take a screenshot before interacting with the timeline
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-timeline-interaction.png') });
      
      // Click on the first track
      await timelineTracks[0].click();
      
      // Wait for any selection to occur
      await window.waitForTimeout(500);
      
      // Take a screenshot after clicking on the track
      await window.screenshot({ path: path.join(__dirname, '../../tests/after-timeline-track-click.png') });
      
      // Look for timeline clips
      const timelineClips = await window.$$('.clip, .timeline-clip, .video-clip');
      
      if (timelineClips.length > 0) {
        // Click on the first clip
        await timelineClips[0].click();
        
        // Wait for any selection to occur
        await window.waitForTimeout(500);
        
        // Take a screenshot after clicking on the clip
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-timeline-clip-click.png') });
      }
    } else {
      // If we can't find specific timeline tracks, try clicking on the timeline area
      const timelineArea = await window.$$('.timeline, .timeline-container, .timeline-content');
      
      if (timelineArea.length > 0) {
        // Click on the timeline area
        await timelineArea[0].click();
        
        // Wait for any action to occur
        await window.waitForTimeout(500);
        
        // Take a screenshot after clicking on the timeline area
        await window.screenshot({ path: path.join(__dirname, '../../tests/after-timeline-area-click.png') });
      }
    }
    
    return { window, electronApp };
  }
};

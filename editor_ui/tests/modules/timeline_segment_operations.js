// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { createNewVideoAssemblyDialogTests } = require('./create_new_video_assembly_dialog');

/**
 * Tests for the Timeline tab segment operations (add, edit, delete)
 * Note: All tests are run in headed mode
 */
exports.timelineSegmentOperationsTests = {
  /**
   * Test adding a new segment to the timeline
   */
  testAddSegmentToTimeline: async ({ page, electronApp, window }) => {
    // Get the main window - don't create a new video assembly if we're already in the editor
    if (!window) {
      // Check if we already have a window from the electronApp
      if (electronApp) {
        const allWindows = await electronApp.windows();
        if (allWindows.length > 0) {
          window = allWindows[0];
          console.log('Using existing window for add segment test');
        }
      }
      
      // If we don't have a window yet, create a new video assembly to get to the editor
      if (!window) {
        console.log('No existing window found, creating new video assembly');
        const result = await createNewVideoAssemblyDialogTests.testCreateNewVideoAssemblyFromWelcomeScreen({ page, electronApp });
        window = result.window;
        electronApp = result.electronApp;
      }
    } else {
      console.log('Using provided window for add segment test');
    }
    
    // Look for the timeline tab and select it
    const timelineTab = await window.$$('button:has-text("Timeline"), .tab:has-text("Timeline"), [role="tab"]:has-text("Timeline")');
    
    if (timelineTab.length > 0) {
      // Click the timeline tab
      await timelineTab[0].click();
      
      // Wait for the tab to be selected
      await window.waitForTimeout(500);
      
      // Take a screenshot before adding segment
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-add-segment.png') });
      
      // Look for the "Add Segment" button
      const addSegmentButton = await window.$$('button:has-text("+ Add Segment"), button.add-segment-button, [title="Add a new segment"]');
      
      if (addSegmentButton.length > 0) {
        // Click the Add Segment button
        await addSegmentButton[0].click();
        
        // Wait for the add segment dialog to appear
        await window.waitForTimeout(500);
        
        // Look for segment title input in the dialog
        const segmentTitleInput = await window.$$('input#segment-title, input[name="segmentTitle"], input[placeholder*="Segment Title"]');
        
        if (segmentTitleInput.length > 0) {
          // Enter a test segment title
          await segmentTitleInput[0].fill('Test Segment');
          
          // Look for min length input
          const minLengthInput = await window.$$('input#min-length, input[name="minLength"], input[placeholder*="Min Length"]');
          if (minLengthInput.length > 0) {
            await minLengthInput[0].fill('5');
          }
          
          // Look for max length input
          const maxLengthInput = await window.$$('input#max-length, input[name="maxLength"], input[placeholder*="Max Length"]');
          if (maxLengthInput.length > 0) {
            await maxLengthInput[0].fill('20');
          }
          
          // Take a screenshot of the dialog with entered values
          await window.screenshot({ path: path.join(__dirname, '../../tests/add-segment-dialog.png') });
          
          // Look for the save/add/confirm button
          const saveButton = await window.$$('button:has-text("Save"), button:has-text("Add"), button:has-text("OK"), button:has-text("Confirm"), button[type="submit"]');
          
          if (saveButton.length > 0) {
            // Click the save button
            await saveButton[0].click();
            
            // Wait for the segment to be added
            await window.waitForTimeout(1000);
            
            // Take a screenshot after adding segment
            await window.screenshot({ path: path.join(__dirname, '../../tests/after-add-segment.png') });
            
            // Verify the segment was added by looking for the segment title
            const segmentTitles = await window.$$('.segment-title:has-text("Test Segment"), .segment:has-text("Test Segment")');
            
            console.log('Added segment with title: Test Segment');
            expect(segmentTitles.length).toBeGreaterThan(0);
          } else {
            console.log('Save button for segment not found - this is a critical error!');
            // Fail the test with a descriptive message if the save button is not found
            expect(saveButton.length, 'Save button must be present in segment dialog').toBeGreaterThan(0);
          }
        } else {
          console.log('Segment title input in dialog not found - this is a critical error!');
          // Fail the test with a descriptive message if the segment title input is not found
          expect(segmentTitleInput.length, 'Segment title input must be present in dialog').toBeGreaterThan(0);
        }
      } else {
        console.log('Add Segment button not found - this is a critical error!');
        // Fail the test with a descriptive message if the Add Segment button is not found
        expect(addSegmentButton.length, 'Add Segment button must be present on Timeline tab').toBeGreaterThan(0);
      }
    } else {
      console.log('Timeline Tab not found - this is a critical error!');
      // Fail the test with a descriptive message if the Timeline tab is not found
      expect(timelineTab.length, 'Timeline tab must be present').toBeGreaterThan(0);
    }
    
    return { window, electronApp };
  },
  
  /**
   * Test editing a segment on the timeline
   */
  testEditSegmentOnTimeline: async ({ page, electronApp, window }) => {
    // Get the main window if not provided
    if (!window) {
      const { window: newWindow, electronApp: newElectronApp } = await exports.timelineSegmentOperationsTests.testAddSegmentToTimeline({ page, electronApp, window: null });
      window = newWindow;
      electronApp = newElectronApp;
    }
    
    // Look for a segment to edit (preferably the "Test Segment" we added)
    const testSegment = await window.$$('.segment-title:has-text("Test Segment"), .segment:has-text("Test Segment"), .segment');
    
    if (testSegment.length > 0) {
      // Take a screenshot before editing
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-edit-segment.png') });
      
      // Look for an edit button/icon on the segment
      const editButtons = await testSegment[0].$$('button.edit-segment-button, button:has-text("✏️ Edit"), button:has-text("Edit")');
      
      if (editButtons.length > 0) {
        // Click the edit button
        await editButtons[0].click();
      } else {
        // If no explicit edit button, try right-clicking the segment to see if a context menu appears
        await testSegment[0].click({ button: 'right' });
        
        // Look for edit option in context menu
        const contextMenuEditOption = await window.$$('.context-menu-item:has-text("Edit"), .menu-item:has-text("Edit")');
        
        if (contextMenuEditOption.length > 0) {
          await contextMenuEditOption[0].click();
        } else {
          // If no context menu edit option, try double-clicking the segment
          await testSegment[0].dblclick();
        }
      }
      
      // Wait for the edit dialog to appear
      await window.waitForTimeout(500);
      
      // Look for segment title input in the dialog
      const segmentTitleInput = await window.$$('input#segment-title, input[name="segmentTitle"], input[placeholder*="Segment Title"]');
      
      if (segmentTitleInput.length > 0) {
        // Update the segment title
        await segmentTitleInput[0].fill('Edited Test Segment');
        
        // Look for min length input
        const minLengthInput = await window.$$('input#min-length, input[name="minLength"], input[placeholder*="Min Length"]');
        if (minLengthInput.length > 0) {
          await minLengthInput[0].fill('10');
        }
        
        // Take a screenshot of the edit dialog
        await window.screenshot({ path: path.join(__dirname, '../../tests/edit-segment-dialog.png') });
        
        // Look for the save/update button
        const saveButton = await window.$$('button:has-text("Save"), button:has-text("Update"), button:has-text("OK"), button:has-text("Confirm"), button[type="submit"]');
        
        if (saveButton.length > 0) {
          // Click the save button
          await saveButton[0].click();
          
          // Wait for the segment to be updated
          await window.waitForTimeout(1000);
          
          // Take a screenshot after editing segment
          await window.screenshot({ path: path.join(__dirname, '../../tests/after-edit-segment.png') });
          
          // Verify the segment was updated by looking for the updated segment title
          const updatedSegmentTitles = await window.$$('.segment-title:has-text("Edited Test Segment"), .segment:has-text("Edited Test Segment")');
          
          console.log('Edited segment title to: Edited Test Segment');
          expect(updatedSegmentTitles.length).toBeGreaterThan(0);
        } else {
          console.log('Save button for edit not found - this is a critical error!');
          // Fail the test with a descriptive message if the save button is not found
          expect(saveButton.length, 'Save button must be present in edit dialog').toBeGreaterThan(0);
        }
      } else {
        console.log('Segment title input in edit dialog not found - this is a critical error!');
        // Fail the test with a descriptive message if the segment title input is not found
        expect(segmentTitleInput.length, 'Segment title input must be present in edit dialog').toBeGreaterThan(0);
      }
    } else {
      console.log('No segment found to edit - this is a critical error!');
      // Fail the test with a descriptive message if no segment is found to edit
      expect(testSegment.length, 'At least one segment must be present to edit').toBeGreaterThan(0);
    }
    
    return { window, electronApp };
  },
  
  /**
   * Test deleting a segment from the timeline
   */
  testDeleteSegmentFromTimeline: async ({ page, electronApp, window }) => {
    // Get the main window if not provided
    if (!window) {
      const { window: newWindow, electronApp: newElectronApp } = await exports.timelineSegmentOperationsTests.testEditSegmentOnTimeline({ page, electronApp, window: null });
      window = newWindow;
      electronApp = newElectronApp;
    }
    
    // Look for a segment to delete (preferably the "Edited Test Segment" we edited)
    let testSegment = await window.$$('.segment-title:has-text("Edited Test Segment"), .segment:has-text("Edited Test Segment"), .segment');
    
    if (testSegment.length === 0) {
      // If we can't find the edited segment, look for any segment
      testSegment = await window.$$('.segment');
    }
    
    if (testSegment.length > 0) {
      // Store segment text for verification
      const segmentText = await testSegment[0].textContent();
      console.log(`Found segment to delete: ${segmentText}`);
      
      // Take a screenshot before deleting
      await window.screenshot({ path: path.join(__dirname, '../../tests/before-delete-segment.png') });
      
      // Look for a delete button/icon on the segment
      const deleteButtons = await testSegment[0].$$('button.delete-segment-button, button:has-text("🗑️ Delete"), button:has-text("Delete"), button:has-text("Remove")');
      
      if (deleteButtons.length > 0) {
        // Click the delete button
        await deleteButtons[0].click();
      } else {
        // If no explicit delete button, try right-clicking the segment to see if a context menu appears
        await testSegment[0].click({ button: 'right' });
        
        // Look for delete option in context menu
        const contextMenuDeleteOption = await window.$$('.context-menu-item:has-text("Delete"), .menu-item:has-text("Delete"), .context-menu-item:has-text("Remove"), .menu-item:has-text("Remove")');
        
        if (contextMenuDeleteOption.length > 0) {
          await contextMenuDeleteOption[0].click();
        }
      }
      
      // Wait for confirmation dialog if it appears
      await window.waitForTimeout(500);
      
      // Look for a confirmation dialog and confirm deletion
      const confirmButtons = await window.$$('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("OK"), button:has-text("Delete")');
      
      if (confirmButtons.length > 0) {
        // Take a screenshot of the confirmation dialog
        await window.screenshot({ path: path.join(__dirname, '../../tests/delete-segment-confirmation.png') });
        
        // Click the confirm button
        await confirmButtons[0].click();
      }
      
      // Wait for the segment to be deleted
      await window.waitForTimeout(1000);
      
      // Take a screenshot after deleting segment
      await window.screenshot({ path: path.join(__dirname, '../../tests/after-delete-segment.png') });
      
      // Verify the segment was deleted by checking that it's no longer visible
      if (segmentText.includes('Edited Test Segment')) {
        const deletedSegments = await window.$$('.segment-title:has-text("Edited Test Segment"), .segment:has-text("Edited Test Segment")');
        console.log('Verified segment was deleted');
        expect(deletedSegments.length).toBe(0);
      }
    } else {
      console.log('No segment found to delete - this is a critical error!');
      // Fail the test with a descriptive message if no segment is found to delete
      expect(testSegment.length, 'At least one segment must be present to delete').toBeGreaterThan(0);
    }
    
    return { window, electronApp };
  },
  
  /**
   * Run all timeline segment operations tests
   */
  runAllSegmentOperationTests: async ({ page, electronApp, window }) => {
    // Add a segment to the timeline
    const addResult = await exports.timelineSegmentOperationsTests.testAddSegmentToTimeline({ page, electronApp, window });
    window = addResult.window;
    electronApp = addResult.electronApp;
    
    // Edit the segment we just added
    const editResult = await exports.timelineSegmentOperationsTests.testEditSegmentOnTimeline({ page, electronApp, window });
    window = editResult.window;
    electronApp = editResult.electronApp;
    
    // Delete the segment we just edited
    const deleteResult = await exports.timelineSegmentOperationsTests.testDeleteSegmentFromTimeline({ page, electronApp, window });
    window = deleteResult.window;
    electronApp = deleteResult.electronApp;
    
    return { window, electronApp };
  }
};

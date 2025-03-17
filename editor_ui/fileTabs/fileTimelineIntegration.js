/**
 * fileTimelineIntegration.js
 *
 * Functions for integrating files with the timeline.
 */

// Store the current video assembly data
let currentVideoAssemblyData = null;

// Import the common timeline clip operations
const timelineClipOperations = require('../timelineClipOperations');

/**
 * Resequences all timeline clips in a scene starting at 1
 * @param {Object} scene - The scene object containing timeline_clips
 */
function resequenceTimelineClips(scene) {
    if (!scene || !scene.timeline_clips || !Array.isArray(scene.timeline_clips)) {
        return;
    }
    
    // Sort the clips by their current sequence
    scene.timeline_clips.sort((a, b) => {
        const seqA = a.sequence !== undefined ? a.sequence : 9999;
        const seqB = b.sequence !== undefined ? b.sequence : 9999;
        return seqA - seqB;
    });
    
    // Resequence starting at 1
    scene.timeline_clips.forEach((clip, index) => {
        clip.sequence = index + 1;
    });
}

/**
 * Saves the video assembly data
 * @param {Object} videoAssemblyData - The video assembly data to save
 */
function saveVideoAssemblyData(videoAssemblyData) {
    // Update the global video assembly data
    if (window.currentVideoAssemblyData) {
        window.currentVideoAssemblyData = videoAssemblyData;
    }
    
    // Update the local reference
    currentVideoAssemblyData = videoAssemblyData;
    
    // Check if we're running in Electron
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        try {
            // Get the electron module
            const electron = require('electron');
            const ipcRenderer = electron.ipcRenderer;
            
            // Send the data directly to the main process for saving
            ipcRenderer.invoke('save-video-assembly-data', videoAssemblyData)
                .then((result) => {
                    if (result && result.success) {
                        console.log(`Video assembly saved to: ${result.filePath}`);
                        
                        // Update the terminal with a message
                        const terminal = document.getElementById('terminal');
                        terminal.innerHTML += `<p>Video assembly saved with updated timeline</p>`;
                    } else {
                        console.error('Error saving video assembly data:', result ? result.error : 'Unknown error');
                    }
                })
                .catch(error => {
                    console.error('Error saving video assembly data:', error);
                });
        } catch (error) {
            console.error('Error saving video assembly data:', error);
        }
    } else {
        console.log('Not running in Electron, cannot save video assembly data');
    }
}

/**
 * Switches to the Timeline tab
 */
function switchToTimelineTab() {
    const tabs = document.querySelectorAll('.tab');
    
    // Find the Timeline tab
    tabs.forEach(tab => {
        if (tab.textContent.trim() === 'Timeline') {
            // Simulate a click on the Timeline tab
            tab.click();
        }
    });
}

/**
 * Sets the current video assembly data
 * @param {Object} videoAssemblyData - The video assembly data
 */
function setCurrentVideoAssemblyData(videoAssemblyData) {
    currentVideoAssemblyData = videoAssemblyData;
    
    // Also update the global reference if it exists
    if (typeof window !== 'undefined') {
        window.currentVideoAssemblyData = videoAssemblyData;
    }
}

/**
 * Gets the current video assembly data
 * @returns {Object} - The current video assembly data
 */
function getCurrentVideoAssemblyData() {
    return currentVideoAssemblyData;
}

// Export functions
module.exports = {
    saveVideoAssemblyData,
    switchToTimelineTab,
    setCurrentVideoAssemblyData,
    getCurrentVideoAssemblyData,
    resequenceTimelineClips
};
/**
 * fileTimelineIntegration.js
 *
 * Functions for integrating files with the timeline.
 */

// Store the current video assembly data
let currentVideoAssemblyData = null;

/**
 * Adds the current file as a clip to the selected timeline
 * @param {Object} currentFile - The current file object
 */
function addClipToTimeline(currentFile) {
    // Get the current video assembly data from the window object if not available locally
    if (!currentVideoAssemblyData && window.currentVideoAssemblyData) {
        currentVideoAssemblyData = window.currentVideoAssemblyData;
    }
    
    if (!currentFile || !currentVideoAssemblyData) {
        console.error('No file or video assembly data available');
        return;
    }
    
    // Get form values
    const segmentSequence = parseInt(document.getElementById('segment-select').value);
    const sceneSequence = parseInt(document.getElementById('scene-select').value);
    
    // Get trim values
    const trimStartMinutes = document.getElementById('trim-start-minutes').value ?
        parseInt(document.getElementById('trim-start-minutes').value) : undefined;
    
    const trimStartSeconds = document.getElementById('trim-start-seconds').value ?
        parseFloat(document.getElementById('trim-start-seconds').value) : undefined;
    
    const trimEndMinutes = document.getElementById('trim-end-minutes').value ?
        parseInt(document.getElementById('trim-end-minutes').value) : undefined;
    
    const trimEndSeconds = document.getElementById('trim-end-seconds').value ?
        parseFloat(document.getElementById('trim-end-seconds').value) : undefined;
    
    // Get sequence and comments
    let clipSequence;
    const clipOrderSelect = document.getElementById('clip-order');
    
    if (clipOrderSelect.value === 'custom') {
        const customSequence = document.getElementById('custom-sequence').value;
        clipSequence = customSequence ? parseInt(customSequence) : 9999;
    } else {
        clipSequence = parseInt(clipOrderSelect.value); // Will be 0 for "Add to Front" or 9999 for "Add to End"
    }
    
    const comments = document.getElementById('clip-comments').value;
    
    // Find the segment and scene
    const segment = currentVideoAssemblyData.cut.segments.find(s => s.sequence === segmentSequence);
    if (!segment) {
        console.error('Selected segment not found');
        return;
    }
    
    const scene = segment.scenes.find(s => s.sequence === sceneSequence);
    if (!scene) {
        console.error('Selected scene not found');
        return;
    }
    
    // Ensure timeline_clips array exists
    if (!scene.timeline_clips) {
        scene.timeline_clips = [];
    }
    
    // Get the relative path from content sources
    let relativePath = currentFile.path;
    if (currentVideoAssemblyData.composeflow.org &&
        currentVideoAssemblyData.composeflow.org.settings &&
        currentVideoAssemblyData.composeflow.org.settings.common_base_file_path) {
        const basePath = currentVideoAssemblyData.composeflow.org.settings.common_base_file_path;
        if (relativePath.startsWith(basePath)) {
            relativePath = relativePath.substring(basePath.length);
        }
    }
    
    // Create the new clip object
    const newClip = {
        sequence: clipSequence,
        path: relativePath
    };
    
    // Add optional fields if they exist
    if (trimStartMinutes !== undefined) {
        newClip.trim_start_minutes = trimStartMinutes;
    }
    
    if (trimStartSeconds !== undefined) {
        newClip.trim_start_seconds = trimStartSeconds;
    }
    
    if (trimEndMinutes !== undefined) {
        newClip.trim_end_minutes = trimEndMinutes;
    }
    
    if (trimEndSeconds !== undefined) {
        newClip.trim_end_seconds = trimEndSeconds;
    }
    
    if (comments) {
        newClip.comments = comments;
    }
    
    // Add the clip to the timeline
    scene.timeline_clips.push(newClip);
    
    // Resequence all timeline clips starting at 1
    resequenceTimelineClips(scene);
    
    // Save the updated video assembly data
    saveVideoAssemblyData(currentVideoAssemblyData);
    
    // Switch to the Timeline tab
    switchToTimelineTab();
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Added ${currentFile.name} to timeline in segment ${segmentSequence}, scene ${sceneSequence}</p>`;
}

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
    addClipToTimeline,
    saveVideoAssemblyData,
    switchToTimelineTab,
    setCurrentVideoAssemblyData,
    getCurrentVideoAssemblyData,
    resequenceTimelineClips
};
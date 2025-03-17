/**
 * timelineClipOperations.js
 *
 * Common operations for timeline clips (create, edit, delete)
 */

// Import required modules
const { saveVideoAssemblyData, resequenceTimelineClips } = require('./fileTabs/fileTimelineIntegration');

/**
 * Adds a clip to the timeline
 * @param {Object} currentFile - The current file object
 * @param {Object} formData - The form data for the clip
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {boolean} - Whether the operation was successful
 */
function addClipToTimeline(currentFile, formData, videoAssemblyData) {
    if (!currentFile || !videoAssemblyData) {
        console.error('No file or video assembly data available');
        return false;
    }
    
    // Extract form data
    const segmentSequence = parseInt(formData.segmentSequence);
    const sceneSequence = parseInt(formData.sceneSequence);
    
    // Get trim values
    const trimStartMinutes = formData.trimStartMinutes !== undefined && formData.trimStartMinutes !== '' ?
        parseInt(formData.trimStartMinutes) : undefined;
    
    const trimStartSeconds = formData.trimStartSeconds !== undefined && formData.trimStartSeconds !== '' ?
        parseFloat(formData.trimStartSeconds) : undefined;
    
    const trimEndMinutes = formData.trimEndMinutes !== undefined && formData.trimEndMinutes !== '' ?
        parseInt(formData.trimEndMinutes) : undefined;
    
    const trimEndSeconds = formData.trimEndSeconds !== undefined && formData.trimEndSeconds !== '' ?
        parseFloat(formData.trimEndSeconds) : undefined;
    
    // Get sequence and comments
    let clipSequence;
    if (formData.clipOrder === 'custom') {
        clipSequence = formData.customSequence ? parseInt(formData.customSequence) : 9999;
    } else {
        clipSequence = parseInt(formData.clipOrder); // Will be 0 for "Add to Front" or 9999 for "Add to End"
    }
    
    const comments = formData.comments;
    
    // Find the segment and scene
    const segment = videoAssemblyData.cut.segments.find(s => s.sequence === segmentSequence);
    if (!segment) {
        console.error('Selected segment not found');
        return false;
    }
    
    const scene = segment.scenes.find(s => s.sequence === sceneSequence);
    if (!scene) {
        console.error('Selected scene not found');
        return false;
    }
    
    // Ensure timeline_clips array exists
    if (!scene.timeline_clips) {
        scene.timeline_clips = [];
    }
    
    // Get the relative path from content sources
    let relativePath = currentFile.path;
    if (videoAssemblyData.composeflow &&
        videoAssemblyData.composeflow.settings &&
        videoAssemblyData.composeflow.settings.common_base_file_path) {
        const basePath = videoAssemblyData.composeflow.settings.common_base_file_path;
        if (relativePath.startsWith(basePath)) {
            relativePath = relativePath.substring(basePath.length);
        }
    } else if (videoAssemblyData['composeflow.org'] &&
        videoAssemblyData['composeflow.org'].settings &&
        videoAssemblyData['composeflow.org'].settings.common_base_file_path) {
        const basePath = videoAssemblyData['composeflow.org'].settings.common_base_file_path;
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
    saveVideoAssemblyData(videoAssemblyData);
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Added ${currentFile.name} to timeline in segment ${segmentSequence}, scene ${sceneSequence}</p>`;
    
    return true;
}

/**
 * Updates an existing clip in the timeline
 * @param {Object} clipData - The updated clip data
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {boolean} - Whether the operation was successful
 */
function updateClipInTimeline(clipData, videoAssemblyData) {
    const { segmentSequence, sceneSequence, clipSequence, clipType } = clipData;
    
    if (!videoAssemblyData || !videoAssemblyData.cut || !videoAssemblyData.cut.segments) {
        console.error('No video assembly data available');
        return false;
    }
    
    // Find the segment
    const segment = videoAssemblyData.cut.segments.find(s =>
        (s.sequence === parseInt(segmentSequence) || s.order === parseInt(segmentSequence)));
    
    if (!segment || !segment.scenes) {
        console.error(`Segment with sequence ${segmentSequence} not found`);
        return false;
    }
    
    // Find the scene
    const scene = segment.scenes.find(s =>
        (s.sequence === parseInt(sceneSequence) || s.order === parseInt(sceneSequence)));
    
    if (!scene || !scene.timeline_clips) {
        console.error(`Scene with sequence ${sceneSequence} not found in segment ${segmentSequence}`);
        return false;
    }
    
    // Find the clip
    const clipIndex = scene.timeline_clips.findIndex(c => c.sequence === parseInt(clipSequence));
    
    if (clipIndex === -1) {
        console.error(`Clip with sequence ${clipSequence} not found in scene ${sceneSequence}, segment ${segmentSequence}`);
        return false;
    }
    
    // Update the clip with the new data
    if (clipType === 'video') {
        // Update clip path if provided
        if (clipData.clipPath) {
            scene.timeline_clips[clipIndex].path = clipData.clipPath;
        }
        
        // Handle trim values - set to null if blank
        scene.timeline_clips[clipIndex].trim_start_minutes = clipData.trimStartMinutes === '' ? null :
                                                        (parseInt(clipData.trimStartMinutes) || 0);
        scene.timeline_clips[clipIndex].trim_start_seconds = clipData.trimStartSeconds === '' ? null :
                                                        (parseFloat(clipData.trimStartSeconds) || 0);
        scene.timeline_clips[clipIndex].trim_end_minutes = clipData.trimEndMinutes === '' ? null :
                                                      (parseInt(clipData.trimEndMinutes) || 0);
        scene.timeline_clips[clipIndex].trim_end_seconds = clipData.trimEndSeconds === '' ? null :
                                                      (parseFloat(clipData.trimEndSeconds) || 0);
        
        // Update comments field (could be either comments or comment in the original data)
        if ('comment' in scene.timeline_clips[clipIndex]) {
            scene.timeline_clips[clipIndex].comment = clipData.comments;
        } else {
            scene.timeline_clips[clipIndex].comments = clipData.comments;
        }
    } else if (clipType === 'image') {
        // Update clip path if provided
        if (clipData.clipPath) {
            scene.timeline_clips[clipIndex].path = clipData.clipPath;
        }
        
        // Handle duration - set to null if blank
        scene.timeline_clips[clipIndex].duration_seconds = clipData.durationSeconds === '' ? null :
                                                      (parseFloat(clipData.durationSeconds) || 0);
        
        // Update comments field (could be either comments or comment in the original data)
        if ('comment' in scene.timeline_clips[clipIndex]) {
            scene.timeline_clips[clipIndex].comment = clipData.comments;
        } else {
            scene.timeline_clips[clipIndex].comments = clipData.comments;
        }
    }
    
    // Save the updated data
    saveVideoAssemblyData(videoAssemblyData);
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Clip updated successfully</p>`;
    
    return true;
}

/**
 * Deletes a clip from the timeline
 * @param {Object} params - Parameters containing segment, scene, and clip sequence numbers
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {boolean} - Whether the operation was successful
 */
function deleteClipFromTimeline(params, videoAssemblyData) {
    const { segmentSequence, sceneSequence, clipSequence, clipType } = params;
    
    if (!videoAssemblyData || !videoAssemblyData.cut || !videoAssemblyData.cut.segments) {
        console.error('No video assembly data available');
        return false;
    }
    
    // Find the segment
    const segment = videoAssemblyData.cut.segments.find(s =>
        (s.sequence === segmentSequence || s.order === segmentSequence));
    
    if (!segment || !segment.scenes) {
        console.error(`Segment with sequence ${segmentSequence} not found`);
        return false;
    }
    
    // Find the scene
    const scene = segment.scenes.find(s =>
        (s.sequence === sceneSequence || s.order === sceneSequence));
    
    if (!scene || !scene.timeline_clips) {
        console.error(`Scene with sequence ${sceneSequence} not found in segment ${segmentSequence}`);
        return false;
    }
    
    // Find the clip
    const clipIndex = scene.timeline_clips.findIndex(c => c.sequence === clipSequence);
    
    if (clipIndex === -1) {
        console.error(`Clip with sequence ${clipSequence} not found in scene ${sceneSequence}, segment ${segmentSequence}`);
        return false;
    }
    
    // Remove the clip from the array
    scene.timeline_clips.splice(clipIndex, 1);
    
    // Save the updated data
    saveVideoAssemblyData(videoAssemblyData);
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Clip deleted successfully</p>`;
    
    return true;
}

/**
 * Gets clip data for editing
 * @param {Object} params - Parameters containing segment, scene, and clip sequence numbers
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {Object|null} - The clip data or null if not found
 */
function getClipData(params, videoAssemblyData) {
    const { segmentSequence, sceneSequence, clipSequence, clipType } = params;
    
    if (!videoAssemblyData || !videoAssemblyData.cut || !videoAssemblyData.cut.segments) {
        console.error('No video assembly data available');
        return null;
    }
    
    // Find the segment
    const segment = videoAssemblyData.cut.segments.find(s =>
        (s.sequence === segmentSequence || s.order === segmentSequence));
    
    if (!segment || !segment.scenes) {
        console.error(`Segment with sequence ${segmentSequence} not found`);
        return null;
    }
    
    // Find the scene
    const scene = segment.scenes.find(s =>
        (s.sequence === sceneSequence || s.order === sceneSequence));
    
    if (!scene || !scene.timeline_clips) {
        console.error(`Scene with sequence ${sceneSequence} not found in segment ${segmentSequence}`);
        return null;
    }
    
    // Find the clip
    const clip = scene.timeline_clips.find(c => c.sequence === clipSequence);
    
    if (!clip) {
        console.error(`Clip with sequence ${clipSequence} not found in scene ${sceneSequence}, segment ${segmentSequence}`);
        return null;
    }
    
    // Prepare clip data for editing
    const clipData = {
        segmentSequence,
        sceneSequence,
        clipSequence,
        clipType,
        clipPath: clip.path || ''
    };
    
    if (clipType === 'video') {
        clipData.trimStartMinutes = clip.trim_start_minutes || 0;
        clipData.trimStartSeconds = clip.trim_start_seconds || 0;
        clipData.trimEndMinutes = clip.trim_end_minutes || 0;
        clipData.trimEndSeconds = clip.trim_end_seconds || 0;
        clipData.comments = clip.comments || clip.comment || '';
    } else if (clipType === 'image') {
        clipData.durationSeconds = clip.duration_seconds || 0;
        clipData.comments = clip.comments || clip.comment || '';
    }
    
    return clipData;
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

// Export functions
module.exports = {
    addClipToTimeline,
    updateClipInTimeline,
    deleteClipFromTimeline,
    getClipData,
    switchToTimelineTab
};
/**
 * segmentOperations.js
 *
 * Operations for timeline segments (add, edit, delete)
 */

// Import required modules
const { saveVideoAssemblyData } = require('../fileTabs/fileTimelineIntegration');

/**
 * Adds a new segment to the timeline
 * @param {Object} segmentData - Data for the new segment
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {boolean} - Whether the operation was successful
 */
function addSegmentToTimeline(segmentData, videoAssemblyData) {
    if (!videoAssemblyData || !videoAssemblyData.cut) {
        console.error('No video assembly data available');
        return false;
    }
    
    // Ensure segments array exists
    if (!videoAssemblyData.cut.segments) {
        videoAssemblyData.cut.segments = [];
    }
    
    // Determine the next sequence number
    let nextSequence = 1;
    if (videoAssemblyData.cut.segments.length > 0) {
        const maxSequence = Math.max(...videoAssemblyData.cut.segments.map(s => s.sequence || 0));
        nextSequence = maxSequence + 1;
    }
    
    // Create the new segment
    const newSegment = {
        sequence: nextSequence,
        title: segmentData.title || "New Segment",
        overlay_images: [],
        min_len_seconds: segmentData.minLength || 0,
        max_len_seconds: segmentData.maxLength || 0,
        scenes: [
            {
                sequence: 1,
                timeline_clip_type: "video",
                timeline_clips: [],
                sequential_audio_clips: [],
                overlay_images: []
            }
        ]
    };
    
    // Add the segment to the array
    videoAssemblyData.cut.segments.push(newSegment);
    
    // Save the updated video assembly data
    saveVideoAssemblyData(videoAssemblyData);
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    if (terminal) {
        terminal.innerHTML += `<p>Added new segment: ${newSegment.title}</p>`;
    }
    
    return true;
}

/**
 * Updates an existing segment in the timeline
 * @param {Object} segmentData - The updated segment data
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {boolean} - Whether the operation was successful
 */
function updateSegmentInTimeline(segmentData, videoAssemblyData) {
    if (!videoAssemblyData || !videoAssemblyData.cut || !videoAssemblyData.cut.segments) {
        console.error('No video assembly data available');
        return false;
    }
    
    const segmentSequence = parseInt(segmentData.segmentSequence);
    
    // Find the segment
    const segmentIndex = videoAssemblyData.cut.segments.findIndex(s => 
        s.sequence === segmentSequence);
    
    if (segmentIndex === -1) {
        console.error(`Segment with sequence ${segmentSequence} not found`);
        return false;
    }
    
    // Update the segment properties
    videoAssemblyData.cut.segments[segmentIndex].title = segmentData.title || 
        videoAssemblyData.cut.segments[segmentIndex].title;
    
    if (segmentData.minLength !== undefined) {
        videoAssemblyData.cut.segments[segmentIndex].min_len_seconds = parseFloat(segmentData.minLength);
    }
    
    if (segmentData.maxLength !== undefined) {
        videoAssemblyData.cut.segments[segmentIndex].max_len_seconds = parseFloat(segmentData.maxLength);
    }
    
    // Save the updated video assembly data
    saveVideoAssemblyData(videoAssemblyData);
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    if (terminal) {
        terminal.innerHTML += `<p>Updated segment: ${videoAssemblyData.cut.segments[segmentIndex].title}</p>`;
    }
    
    return true;
}

/**
 * Deletes a segment from the timeline
 * @param {Object} params - Parameters containing segment sequence number
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {boolean} - Whether the operation was successful
 */
function deleteSegmentFromTimeline(params, videoAssemblyData) {
    if (!videoAssemblyData || !videoAssemblyData.cut || !videoAssemblyData.cut.segments) {
        console.error('No video assembly data available');
        return false;
    }
    
    const segmentSequence = parseInt(params.segmentSequence);
    
    // Find the segment
    const segmentIndex = videoAssemblyData.cut.segments.findIndex(s => 
        s.sequence === segmentSequence);
    
    if (segmentIndex === -1) {
        console.error(`Segment with sequence ${segmentSequence} not found`);
        return false;
    }
    
    // Store the segment title before removing it
    const segmentTitle = videoAssemblyData.cut.segments[segmentIndex].title;
    
    // Remove the segment from the array
    videoAssemblyData.cut.segments.splice(segmentIndex, 1);
    
    // Save the updated data
    saveVideoAssemblyData(videoAssemblyData);
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    if (terminal) {
        terminal.innerHTML += `<p>Deleted segment: ${segmentTitle}</p>`;
    }
    
    return true;
}

/**
 * Gets segment data for editing
 * @param {Object} params - Parameters containing segment sequence number
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {Object|null} - The segment data or null if not found
 */
function getSegmentData(params, videoAssemblyData) {
    if (!videoAssemblyData || !videoAssemblyData.cut || !videoAssemblyData.cut.segments) {
        console.error('No video assembly data available');
        return null;
    }
    
    const segmentSequence = parseInt(params.segmentSequence);
    
    // Find the segment
    const segment = videoAssemblyData.cut.segments.find(s => s.sequence === segmentSequence);
    
    if (!segment) {
        console.error(`Segment with sequence ${segmentSequence} not found`);
        return null;
    }
    
    // Prepare segment data for editing
    return {
        segmentSequence: segment.sequence,
        title: segment.title || '',
        minLength: segment.min_len_seconds || 0,
        maxLength: segment.max_len_seconds || 0
    };
}

// Export functions
module.exports = {
    addSegmentToTimeline,
    updateSegmentInTimeline,
    deleteSegmentFromTimeline,
    getSegmentData
};

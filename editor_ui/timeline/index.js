/**
 * timeline/index.js
 *
 * Main entry point for the Timeline tab functionality.
 * Exports all Timeline-related functions.
 */

const generateHtmlFromVideoAssembly = require('./timelineHtmlGenerator');
const getTimelineStyles = require('./timelineStyles');
const getTimelineEventHandlers = require('./timelineEventHandlers');
const clipOperations = require('./clipOperations');

/**
 * Generates the complete HTML for the Timeline tab
 * This function replaces the original generateHtmlFromVideoAssembly in timelineDisplay.js
 * 
 * @param {Object} data - Dictionary containing the video assembly data
 * @returns {string} - The generated HTML content
 */
function generateTimelineHtml(data) {
    // Use the refactored components to generate the HTML
    return generateHtmlFromVideoAssembly(data);
}

// Export all Timeline functionality
module.exports = {
    // Main HTML generator
    generateTimelineHtml,
    
    // Styles and event handlers (for potential direct access)
    getTimelineStyles,
    getTimelineEventHandlers,
    
    // Clip operations
    addClipToTimeline: clipOperations.addClipToTimeline,
    updateClipInTimeline: clipOperations.updateClipInTimeline,
    deleteClipFromTimeline: clipOperations.deleteClipFromTimeline,
    getClipData: clipOperations.getClipData,
    switchToTimelineTab: clipOperations.switchToTimelineTab,
    moveClip: clipOperations.moveClip
};
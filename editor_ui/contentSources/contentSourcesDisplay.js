/**
 * contentSources/contentSourcesDisplay.js
 * 
 * Core functionality for the content sources display.
 * This module imports and coordinates all the other modules.
 */

const htmlGenerator = require('./htmlGenerator');
const eventHandlers = require('./eventHandlers');
const fileFilters = require('./fileFilters');
const styles = require('./styles');

/**
 * Generates HTML for the content sources mode in the explorer area
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {string} HTML content for the explorer
 */
function generateContentSourcesHtml(videoAssemblyData) {
    return htmlGenerator.generateContentSourcesHtml(videoAssemblyData);
}

/**
 * Initializes the content sources mode with event handlers
 * @param {Object} videoAssemblyData - The video assembly data
 */
function initializeContentSources(videoAssemblyData) {
    // Initialize styles
    styles.initializeStyles();
    
    // Initialize event handlers
    eventHandlers.initializeContentSources(videoAssemblyData);
}

/**
 * Initializes event listeners for a specific section of the explorer
 * This is used when regenerating content after filter toggle
 * @param {Element} section - The explorer section element
 * @param {Object} videoAssemblyData - The video assembly data
 */
function initializeExplorerContent(section, videoAssemblyData) {
    eventHandlers.initializeExplorerContent(section, videoAssemblyData);
}

/**
 * Filters files in the explorer based on search text
 * @param {Element} section - The explorer section element
 * @param {string} searchText - The text to search for (lowercase)
 */
function filterFilesBySearch(section, searchText) {
    fileFilters.filterFilesBySearch(section, searchText);
}

module.exports = {
    generateContentSourcesHtml,
    initializeContentSources,
    initializeExplorerContent,
    filterFilesBySearch
};
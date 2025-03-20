/**
 * contentSources/index.js
 * 
 * Main entry point for the content sources module.
 * Re-exports the public API from individual modules.
 */

const contentSourcesDisplay = require('./contentSourcesDisplay');

// Re-export the public API
module.exports = {
    generateContentSourcesHtml: contentSourcesDisplay.generateContentSourcesHtml,
    initializeContentSources: contentSourcesDisplay.initializeContentSources,
    initializeExplorerContent: contentSourcesDisplay.initializeExplorerContent,
    filterFilesBySearch: contentSourcesDisplay.filterFilesBySearch
};
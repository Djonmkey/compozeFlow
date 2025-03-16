/**
 * contentSourcesDisplay.js
 *
 * Handles the display of content sources in the explorer area.
 * This file now serves as a wrapper around the modular implementation.
 */

// Import the modular implementation
const contentSources = require('./contentSources');

// Re-export the public API
module.exports = contentSources;
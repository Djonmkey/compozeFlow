/**
 * timelineDisplay.js
 *
 * This file now serves as a wrapper around the refactored timeline module.
 * It re-exports the generateTimelineHtml function as generateHtmlFromVideoAssembly
 * for backward compatibility.
 */

// Simply re-export the functionality from the timeline module
module.exports = require('./timeline').generateTimelineHtml;
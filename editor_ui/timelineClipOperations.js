/**
 * timelineClipOperations.js
 *
 * This file now serves as a wrapper around the refactored timeline module.
 * It re-exports the clip operations functions for backward compatibility.
 */

// Simply re-export the functionality from the timeline module
module.exports = {
    addClipToTimeline: require('./timeline').addClipToTimeline,
    updateClipInTimeline: require('./timeline').updateClipInTimeline,
    deleteClipFromTimeline: require('./timeline').deleteClipFromTimeline,
    getClipData: require('./timeline').getClipData,
    switchToTimelineTab: require('./timeline').switchToTimelineTab,
    moveClip: require('./timeline').moveClip
};
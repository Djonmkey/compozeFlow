/**
 * fileUsageTracker.js
 * 
 * Utility to track and display file usages in video assembly data
 */

/**
 * Finds all usages of a file in the video assembly data
 * @param {string} filePath - The file path to find usages for
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {Array} Array of usage objects with segment, scene, and usage type information
 */
function findFileUsages(filePath, videoAssemblyData) {
    if (!videoAssemblyData || !videoAssemblyData.cut || !videoAssemblyData.cut.segments) {
        return [];
    }

    const usages = [];

    // Process segments
    videoAssemblyData.cut.segments.forEach(segment => {
        const segmentInfo = {
            sequence: segment.sequence,
            title: segment.title || `Segment ${segment.sequence}`
        };

        // Check overlay_images at segment level
        if (segment.overlay_images) {
            segment.overlay_images.forEach((image, index) => {
                if (image.path === filePath) {
                    usages.push({
                        segment: segmentInfo,
                        scene: null,
                        type: 'Segment Overlay Image',
                        index: index + 1
                    });
                }
            });
        }

        // Process scenes
        if (segment.scenes) {
            segment.scenes.forEach(scene => {
                const sceneInfo = {
                    sequence: scene.sequence,
                    title: scene.title || `Scene ${scene.sequence}`
                };

                // Check timeline_clips
                if (scene.timeline_clips) {
                    scene.timeline_clips.forEach((clip, index) => {
                        if (clip.path === filePath) {
                            usages.push({
                                segment: segmentInfo,
                                scene: sceneInfo,
                                type: 'Timeline Clip',
                                index: index + 1,
                                details: {
                                    sequence: clip.sequence,
                                    comments: clip.comments || clip.comment || '',
                                    trimStart: clip.trim_start_minutes !== undefined ? 
                                        `${clip.trim_start_minutes}:${clip.trim_start_seconds}` : 'N/A',
                                    trimEnd: clip.trim_end_minutes !== undefined ? 
                                        `${clip.trim_end_minutes}:${clip.trim_end_seconds}` : 'N/A'
                                }
                            });
                        }
                    });
                }

                // Check sequential_audio_clips
                if (scene.sequential_audio_clips) {
                    scene.sequential_audio_clips.forEach((clip, index) => {
                        if (clip.path === filePath) {
                            usages.push({
                                segment: segmentInfo,
                                scene: sceneInfo,
                                type: 'Sequential Audio Clip',
                                index: index + 1,
                                details: {
                                    sequence: clip.sequence
                                }
                            });
                        }
                    });
                }

                // Check overlay_images at scene level
                if (scene.overlay_images) {
                    scene.overlay_images.forEach((image, index) => {
                        if (image.path === filePath) {
                            usages.push({
                                segment: segmentInfo,
                                scene: sceneInfo,
                                type: 'Scene Overlay Image',
                                index: index + 1
                            });
                        }
                    });
                }
            });
        }
    });

    return usages;
}

module.exports = {
    findFileUsages
};
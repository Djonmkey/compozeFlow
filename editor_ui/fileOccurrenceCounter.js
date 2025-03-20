/**
 * fileOccurrenceCounter.js
 * 
 * Utility to count occurrences of files in video assembly data
 */

/**
 * Counts occurrences of files in the video assembly data
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {Object} Map of file paths to occurrence counts
 */
function countFileOccurrences(videoAssemblyData) {
    if (!videoAssemblyData || !videoAssemblyData.cut || !videoAssemblyData.cut.segments) {
        return {};
    }

    const occurrenceCounts = {};

    // Process segments
    videoAssemblyData.cut.segments.forEach(segment => {
        // Count overlay_images at segment level
        if (segment.overlay_images) {
            segment.overlay_images.forEach(image => {
                if (image.path) {
                    occurrenceCounts[image.path] = (occurrenceCounts[image.path] || 0) + 1;
                }
            });
        }

        // Process scenes
        if (segment.scenes) {
            segment.scenes.forEach(scene => {
                // Count timeline_clips
                if (scene.timeline_clips) {
                    scene.timeline_clips.forEach(clip => {
                        if (clip.path) {
                            occurrenceCounts[clip.path] = (occurrenceCounts[clip.path] || 0) + 1;
                        }
                    });
                }

                // Count sequential_audio_clips
                if (scene.sequential_audio_clips) {
                    scene.sequential_audio_clips.forEach(clip => {
                        if (clip.path) {
                            occurrenceCounts[clip.path] = (occurrenceCounts[clip.path] || 0) + 1;
                        }
                    });
                }

                // Count overlay_images at scene level
                if (scene.overlay_images) {
                    scene.overlay_images.forEach(image => {
                        if (image.path) {
                            occurrenceCounts[image.path] = (occurrenceCounts[image.path] || 0) + 1;
                        }
                    });
                }
            });
        }
    });

    return occurrenceCounts;
}

module.exports = {
    countFileOccurrences
};
/**
 * contentSources/utils.js
 * 
 * Utility functions for the content sources module.
 */

/**
 * Gets the appropriate icon for a file based on its extension
 * @param {string} extension - The file extension (with dot)
 * @returns {string} The icon character
 */
function getFileIcon(extension) {
    let icon = '📄'; // Default file icon
    
    if (['.mp4', '.mov', '.avi', '.mkv'].includes(extension)) {
        icon = '🎬'; // Video files
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
        icon = '🖼️'; // Image files
    } else if (['.mp3', '.wav', '.aac', '.flac'].includes(extension)) {
        icon = '🔊'; // Audio files
    } else if (['.json', '.xml', '.yaml'].includes(extension)) {
        icon = '📋'; // Data files
    }
    
    return icon;
}

/**
 * Extracts supported file extensions from video assembly data
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {string[]} Array of supported file extensions
 */
function getSupportedExtensions(videoAssemblyData) {
    const supportedExtensions = [];
    
    if (videoAssemblyData['composeflow.org']) {
        const cfData = videoAssemblyData['composeflow.org'];
        
        if (cfData.supported_video_file_extensions) {
            supportedExtensions.push(...cfData.supported_video_file_extensions);
        }
        
        if (cfData.supported_audio_file_extensions) {
            supportedExtensions.push(...cfData.supported_audio_file_extensions);
        }
        
        if (cfData.supported_image_file_extensions) {
            supportedExtensions.push(...cfData.supported_image_file_extensions);
        }
    }
    
    return supportedExtensions;
}

module.exports = {
    getFileIcon,
    getSupportedExtensions
};
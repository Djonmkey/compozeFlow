/**
 * fileTypeUtils.js
 *
 * Utilities for determining file types based on extensions.
 */

/**
 * Determines the file type based on its extension
 * @param {string} extension - The file extension (with dot)
 * @param {Object} videoAssemblyData - The video assembly data containing supported extensions
 * @returns {string} - The file type (Video, Audio, Image, or Unknown)
 */
function determineFileType(extension, videoAssemblyData) {
    if (!videoAssemblyData || !videoAssemblyData['composeflow.org']) {
        // Default file type detection if no videoAssemblyData is available
        if (['.mp4', '.mov', '.avi', '.mkv'].includes(extension)) {
            return 'Video';
        } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
            return 'Image';
        } else if (['.mp3', '.wav', '.aac', '.flac'].includes(extension)) {
            return 'Audio';
        } else {
            return 'Unknown';
        }
    }
    
    const cfData = videoAssemblyData['composeflow.org'];
    
    // Check if extension is in supported video extensions
    if (cfData.supported_video_file_extensions && 
        cfData.supported_video_file_extensions.includes(extension)) {
        return 'Video';
    }
    
    // Check if extension is in supported audio extensions
    if (cfData.supported_audio_file_extensions && 
        cfData.supported_audio_file_extensions.includes(extension)) {
        return 'Audio';
    }
    
    // Check if extension is in supported image extensions
    if (cfData.supported_image_file_extensions && 
        cfData.supported_image_file_extensions.includes(extension)) {
        return 'Image';
    }
    
    // Default to Unknown
    return 'Unknown';
}

/**
 * Formats a date object to a readable string
 * @param {Date} date - The date to format
 * @returns {string} - The formatted date string
 */
function formatDate(date) {
    return date.toLocaleString();
}

/**
 * Formats a file size in bytes to a readable string
 * @param {number} bytes - The file size in bytes
 * @returns {string} - The formatted file size string
 */
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' bytes';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
}

module.exports = {
    determineFileType,
    formatDate,
    formatFileSize
};
/**
 * contentSources/fileTreeGenerator.js
 * 
 * Functions for generating file tree HTML for the content sources display.
 */

const fs = require('fs');
const path = require('path');
const fileOccurrenceCounter = require('../fileOccurrenceCounter');
const utils = require('./utils');

/**
 * Generates HTML for a file tree starting at the given path
 * @param {string} dirPath - The directory path to start from
 * @param {boolean} includeSubpaths - Whether to include subdirectories
 * @param {number} level - Current nesting level (for indentation)
 * @param {string[]} supportedExtensions - List of supported file extensions
 * @param {boolean} filterUnsupported - Whether to filter out unsupported files
 * @param {Array} dismissedFiles - List of dismissed files
 * @param {Object} videoAssemblyData - The video assembly data for file occurrence counting
 * @returns {string} HTML content for the file tree
 */
function generateFileTreeHtml(dirPath, includeSubpaths, level = 0, supportedExtensions = [], filterUnsupported = true, dismissedFiles = [], videoAssemblyData = null) {
    try {
        if (!fs.existsSync(dirPath)) {
            return `<div class="explorer-error">Path not found: ${dirPath}</div>`;
        }

        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        if (files.length === 0) {
            return '<div class="explorer-empty-dir">Empty directory</div>';
        }

        // Get file occurrence counts if video assembly data is provided
        let occurrenceCounts = {};
        if (videoAssemblyData) {
            occurrenceCounts = fileOccurrenceCounter.countFileOccurrences(videoAssemblyData);
        }

        let html = '<ul class="explorer-file-list">';

        // Process directories first, then files (like VSCode)
        const directories = files.filter(file => file.isDirectory());
        const regularFiles = files.filter(file => !file.isDirectory());

        // Process directories
        directories.forEach(dir => {
            const fullPath = path.join(dirPath, dir.name);
            const hasChildren = includeSubpaths && fs.readdirSync(fullPath).length > 0;
            
            html += `
                <li class="explorer-item explorer-directory">
                    <div class="explorer-item-content">
                        <span class="explorer-icon">📁</span>
                        <span class="explorer-name">${dir.name}</span>
                    </div>
            `;
            
            // Include subdirectories if specified
            if (includeSubpaths && hasChildren) {
                html += generateFileTreeHtml(fullPath, includeSubpaths, level + 1, supportedExtensions, filterUnsupported, dismissedFiles, videoAssemblyData);
            }
            
            html += '</li>';
        });

        // Process files
        regularFiles.forEach(file => {
            const extension = path.extname(file.name).toLowerCase();
            
            // Check if file should be displayed based on filter
            const isSupported = supportedExtensions.includes(extension);
            if (filterUnsupported && !isSupported) {
                return; // Skip this file if filtering is on and file is not supported
            }
            
            // Assign icons based on file extension
            const icon = utils.getFileIcon(extension);
            
            // Add a class to indicate if the file is supported
            const supportedClass = isSupported ? 'supported-file' : 'unsupported-file';
            
            // Check if the file is in the dismissed files list
            const fullPath = path.join(dirPath, file.name);
            const isDismissed = dismissedFiles.some(dismissedFile => dismissedFile.path === fullPath);
            const dismissedClass = isDismissed ? 'dismissed' : '';
            
            // Check if the file has occurrences in the video assembly
            const occurrenceCount = occurrenceCounts[fullPath] || 0;
            const occurrenceDisplay = occurrenceCount > 0 ? `<span class="occurrence-count">(${occurrenceCount})</span>` : '';
            
            html += `
                <li class="explorer-item explorer-file ${supportedClass} ${dismissedClass}" data-path="${fullPath}">
                    <div class="explorer-item-content">
                        <span class="explorer-icon">${icon}</span>
                        <span class="explorer-name">${file.name}</span>
                        ${occurrenceDisplay}
                    </div>
                </li>
            `;
        });

        html += '</ul>';
        return html;
    } catch (error) {
        console.error(`Error generating file tree for ${dirPath}:`, error);
        return `<div class="explorer-error">Error: ${error.message}</div>`;
    }
}

module.exports = {
    generateFileTreeHtml
};
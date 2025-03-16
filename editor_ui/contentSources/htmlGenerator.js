/**
 * contentSources/htmlGenerator.js
 *
 * Functions for generating HTML content for the content sources display.
 */

const path = require('path');
const fileTreeGenerator = require('./fileTreeGenerator');
const utils = require('./utils');

/**
 * Generates HTML for the content sources mode in the explorer area
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {string} HTML content for the explorer
 */
function generateContentSourcesHtml(videoAssemblyData) {
    if (!videoAssemblyData || !videoAssemblyData.cut || !videoAssemblyData.cut.content_sources) {
        return '<div class="explorer-empty">No content sources available</div>';
    }

    // Get content sources and sort by order
    const contentSources = [...videoAssemblyData.cut.content_sources];
    contentSources.sort((a, b) => a.order - b.order);

    // Get supported file extensions from videoAssemblyData
    const supportedExtensions = utils.getSupportedExtensions(videoAssemblyData);
    
    // Get dismissed files
    const dismissedFiles = videoAssemblyData.cut.dismissed_files || [];
    
    let html = '<div class="explorer-container">';
    
    // Add a button to add new content sources
    html += `
        <div class="explorer-actions">
            <button class="add-content-source-btn" title="Add new content source">
                <span class="add-icon">+</span>
                <span>Add Content Source</span>
            </button>
        </div>
    `;

    // Process each content source
    contentSources.forEach(source => {
        const sourcePath = source.path;
        const includeSubpaths = source.include_subpaths;
        const sourceOrder = source.order;
        
        // Create a section for this content source
        const sectionName = path.basename(sourcePath);
        html += `
            <div class="explorer-section" data-path="${sourcePath}" data-order="${sourceOrder}" data-include-subpaths="${includeSubpaths}">
                <div class="explorer-section-header">
                    <span class="explorer-section-name">${sectionName}</span>
                    <div class="explorer-section-actions">
                        <button class="explorer-filter-toggle" title="Toggle between showing all files and only supported files">
                            <span class="filter-icon">▼</span>
                            <span class="filter-text">Supported Only</span>
                        </button>
                        <button class="remove-content-source-btn" title="Remove this content source">
                            <span class="remove-icon">×</span>
                        </button>
                    </div>
                </div>
                <div class="explorer-search-container">
                    <div class="explorer-search-bar">
                        <span class="search-icon">🔍</span>
                        <input type="text" class="explorer-search-input" placeholder="Search" />
                    </div>
                </div>
                <div class="explorer-section-content">
                    ${fileTreeGenerator.generateFileTreeHtml(sourcePath, includeSubpaths, 0, supportedExtensions, true, dismissedFiles, videoAssemblyData)}
                </div>
            </div>
        `;
    });
    
    // Add a section for dismissed files if there are any
    if (dismissedFiles.length > 0) {
        html += generateDismissedFilesSection(dismissedFiles, supportedExtensions);
    }

    html += '</div>';
    return html;
}

/**
 * Generates HTML for the dismissed files section
 * @param {Array} dismissedFiles - List of dismissed files
 * @param {string[]} supportedExtensions - List of supported file extensions
 * @returns {string} HTML content for the dismissed files section
 */
function generateDismissedFilesSection(dismissedFiles, supportedExtensions) {
    let html = `
        <div class="explorer-section dismissed-files-section">
            <div class="explorer-section-header">
                <span class="explorer-section-name">Dismissed Files</span>
                <div class="explorer-section-actions">
                    <span class="dismissed-files-count">(${dismissedFiles.length})</span>
                </div>
            </div>
            <div class="explorer-section-content">
                <ul class="explorer-file-list">
    `;
    
    // Process each dismissed file
    dismissedFiles.forEach(dismissedFile => {
        const filePath = dismissedFile.path;
        const fileName = path.basename(filePath);
        const extension = path.extname(fileName).toLowerCase();
        
        // Determine file icon
        let icon = utils.getFileIcon(extension);
        
        // Check if file is supported
        const isSupported = supportedExtensions.includes(extension);
        const supportedClass = isSupported ? 'supported-file' : 'unsupported-file';
        
        html += `
            <li class="explorer-item explorer-file ${supportedClass} dismissed" data-path="${filePath}">
                <div class="explorer-item-content">
                    <span class="explorer-icon">${icon}</span>
                    <span class="explorer-name">${fileName}</span>
                </div>
            </li>
        `;
    });
    
    html += `
                </ul>
            </div>
        </div>
    `;
    
    return html;
}


module.exports = {
    generateContentSourcesHtml
};
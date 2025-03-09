/**
 * explorerDisplay.js
 * 
 * Handles the display of files and directories in the explorer area,
 * similar to VSCode's Explorer.
 */

const fs = require('fs');
const path = require('path');

/**
 * Generates HTML for the explorer area based on content sources
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {string} HTML content for the explorer
 */
function generateExplorerHtml(videoAssemblyData) {
    if (!videoAssemblyData || !videoAssemblyData.cut || !videoAssemblyData.cut.content_sources) {
        return '<div class="explorer-empty">No content sources available</div>';
    }

    // Get content sources and sort by order
    const contentSources = [...videoAssemblyData.cut.content_sources];
    contentSources.sort((a, b) => a.order - b.order);

    let html = '<div class="explorer-container">';

    // Process each content source
    contentSources.forEach(source => {
        const sourcePath = source.path;
        const includeSubpaths = source.include_subpaths;
        
        // Create a section for this content source
        const sectionName = path.basename(sourcePath);
        html += `
            <div class="explorer-section">
                <div class="explorer-section-header">
                    <span class="explorer-section-name">${sectionName}</span>
                </div>
                <div class="explorer-section-content">
                    ${generateFileTreeHtml(sourcePath, includeSubpaths)}
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

/**
 * Generates HTML for a file tree starting at the given path
 * @param {string} dirPath - The directory path to start from
 * @param {boolean} includeSubpaths - Whether to include subdirectories
 * @param {number} level - Current nesting level (for indentation)
 * @returns {string} HTML content for the file tree
 */
function generateFileTreeHtml(dirPath, includeSubpaths, level = 0) {
    try {
        if (!fs.existsSync(dirPath)) {
            return `<div class="explorer-error">Path not found: ${dirPath}</div>`;
        }

        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        if (files.length === 0) {
            return '<div class="explorer-empty-dir">Empty directory</div>';
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
                html += generateFileTreeHtml(fullPath, includeSubpaths, level + 1);
            }
            
            html += '</li>';
        });

        // Process files
        regularFiles.forEach(file => {
            const extension = path.extname(file.name).toLowerCase();
            let icon = '📄'; // Default file icon
            
            // Assign icons based on file extension
            if (['.mp4', '.mov', '.avi', '.mkv'].includes(extension)) {
                icon = '🎬'; // Video files
            } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
                icon = '🖼️'; // Image files
            } else if (['.mp3', '.wav', '.aac', '.flac'].includes(extension)) {
                icon = '🔊'; // Audio files
            } else if (['.json', '.xml', '.yaml'].includes(extension)) {
                icon = '📋'; // Data files
            }
            
            html += `
                <li class="explorer-item explorer-file" data-path="${path.join(dirPath, file.name)}">
                    <div class="explorer-item-content">
                        <span class="explorer-icon">${icon}</span>
                        <span class="explorer-name">${file.name}</span>
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

/**
 * Initializes the explorer with event handlers
 */
function initializeExplorer() {
    // Add click event listeners for directories to expand/collapse
    document.querySelectorAll('.explorer-directory').forEach(dir => {
        const content = dir.querySelector('.explorer-item-content');
        content.addEventListener('click', () => {
            dir.classList.toggle('expanded');
        });
    });

    // Add click event listeners for files
    document.querySelectorAll('.explorer-file').forEach(file => {
        file.addEventListener('click', () => {
            const filePath = file.getAttribute('data-path');
            console.log(`File clicked: ${filePath}`);
            // Here you would typically dispatch an event or call a function
            // to handle the file selection
        });
    });
}

module.exports = {
    generateExplorerHtml,
    initializeExplorer
};
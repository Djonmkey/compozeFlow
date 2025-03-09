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

    // Get supported file extensions from videoAssemblyData
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
                    <button class="explorer-filter-toggle" title="Toggle between showing all files and only supported files">
                        <span class="filter-icon">🔍</span>
                        <span class="filter-text">Supported Only</span>
                    </button>
                </div>
                <div class="explorer-section-content">
                    ${generateFileTreeHtml(sourcePath, includeSubpaths, 0, supportedExtensions, true)}
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
 * @param {string[]} supportedExtensions - List of supported file extensions
 * @param {boolean} filterUnsupported - Whether to filter out unsupported files
 * @returns {string} HTML content for the file tree
 */
function generateFileTreeHtml(dirPath, includeSubpaths, level = 0, supportedExtensions = [], filterUnsupported = true) {
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
                html += generateFileTreeHtml(fullPath, includeSubpaths, level + 1, supportedExtensions, filterUnsupported);
            }
            
            html += '</li>';
        });

        // Process files
        regularFiles.forEach(file => {
            const extension = path.extname(file.name).toLowerCase();
            let icon = '📄'; // Default file icon
            
            // Check if file should be displayed based on filter
            const isSupported = supportedExtensions.includes(extension);
            if (filterUnsupported && !isSupported) {
                return; // Skip this file if filtering is on and file is not supported
            }
            
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
            
            // Add a class to indicate if the file is supported
            const supportedClass = isSupported ? 'supported-file' : 'unsupported-file';
            
            html += `
                <li class="explorer-item explorer-file ${supportedClass}" data-path="${path.join(dirPath, file.name)}">
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
 * @param {Object} videoAssemblyData - The video assembly data (needed for filter toggle)
 */
function initializeExplorer(videoAssemblyData) {
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

    // Add click event listeners for filter toggle buttons
    document.querySelectorAll('.explorer-filter-toggle').forEach(button => {
        button.addEventListener('click', (event) => {
            // Prevent the click from propagating to parent elements
            event.stopPropagation();
            
            // Get the explorer section that contains this button
            const section = button.closest('.explorer-section');
            const sectionContent = section.querySelector('.explorer-section-content');
            const buttonText = button.querySelector('.filter-text');
            
            // Toggle the filter state
            const isFilteringOn = button.classList.toggle('show-all-files');
            
            // Update button text
            buttonText.textContent = isFilteringOn ? 'Show All' : 'Supported Only';
            
            // Get the path and include_subpaths for this section
            const sectionName = section.querySelector('.explorer-section-name').textContent;
            let sourcePath = '';
            let includeSubpaths = false;
            
            // Find the matching content source
            if (videoAssemblyData && videoAssemblyData.cut && videoAssemblyData.cut.content_sources) {
                const source = videoAssemblyData.cut.content_sources.find(s =>
                    path.basename(s.path) === sectionName
                );
                
                if (source) {
                    sourcePath = source.path;
                    includeSubpaths = source.include_subpaths;
                }
            }
            
            if (sourcePath) {
                // Get supported extensions
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
                
                // Regenerate the file tree with the new filter setting
                sectionContent.innerHTML = generateFileTreeHtml(
                    sourcePath,
                    includeSubpaths,
                    0,
                    supportedExtensions,
                    !isFilteringOn
                );
                
                // Reinitialize event listeners for the new content
                initializeExplorerContent(section);
            }
        });
    });
}

/**
 * Initializes event listeners for a specific section of the explorer
 * This is used when regenerating content after filter toggle
 * @param {Element} section - The explorer section element
 */
function initializeExplorerContent(section) {
    // Add click event listeners for directories to expand/collapse
    section.querySelectorAll('.explorer-directory').forEach(dir => {
        const content = dir.querySelector('.explorer-item-content');
        content.addEventListener('click', () => {
            dir.classList.toggle('expanded');
        });
    });

    // Add click event listeners for files
    section.querySelectorAll('.explorer-file').forEach(file => {
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
    initializeExplorer,
    initializeExplorerContent
};
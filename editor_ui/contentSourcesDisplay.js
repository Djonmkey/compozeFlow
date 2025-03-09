/**
 * contentSourcesDisplay.js
 * 
 * Handles the display of content sources in the explorer area.
 */

const fs = require('fs');
const path = require('path');

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
 * Initializes the content sources mode with event handlers
 * @param {Object} videoAssemblyData - The video assembly data
 */
function initializeContentSources(videoAssemblyData) {
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
            
            // Import the fileTabsDisplay module
            const fileTabsDisplay = require('./fileTabsDisplay');
            
            // Add a tab for the selected file
            fileTabsDisplay.addFileTab(filePath, videoAssemblyData);
            
            // Update the terminal with a message
            const terminal = document.getElementById('terminal');
            terminal.innerHTML += `<p>File selected: ${filePath}</p>`;
        });
    });
    
    // Add input event listeners for search inputs
    document.querySelectorAll('.explorer-search-input').forEach(input => {
        input.addEventListener('input', (event) => {
            const searchText = event.target.value.toLowerCase();
            const section = input.closest('.explorer-section');
            filterFilesBySearch(section, searchText);
        });
    });
    
    // Add click event listener for the "Add Content Source" button
    const addContentSourceBtn = document.querySelector('.add-content-source-btn');
    if (addContentSourceBtn) {
        addContentSourceBtn.addEventListener('click', () => {
            addNewContentSource(videoAssemblyData);
        });
    }
    
    // Add click event listeners for the "Remove Content Source" buttons
    document.querySelectorAll('.remove-content-source-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            // Prevent the click from propagating to parent elements
            event.stopPropagation();
            
            // Get the explorer section that contains this button
            const section = button.closest('.explorer-section');
            const sourcePath = section.getAttribute('data-path');
            const sourceOrder = parseInt(section.getAttribute('data-order'));
            
            // Remove the content source
            removeContentSource(videoAssemblyData, sourcePath, sourceOrder);
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
            
            // Import the fileTabsDisplay module
            const fileTabsDisplay = require('./fileTabsDisplay');
            
            // Add a tab for the selected file
            fileTabsDisplay.addFileTab(filePath, videoAssemblyData);
            
            // Update the terminal with a message
            const terminal = document.getElementById('terminal');
            terminal.innerHTML += `<p>File selected: ${filePath}</p>`;
        });
    });
    
    // Add input event listeners for search inputs
    const searchInput = section.querySelector('.explorer-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const searchText = event.target.value.toLowerCase();
            filterFilesBySearch(section, searchText);
        });
    }
}

/**
 * Filters files in the explorer based on search text
 * @param {Element} section - The explorer section element
 * @param {string} searchText - The text to search for (lowercase)
 */
function filterFilesBySearch(section, searchText) {
    // Get all file and directory elements in this section
    const fileItems = section.querySelectorAll('.explorer-file');
    const dirItems = section.querySelectorAll('.explorer-directory');
    
    // If search is empty, show all items
    if (!searchText) {
        fileItems.forEach(item => item.style.display = '');
        dirItems.forEach(item => item.style.display = '');
        return;
    }
    
    // Track which directories contain matching files
    const dirsWithMatches = new Set();
    
    // Check each file
    fileItems.forEach(item => {
        const nameElement = item.querySelector('.explorer-name');
        const fileName = nameElement.textContent.toLowerCase();
        
        if (fileName.includes(searchText)) {
            item.style.display = ''; // Show matching file
            
            // Find all parent directories and mark them as containing matches
            let parent = item.parentElement;
            while (parent && !parent.classList.contains('explorer-section-content')) {
                if (parent.parentElement && parent.parentElement.classList.contains('explorer-directory')) {
                    dirsWithMatches.add(parent.parentElement);
                }
                parent = parent.parentElement;
            }
        } else {
            item.style.display = 'none'; // Hide non-matching file
        }
    });
    
    // Process directories
    dirItems.forEach(dir => {
        const nameElement = dir.querySelector('.explorer-name');
        const dirName = nameElement.textContent.toLowerCase();
        
        if (dirName.includes(searchText) || dirsWithMatches.has(dir)) {
            dir.style.display = ''; // Show directory if it matches or contains matching files
            
            // If directory name matches, show all its children
            if (dirName.includes(searchText)) {
                dir.querySelectorAll('.explorer-file, .explorer-directory').forEach(child => {
                    child.style.display = '';
                });
            }
            
            // Expand directories with matches
            if (dirsWithMatches.has(dir) && !dir.classList.contains('expanded')) {
                dir.classList.add('expanded');
            }
            
            // Find all parent directories and mark them as containing matches
            let parent = dir.parentElement;
            while (parent && !parent.classList.contains('explorer-section-content')) {
                if (parent.parentElement && parent.parentElement.classList.contains('explorer-directory')) {
                    dirsWithMatches.add(parent.parentElement);
                    parent.parentElement.classList.add('expanded');
                }
                parent = parent.parentElement;
            }
        } else {
            dir.style.display = 'none'; // Hide non-matching directory
        }
    });
}

/**
 * Adds a new content source to the video assembly data
 * @param {Object} videoAssemblyData - The video assembly data
 */
function addNewContentSource(videoAssemblyData) {
    // Create a dialog to get the path and include_subpaths
    const dialogHtml = `
        <div class="dialog-overlay">
            <div class="dialog-content">
                <h3>Add Content Source</h3>
                <div class="dialog-form">
                    <div class="form-group">
                        <label for="content-source-path">Path:</label>
                        <input type="text" id="content-source-path" placeholder="Enter path to content source">
                    </div>
                    <div class="form-group">
                        <label for="include-subpaths">Include Subpaths:</label>
                        <input type="checkbox" id="include-subpaths">
                    </div>
                    <div class="dialog-buttons">
                        <button id="dialog-cancel">Cancel</button>
                        <button id="dialog-add">Add</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add the dialog to the DOM
    const dialogElement = document.createElement('div');
    dialogElement.innerHTML = dialogHtml;
    document.body.appendChild(dialogElement);
    
    // Add event listeners for the dialog buttons
    const cancelButton = document.getElementById('dialog-cancel');
    const addButton = document.getElementById('dialog-add');
    
    // Cancel button closes the dialog
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(dialogElement);
    });
    
    // Add button adds the content source and closes the dialog
    addButton.addEventListener('click', () => {
        const pathInput = document.getElementById('content-source-path');
        const includeSubpathsInput = document.getElementById('include-subpaths');
        
        const sourcePath = pathInput.value.trim();
        const includeSubpaths = includeSubpathsInput.checked;
        
        if (sourcePath) {
            // Find the highest order value
            let maxOrder = 0;
            if (videoAssemblyData.cut && videoAssemblyData.cut.content_sources) {
                videoAssemblyData.cut.content_sources.forEach(source => {
                    if (source.order > maxOrder) {
                        maxOrder = source.order;
                    }
                });
            }
            
            // Create a new content source object
            const newContentSource = {
                order: maxOrder + 1,
                path: sourcePath,
                include_subpaths: includeSubpaths
            };
            
            // Add the new content source to the video assembly data
            if (!videoAssemblyData.cut) {
                videoAssemblyData.cut = {};
            }
            
            if (!videoAssemblyData.cut.content_sources) {
                videoAssemblyData.cut.content_sources = [];
            }
            
            videoAssemblyData.cut.content_sources.push(newContentSource);
            
            // Update the explorer
            const explorer = document.getElementById('explorer');
            explorer.innerHTML = generateContentSourcesHtml(videoAssemblyData);
            initializeContentSources(videoAssemblyData);
            
            // Save the updated video assembly data
            saveVideoAssemblyData(videoAssemblyData);
        }
        
        // Close the dialog
        document.body.removeChild(dialogElement);
    });
}

/**
 * Removes a content source from the video assembly data
 * @param {Object} videoAssemblyData - The video assembly data
 * @param {string} sourcePath - The path of the content source to remove
 * @param {number} sourceOrder - The order of the content source to remove
 */
function removeContentSource(videoAssemblyData, sourcePath, sourceOrder) {
    if (!videoAssemblyData.cut || !videoAssemblyData.cut.content_sources) {
        return;
    }
    
    // Create a confirmation dialog
    const dialogHtml = `
        <div class="dialog-overlay">
            <div class="dialog-content">
                <h3>Remove Content Source</h3>
                <p>Are you sure you want to remove this content source?</p>
                <p><strong>${sourcePath}</strong></p>
                <div class="dialog-buttons">
                    <button id="dialog-cancel">Cancel</button>
                    <button id="dialog-remove">Remove</button>
                </div>
            </div>
        </div>
    `;
    
    // Add the dialog to the DOM
    const dialogElement = document.createElement('div');
    dialogElement.innerHTML = dialogHtml;
    document.body.appendChild(dialogElement);
    
    // Add event listeners for the dialog buttons
    const cancelButton = document.getElementById('dialog-cancel');
    const removeButton = document.getElementById('dialog-remove');
    
    // Cancel button closes the dialog
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(dialogElement);
    });
    
    // Remove button removes the content source and closes the dialog
    removeButton.addEventListener('click', () => {
        // Remove the content source from the video assembly data
        videoAssemblyData.cut.content_sources = videoAssemblyData.cut.content_sources.filter(source =>
            source.path !== sourcePath || source.order !== sourceOrder
        );
        
        // Update the explorer
        const explorer = document.getElementById('explorer');
        explorer.innerHTML = generateContentSourcesHtml(videoAssemblyData);
        initializeContentSources(videoAssemblyData);
        
        // Save the updated video assembly data
        saveVideoAssemblyData(videoAssemblyData);
        
        // Close the dialog
        document.body.removeChild(dialogElement);
    });
}

/**
 * Saves the video assembly data to the file
 * @param {Object} videoAssemblyData - The video assembly data to save
 */
function saveVideoAssemblyData(videoAssemblyData) {
    // Check if we're running in Electron
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        try {
            // Get the electron module
            const electron = require('electron');
            const ipcRenderer = electron.ipcRenderer;
            
            // Send a message to the main process to save the data
            ipcRenderer.invoke('save-video-assembly-data', videoAssemblyData)
                .then(() => {
                    console.log('Video assembly data saved successfully');
                })
                .catch(error => {
                    console.error('Error saving video assembly data:', error);
                });
        } catch (error) {
            console.error('Error saving video assembly data:', error);
        }
    } else {
        console.log('Not running in Electron, cannot save video assembly data');
    }
}

// Add CSS for the dialog
const dialogStyle = document.createElement('style');
dialogStyle.textContent = `
    .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .dialog-content {
        background-color: white;
        border-radius: 4px;
        padding: 20px;
        width: 400px;
        max-width: 90%;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    
    .dialog-form {
        margin-top: 15px;
    }
    
    .form-group {
        margin-bottom: 15px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
    }
    
    .form-group input[type="text"] {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    
    .dialog-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    }
    
    .dialog-buttons button {
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
    }
    
    #dialog-cancel {
        background-color: #f5f5f5;
        border: 1px solid #ccc;
    }
    
    #dialog-add, #dialog-remove {
        background-color: #4a86e8;
        color: white;
        border: none;
    }
    
    #dialog-remove {
        background-color: #e84a4a;
    }
`;
document.head.appendChild(dialogStyle);

module.exports = {
    generateContentSourcesHtml,
    initializeContentSources,
    initializeExplorerContent,
    filterFilesBySearch
};
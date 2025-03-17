/**
 * contentSources/eventHandlers.js
 *
 * Event handling functions for the content sources display.
 */

const path = require('path');
const fileFilters = require('./fileFilters');
const contentSourceManager = require('./contentSourceManager');
const fileTreeGenerator = require('./fileTreeGenerator');
const utils = require('./utils');
const explorerDisplay = require('../explorerDisplay');

// Set up event listener for content sources updates
document.addEventListener('contentSourcesUpdated', (event) => {
    if (event.detail && event.detail.videoAssemblyData) {
        initializeContentSources(event.detail.videoAssemblyData);
    }
});

/**
 * Gets the full path of a directory element
 * @param {Element} dirElement - The directory element
 * @returns {string|null} The directory path or null if not found
 */
function getDirectoryPath(dirElement) {
    // Try to get the path from the data-path attribute
    let dirPath = dirElement.getAttribute('data-path');
    
    // If the directory doesn't have a data-path attribute, try to construct it
    if (!dirPath) {
        // Get the section element that contains this directory
        const section = dirElement.closest('.explorer-section');
        if (!section) return null;
        
        const sectionPath = section.getAttribute('data-path');
        if (!sectionPath) return null;
        
        // Get the directory name
        const dirName = dirElement.querySelector('.explorer-name')?.textContent;
        if (!dirName) return null;
        
        // Construct the path by combining the section path and directory name
        dirPath = path.join(sectionPath, dirName);
    }
    
    return dirPath;
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
            // Toggle expanded state
            const isExpanded = dir.classList.toggle('expanded');
            
            // Get directory path
            const dirPath = getDirectoryPath(dir);
            if (dirPath) {
                // Update the expandedFolders set in explorerDisplay
                if (isExpanded) {
                    // Add to expanded folders set
                    explorerDisplay.saveExpandedFoldersState();
                } else {
                    // Remove from expanded folders set
                    explorerDisplay.saveExpandedFoldersState();
                }
            }
        });
    });
    

    // Add click event listeners for files
    document.querySelectorAll('.explorer-file').forEach(file => {
        file.addEventListener('click', (event) => {
            // Don't trigger file selection if the restore button was clicked
            if (event.target.closest('.restore-dismissed-file-btn')) {
                return;
            }
            
            const filePath = file.getAttribute('data-path');
            console.log(`File clicked: ${filePath}`);
            
            // Import the fileTabsDisplay module
            const fileTabsDisplay = require('../fileTabsDisplay');
            
            // Add a tab for the selected file
            fileTabsDisplay.addFileTab(filePath, videoAssemblyData);
            
            // Update the terminal with a message
            const terminal = document.getElementById('terminal');
            terminal.innerHTML += `<p>File selected: ${filePath}</p>`;
        });
    });
    
    // Add click event listeners for restore buttons in dismissed files section
    document.querySelectorAll('.restore-dismissed-file-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            // Prevent the click from propagating to parent elements
            event.stopPropagation();
            
            const filePath = button.getAttribute('data-path');
            console.log(`Restore button clicked for file: ${filePath}`);
            
            // Get the fileOperationsUI module to use the toggleFileDismissStatus function
            const fileOperationsUI = require('../fileTabs/fileOperationsUI');
            
            // Call the toggleFileDismissStatus function to restore the file
            fileOperationsUI.toggleFileDismissStatus(filePath);
        });
    });
    
    // Add input event listeners for search inputs
    document.querySelectorAll('.explorer-search-input').forEach(input => {
        input.addEventListener('input', (event) => {
            const searchText = event.target.value.toLowerCase();
            const section = input.closest('.explorer-section');
            fileFilters.filterFilesBySearch(section, searchText);
        });
    });
    
    // Add click event listener for the "Add Content Source" button
    const addContentSourceBtn = document.querySelector('.add-content-source-btn');
    if (addContentSourceBtn) {
        addContentSourceBtn.addEventListener('click', async () => {
            await contentSourceManager.addNewContentSource(videoAssemblyData);
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
            
            // Get either order or sequence attribute
            let sourceOrder;
            if (section.hasAttribute('data-order')) {
                sourceOrder = parseInt(section.getAttribute('data-order'));
            } else if (section.hasAttribute('data-sequence')) {
                sourceOrder = parseInt(section.getAttribute('data-sequence'));
            } else {
                console.error('Section has neither order nor sequence attribute');
                return;
            }
            
            // Remove the content source
            contentSourceManager.removeContentSource(videoAssemblyData, sourcePath, sourceOrder);
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
                const supportedExtensions = utils.getSupportedExtensions(videoAssemblyData);
                
                // Get dismissed files
                const dismissedFiles = videoAssemblyData.cut.dismissed_files || [];
                
                // Regenerate the file tree with the new filter setting
                sectionContent.innerHTML = fileTreeGenerator.generateFileTreeHtml(
                    sourcePath,
                    includeSubpaths,
                    0,
                    supportedExtensions,
                    !isFilteringOn,
                    dismissedFiles,
                    videoAssemblyData
                );
                
                // Reinitialize event listeners for the new content
                initializeExplorerContent(section, videoAssemblyData);
            }
        });
    });
}

/**
 * Initializes event listeners for a specific section of the explorer
 * This is used when regenerating content after filter toggle
 * @param {Element} section - The explorer section element
 * @param {Object} videoAssemblyData - The video assembly data
 */
function initializeExplorerContent(section, videoAssemblyData) {
    // Add click event listeners for directories to expand/collapse
    section.querySelectorAll('.explorer-directory').forEach(dir => {
        const content = dir.querySelector('.explorer-item-content');
        content.addEventListener('click', () => {
            // Toggle expanded state
            const isExpanded = dir.classList.toggle('expanded');
            
            // Get directory path
            const dirPath = getDirectoryPath(dir);
            if (dirPath) {
                // Update the expandedFolders set in explorerDisplay
                if (isExpanded) {
                    // Add to expanded folders set
                    explorerDisplay.saveExpandedFoldersState();
                } else {
                    // Remove from expanded folders set
                    explorerDisplay.saveExpandedFoldersState();
                }
            }
        });
    });

    // Add click event listeners for files
    section.querySelectorAll('.explorer-file').forEach(file => {
        file.addEventListener('click', (event) => {
            // Don't trigger file selection if the restore button was clicked
            if (event.target.closest('.restore-dismissed-file-btn')) {
                return;
            }
            
            const filePath = file.getAttribute('data-path');
            console.log(`File clicked: ${filePath}`);
            
            // Import the fileTabsDisplay module
            const fileTabsDisplay = require('../fileTabsDisplay');
            
            // Add a tab for the selected file
            fileTabsDisplay.addFileTab(filePath, videoAssemblyData);
            
            // Update the terminal with a message
            const terminal = document.getElementById('terminal');
            terminal.innerHTML += `<p>File selected: ${filePath}</p>`;
        });
    });
    
    // Add click event listeners for restore buttons in dismissed files section
    section.querySelectorAll('.restore-dismissed-file-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            // Prevent the click from propagating to parent elements
            event.stopPropagation();
            
            const filePath = button.getAttribute('data-path');
            console.log(`Restore button clicked for file: ${filePath}`);
            
            // Get the fileOperationsUI module to use the toggleFileDismissStatus function
            const fileOperationsUI = require('../fileTabs/fileOperationsUI');
            
            // Call the toggleFileDismissStatus function to restore the file
            fileOperationsUI.toggleFileDismissStatus(filePath);
        });
    });
    
    // Add input event listeners for search inputs
    const searchInput = section.querySelector('.explorer-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const searchText = event.target.value.toLowerCase();
            fileFilters.filterFilesBySearch(section, searchText);
        });
    }
}

module.exports = {
    initializeContentSources,
    initializeExplorerContent
};
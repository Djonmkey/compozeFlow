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
            const fileTabsDisplay = require('../fileTabsDisplay');
            
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
            const sourceOrder = parseInt(section.getAttribute('data-order'));
            
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
            dir.classList.toggle('expanded');
        });
    });

    // Add click event listeners for files
    section.querySelectorAll('.explorer-file').forEach(file => {
        file.addEventListener('click', () => {
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
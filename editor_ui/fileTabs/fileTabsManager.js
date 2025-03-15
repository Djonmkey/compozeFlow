/**
 * fileTabsManager.js
 *
 * Core functionality for managing file tabs.
 */

const fs = require('fs');
const path = require('path');
const { determineFileType } = require('./fileTypeUtils');
const { updateEditorContent } = require('./fileDetailsDisplay');

// Store the currently selected file
let currentFile = null;

// Flag to track if the File tab has been created
let fileTabCreated = false;

/**
 * Updates the File tab with the selected file
 * @param {string} filePath - The full path of the selected file
 * @param {Object} videoAssemblyData - The video assembly data (for file type detection)
 * @returns {boolean} - True if file was loaded successfully
 */
function addFileTab(filePath, videoAssemblyData) {
    try {
        // Get file stats
        const stats = fs.statSync(filePath);
        
        // Get file extension and determine file type
        const fileExtension = path.extname(filePath).toLowerCase();
        const fileType = determineFileType(fileExtension, videoAssemblyData);
        
        // Create file object
        currentFile = {
            path: filePath,
            name: path.basename(filePath),
            created: stats.birthtime,
            modified: stats.mtime,
            size: stats.size,
            type: fileType
        };
        
        // Update the tabs display if needed
        if (!fileTabCreated) {
            updateTabsDisplay();
            fileTabCreated = true;
        }
        
        // Update the editor content with the file details
        updateEditorContent(currentFile, videoAssemblyData);
        
        return true;
    } catch (error) {
        console.error(`Error loading file ${filePath}:`, error);
        return false;
    }
}

/**
 * Updates the tabs display in the UI
 * Creates a single "File" tab if it doesn't exist
 */
function updateTabsDisplay() {
    const tabsContainer = document.getElementById('tabs-container');
    
    // Keep the existing static tabs (Timeline, Overlay Images, etc.)
    const staticTabs = Array.from(tabsContainer.querySelectorAll('.tab:not(.file-tab)'));
    const existingFileTab = tabsContainer.querySelector('.tab.file-tab');
    
    // If the File tab already exists, we don't need to recreate it
    if (existingFileTab) {
        return;
    }
    
    // Clear the container
    tabsContainer.innerHTML = '';
    
    // Add back the static tabs
    staticTabs.forEach(tab => {
        tabsContainer.appendChild(tab);
    });
    
    // Create the single File tab
    const fileTabElement = document.createElement('div');
    fileTabElement.className = 'tab file-tab active';
    
    // Create the tab content (no close button needed)
    fileTabElement.innerHTML = `
        <span class="tab-name">File</span>
    `;
    
    tabsContainer.appendChild(fileTabElement);
    
    // Scroll the tab into view if needed
    setTimeout(() => {
        fileTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }, 0);
}

/**
 * Gets the current file
 * @returns {Object} - The current file object
 */
function getCurrentFile() {
    return currentFile;
}

module.exports = {
    addFileTab,
    getCurrentFile
};
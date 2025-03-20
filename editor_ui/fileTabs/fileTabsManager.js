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
        
        // Set the File tab as active
        setFileTabActive(true);
        
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
    
    // Add click event listener to the File tab
    fileTabElement.addEventListener('click', () => {
        // Get all tabs
        const allTabs = document.querySelectorAll('.tab');
        
        // Update styling for all tabs
        allTabs.forEach(tab => {
            if (tab !== fileTabElement) {
                tab.classList.remove('active');
                tab.style.backgroundColor = '';
                tab.style.fontWeight = 'normal';
            }
        });
        
        // Set the File tab as active
        fileTabElement.classList.add('active');
        fileTabElement.style.backgroundColor = '#ddd';
        fileTabElement.style.fontWeight = 'bold';
        
        // Update the active tab in uiManager
        if (window.uiManager) {
            window.uiManager.setActiveTab('File');
        }
        
        // Update the editor content with the file details
        if (currentFile) {
            updateEditorContent(currentFile, window.currentVideoAssemblyData);
        }
    });
    
    // Listen for tab changes to update File tab appearance
    listenForTabChanges();
    
    // Scroll the tab into view if needed
    setTimeout(() => {
        fileTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }, 0);
}

/**
 * Sets the File tab as active or inactive
 * @param {boolean} isActive - Whether the File tab should be active
 */
function setFileTabActive(isActive) {
    const fileTab = document.querySelector('.tab.file-tab');
    if (fileTab) {
        if (isActive) {
            // Add active class and set styles
            fileTab.classList.add('active');
            fileTab.style.backgroundColor = '#ddd';
            fileTab.style.fontWeight = 'bold';
            
            // Update all other tabs to be inactive
            const otherTabs = document.querySelectorAll('.tab:not(.file-tab)');
            otherTabs.forEach(tab => {
                tab.style.backgroundColor = '';
                tab.style.fontWeight = 'normal';
            });
            
            // Update the active tab in uiManager
            if (window.uiManager) {
                window.uiManager.setActiveTab('File');
            }
        } else {
            // Remove active class and reset styles
            fileTab.classList.remove('active');
            fileTab.style.backgroundColor = '';
            fileTab.style.fontWeight = 'normal';
        }
    }
}

/**
 * Listen for tab changes to update File tab appearance
 */
function listenForTabChanges() {
    // Get all non-File tabs
    const otherTabs = document.querySelectorAll('.tab:not(.file-tab)');
    
    // Add click event listeners to all other tabs
    otherTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Set the File tab as inactive when another tab is clicked
            setFileTabActive(false);
        });
    });
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
    getCurrentFile,
    setFileTabActive
};
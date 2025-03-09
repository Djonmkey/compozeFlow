/**
 * fileTabsDisplay.js
 * 
 * Handles the display of file tabs when files are selected in the Explorer.
 * Each tab shows file details including path, created date, last modified date,
 * file size, and file type.
 */

const fs = require('fs');
const path = require('path');

// Store currently open file tabs
let openFileTabs = [];

/**
 * Adds a new tab for a selected file
 * @param {string} filePath - The full path of the selected file
 * @param {Object} videoAssemblyData - The video assembly data (for file type detection)
 * @returns {boolean} - True if tab was added, false if it was already open
 */
function addFileTab(filePath, videoAssemblyData) {
    // Check if tab for this file is already open
    const existingTabIndex = openFileTabs.findIndex(tab => tab.path === filePath);
    if (existingTabIndex !== -1) {
        // Tab already exists, make it active
        activateTab(existingTabIndex);
        return false;
    }

    try {
        // Get file stats
        const stats = fs.statSync(filePath);
        
        // Get file extension and determine file type
        const fileExtension = path.extname(filePath).toLowerCase();
        const fileType = determineFileType(fileExtension, videoAssemblyData);
        
        // Create new tab object
        const newTab = {
            path: filePath,
            name: path.basename(filePath),
            created: stats.birthtime,
            modified: stats.mtime,
            size: stats.size,
            type: fileType
        };
        
        // Add to open tabs array
        openFileTabs.push(newTab);
        
        // Update the tabs display
        updateTabsDisplay();
        
        // Make the new tab active
        activateTab(openFileTabs.length - 1);
        
        return true;
    } catch (error) {
        console.error(`Error adding file tab for ${filePath}:`, error);
        return false;
    }
}

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
 * Activates a tab at the specified index
 * @param {number} index - The index of the tab to activate
 */
function activateTab(index) {
    if (index < 0 || index >= openFileTabs.length) return;
    
    // Update the tabs display to highlight the active tab
    updateTabsDisplay(index);
    
    // Update the editor content to show the file details
    updateEditorContent(openFileTabs[index]);
}

/**
 * Closes a tab at the specified index
 * @param {number} index - The index of the tab to close
 */
function closeTab(index) {
    if (index < 0 || index >= openFileTabs.length) return;
    
    // Remove the tab from the array
    openFileTabs.splice(index, 1);
    
    // Update the tabs display
    updateTabsDisplay();
    
    // If there are still tabs open, activate the last one
    if (openFileTabs.length > 0) {
        activateTab(openFileTabs.length - 1);
    } else {
        // Clear the editor content if no tabs are open
        clearEditorContent();
    }
}

/**
 * Updates the tabs display in the UI
 * @param {number} activeIndex - The index of the active tab
 */
function updateTabsDisplay(activeIndex = -1) {
    const tabsContainer = document.getElementById('tabs-container');
    
    // Keep the existing static tabs (Timeline, Overlay Images, etc.)
    const staticTabs = Array.from(tabsContainer.querySelectorAll('.tab:not(.file-tab)'));
    
    // Clear the container
    tabsContainer.innerHTML = '';
    
    // Add back the static tabs
    staticTabs.forEach(tab => {
        tabsContainer.appendChild(tab);
    });
    
    // Add the file tabs
    openFileTabs.forEach((tab, index) => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab file-tab';
        if (index === activeIndex) {
            tabElement.classList.add('active');
        }
        
        // Create the tab content with a close button
        tabElement.innerHTML = `
            <span class="tab-name">${tab.name}</span>
            <span class="tab-close">×</span>
        `;
        
        // Add click event to activate the tab
        tabElement.addEventListener('click', (event) => {
            // Only activate if the click wasn't on the close button
            if (!event.target.classList.contains('tab-close')) {
                activateTab(index);
            }
        });
        
        // Add click event to the close button
        const closeButton = tabElement.querySelector('.tab-close');
        closeButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent tab activation
            closeTab(index);
        });
        
        tabsContainer.appendChild(tabElement);
    });
}

/**
 * Updates the editor content to show file details
 * @param {Object} tab - The tab object containing file details
 */
function updateEditorContent(tab) {
    const editorContent = document.getElementById('editor-content');
    
    // Format dates
    const createdDate = formatDate(tab.created);
    const modifiedDate = formatDate(tab.modified);
    
    // Format file size
    const fileSize = formatFileSize(tab.size);
    
    // Create HTML for file details
    const html = `
        <div class="file-details">
            <h2>${tab.name}</h2>
            <div class="file-info">
                <div class="file-info-item">
                    <span class="file-info-label">Path:</span>
                    <span class="file-info-value">${tab.path}</span>
                </div>
                <div class="file-info-item">
                    <span class="file-info-label">Type:</span>
                    <span class="file-info-value">${tab.type}</span>
                </div>
                <div class="file-info-item">
                    <span class="file-info-label">Size:</span>
                    <span class="file-info-value">${fileSize}</span>
                </div>
                <div class="file-info-item">
                    <span class="file-info-label">Created:</span>
                    <span class="file-info-value">${createdDate}</span>
                </div>
                <div class="file-info-item">
                    <span class="file-info-label">Modified:</span>
                    <span class="file-info-value">${modifiedDate}</span>
                </div>
            </div>
        </div>
    `;
    
    // Update the editor content
    editorContent.innerHTML = html;
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Displaying file details for ${tab.name}</p>`;
}

/**
 * Clears the editor content when no tabs are open
 */
function clearEditorContent() {
    const editorContent = document.getElementById('editor-content');
    
    // Show a placeholder message
    editorContent.innerHTML = `
        <h2>Welcome to compozeFlow Editor UI</h2>
        <p>This is a placeholder for the central editing area, akin to the text editor in VS Code.</p>
    `;
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

// Add CSS for file tabs
const fileTabsStyle = document.createElement('style');
fileTabsStyle.textContent = `
    /* File tab styling */
    .tab.file-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
    }
    
    .tab.file-tab.active {
        background-color: #ddd;
        font-weight: bold;
    }
    
    .tab-name {
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .tab-close {
        font-size: 16px;
        font-weight: bold;
        color: #888;
        cursor: pointer;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    
    .tab-close:hover {
        background-color: #ccc;
        color: #333;
    }
    
    /* File details styling */
    .file-details {
        padding: 20px;
    }
    
    .file-details h2 {
        margin-top: 0;
        margin-bottom: 20px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
    }
    
    .file-info {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .file-info-item {
        display: flex;
        align-items: flex-start;
    }
    
    .file-info-label {
        font-weight: bold;
        width: 100px;
        flex-shrink: 0;
    }
    
    .file-info-value {
        word-break: break-all;
    }
`;
document.head.appendChild(fileTabsStyle);

module.exports = {
    addFileTab
};
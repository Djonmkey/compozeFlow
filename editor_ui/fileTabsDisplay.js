/**
 * fileTabsDisplay.js
 *
 * Handles the display of file tabs when files are selected in the Explorer.
 * Uses a single "File" tab that shows details of the currently selected file.
 *
 * @sourceMappingURL=fileTabsDisplay.js.map
 */

const fs = require('fs');
const path = require('path');

// Install source map support for better debugging
try {
  require('source-map-support').install({
    handleUncaughtExceptions: true,
    environment: 'node',
    hookRequire: true
  });
  console.log('Source map support installed in fileTabsDisplay');
} catch (error) {
  console.error('Failed to install source map support in fileTabsDisplay:', error);
}

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
        updateEditorContent(videoAssemblyData);
        
        return true;
    } catch (error) {
        console.error(`Error loading file ${filePath}:`, error);
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

// Store the current video assembly data
let currentVideoAssemblyData = null;

/**
 * Updates the editor content to show file details
 * @param {Object} videoAssemblyData - The video assembly data
 */
function updateEditorContent(videoAssemblyData) {
    if (!currentFile) {
        clearEditorContent();
        return;
    }
    
    // Store the video assembly data for use in the add to timeline function
    currentVideoAssemblyData = videoAssemblyData;
    
    const editorContent = document.getElementById('editor-content');
    
    // Format dates
    const createdDate = formatDate(currentFile.created);
    const modifiedDate = formatDate(currentFile.modified);
    
    // Format file size
    const fileSize = formatFileSize(currentFile.size);
    
    // Create HTML for file details
    let html = `
        <div class="file-details">
            <h2>${currentFile.name}</h2>
            <div class="file-info">
                <div class="file-info-item">
                    <span class="file-info-label">Path:</span>
                    <span class="file-info-value">${currentFile.path}</span>
                </div>
                <div class="file-info-item">
                    <span class="file-info-label">Type:</span>
                    <span class="file-info-value">${currentFile.type}</span>
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
    `;
    
    // Add "Add to Timeline" section for video files
    if (currentFile.type === 'Video' && videoAssemblyData && videoAssemblyData.cut && videoAssemblyData.cut.segments) {
        html += `
            <div class="add-to-timeline-section">
                <h3>Add to Timeline</h3>
                <div class="add-to-timeline-form">
                    <div class="form-group">
                        <label for="segment-select">Segment:</label>
                        <select id="segment-select" class="form-control">
                            <option value="">Select a segment</option>
                            ${videoAssemblyData.cut.segments.map(segment =>
                                `<option value="${segment.order}">${segment.order}. ${segment.title || 'Untitled Segment'}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="scene-select">Scene:</label>
                        <select id="scene-select" class="form-control" disabled>
                            <option value="">Select a segment first</option>
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group half-width">
                            <label for="trim-start-minutes">Trim Start Minutes:</label>
                            <input type="number" id="trim-start-minutes" class="form-control" min="0" step="1" placeholder="Optional">
                        </div>
                        
                        <div class="form-group half-width">
                            <label for="trim-start-seconds">Trim Start Seconds:</label>
                            <input type="number" id="trim-start-seconds" class="form-control" min="0" max="59.999" step="0.001" placeholder="Optional">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group half-width">
                            <label for="trim-end-minutes">Trim End Minutes:</label>
                            <input type="number" id="trim-end-minutes" class="form-control" min="0" step="1" placeholder="Optional">
                        </div>
                        
                        <div class="form-group half-width">
                            <label for="trim-end-seconds">Trim End Seconds:</label>
                            <input type="number" id="trim-end-seconds" class="form-control" min="0" max="59.999" step="0.001" placeholder="Optional">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="clip-order">Order (defaults to 9999 if empty):</label>
                        <input type="number" id="clip-order" class="form-control" min="1" step="1" placeholder="9999">
                    </div>
                    
                    <div class="form-group">
                        <label for="clip-comments">Comments:</label>
                        <textarea id="clip-comments" class="form-control" rows="3" placeholder="Optional comments"></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button id="add-to-timeline-btn" class="btn btn-primary" disabled>Add to Timeline</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    
    // Update the editor content
    editorContent.innerHTML = html;
    
    // Add event listeners for the "Add to Timeline" functionality
    if (currentFile.type === 'Video' && videoAssemblyData && videoAssemblyData.cut && videoAssemblyData.cut.segments) {
        // Add event listener for segment selection
        const segmentSelect = document.getElementById('segment-select');
        const sceneSelect = document.getElementById('scene-select');
        const addToTimelineBtn = document.getElementById('add-to-timeline-btn');
        
        segmentSelect.addEventListener('change', () => {
            const segmentOrder = parseInt(segmentSelect.value);
            
            // Clear and disable scene select if no segment is selected
            if (!segmentOrder) {
                sceneSelect.innerHTML = '<option value="">Select a segment first</option>';
                sceneSelect.disabled = true;
                addToTimelineBtn.disabled = true;
                return;
            }
            
            // Find the selected segment
            const selectedSegment = videoAssemblyData.cut.segments.find(segment => segment.order === segmentOrder);
            
            if (selectedSegment && selectedSegment.scenes) {
                // Enable scene select and populate options
                sceneSelect.disabled = false;
                sceneSelect.innerHTML = '<option value="">Select a scene</option>';
                
                // Add scene options
                selectedSegment.scenes.forEach(scene => {
                    const sceneTitle = scene.title || `Scene ${scene.order}`;
                    sceneSelect.innerHTML += `<option value="${scene.order}">${scene.order}. ${sceneTitle}</option>`;
                });
            } else {
                // No scenes found
                sceneSelect.innerHTML = '<option value="">No scenes available</option>';
                sceneSelect.disabled = true;
                addToTimelineBtn.disabled = true;
            }
        });
        
        // Add event listener for scene selection
        sceneSelect.addEventListener('change', () => {
            // Enable the Add to Timeline button if a scene is selected
            addToTimelineBtn.disabled = !sceneSelect.value;
        });
        
        // Add event listener for the Add to Timeline button
        addToTimelineBtn.addEventListener('click', () => {
            addClipToTimeline();
        });
    }
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Displaying file details for ${currentFile.name}</p>`;
}

/**
 * Adds the current file as a clip to the selected timeline
 */
function addClipToTimeline() {
    if (!currentFile || !currentVideoAssemblyData) {
        console.error('No file or video assembly data available');
        return;
    }
    
    // Get form values
    const segmentOrder = parseInt(document.getElementById('segment-select').value);
    const sceneOrder = parseInt(document.getElementById('scene-select').value);
    
    // Get trim values
    const trimStartMinutes = document.getElementById('trim-start-minutes').value ?
        parseInt(document.getElementById('trim-start-minutes').value) : undefined;
    
    const trimStartSeconds = document.getElementById('trim-start-seconds').value ?
        parseFloat(document.getElementById('trim-start-seconds').value) : undefined;
    
    const trimEndMinutes = document.getElementById('trim-end-minutes').value ?
        parseInt(document.getElementById('trim-end-minutes').value) : undefined;
    
    const trimEndSeconds = document.getElementById('trim-end-seconds').value ?
        parseFloat(document.getElementById('trim-end-seconds').value) : undefined;
    
    // Get order and comments
    const clipOrder = document.getElementById('clip-order').value ?
        parseInt(document.getElementById('clip-order').value) : 9999;
    
    const comments = document.getElementById('clip-comments').value;
    
    // Find the segment and scene
    const segment = currentVideoAssemblyData.cut.segments.find(s => s.order === segmentOrder);
    if (!segment) {
        console.error('Selected segment not found');
        return;
    }
    
    const scene = segment.scenes.find(s => s.order === sceneOrder);
    if (!scene) {
        console.error('Selected scene not found');
        return;
    }
    
    // Ensure timeline_clips array exists
    if (!scene.timeline_clips) {
        scene.timeline_clips = [];
    }
    
    // Get the relative path from content sources
    let relativePath = currentFile.path;
    if (currentVideoAssemblyData.composeflow.org &&
        currentVideoAssemblyData.composeflow.org.settings &&
        currentVideoAssemblyData.composeflow.org.settings.common_base_file_path) {
        const basePath = currentVideoAssemblyData.composeflow.org.settings.common_base_file_path;
        if (relativePath.startsWith(basePath)) {
            relativePath = relativePath.substring(basePath.length);
        }
    }
    
    // Create the new clip object
    const newClip = {
        order: clipOrder,
        path: relativePath
    };
    
    // Add optional fields if they exist
    if (trimStartMinutes !== undefined) {
        newClip.trim_start_minutes = trimStartMinutes;
    }
    
    if (trimStartSeconds !== undefined) {
        newClip.trim_start_seconds = trimStartSeconds;
    }
    
    if (trimEndMinutes !== undefined) {
        newClip.trim_end_minutes = trimEndMinutes;
    }
    
    if (trimEndSeconds !== undefined) {
        newClip.trim_end_seconds = trimEndSeconds;
    }
    
    if (comments) {
        newClip.comments = comments;
    }
    
    // Add the clip to the timeline
    scene.timeline_clips.push(newClip);
    
    // Save the updated video assembly data
    saveVideoAssemblyData(currentVideoAssemblyData);
    
    // Switch to the Timeline tab
    switchToTimelineTab();
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Added ${currentFile.name} to timeline in segment ${segmentOrder}, scene ${sceneOrder}</p>`;
}

/**
 * Saves the video assembly data
 * @param {Object} videoAssemblyData - The video assembly data to save
 */
function saveVideoAssemblyData(videoAssemblyData) {
    // Check if we're running in Electron
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        try {
            // Get the electron module
            const electron = require('electron');
            const ipcRenderer = electron.ipcRenderer;
            
            // Send the data directly to the main process for saving
            ipcRenderer.invoke('save-video-assembly-data', videoAssemblyData)
                .then((result) => {
                    if (result && result.success) {
                        console.log(`Video assembly saved to: ${result.filePath}`);
                        
                        // Update the terminal with a message
                        const terminal = document.getElementById('terminal');
                        terminal.innerHTML += `<p>Video assembly saved with updated timeline</p>`;
                    } else {
                        console.error('Error saving video assembly data:', result ? result.error : 'Unknown error');
                    }
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

/**
 * Switches to the Timeline tab
 */
function switchToTimelineTab() {
    const tabs = document.querySelectorAll('.tab');
    
    // Find the Timeline tab
    tabs.forEach(tab => {
        if (tab.textContent.trim() === 'Timeline') {
            // Simulate a click on the Timeline tab
            tab.click();
        }
    });
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
    
    .file-details h3 {
        margin-top: 30px;
        margin-bottom: 15px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 8px;
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
    
    /* Add to Timeline styling */
    .add-to-timeline-section {
        margin-top: 30px;
    }
    
    .add-to-timeline-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .form-row {
        display: flex;
        gap: 15px;
    }
    
    .half-width {
        width: 50%;
    }
    
    .form-control {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
    }
    
    textarea.form-control {
        resize: vertical;
        min-height: 80px;
    }
    
    .form-actions {
        margin-top: 10px;
    }
    
    .btn {
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        border: none;
    }
    
    .btn-primary {
        background-color: #4a86e8;
        color: white;
    }
    
    .btn-primary:hover {
        background-color: #3a76d8;
    }
    
    .btn-primary:disabled {
        background-color: #a0b8e0;
        cursor: not-allowed;
    }
`;
document.head.appendChild(fileTabsStyle);

module.exports = {
    addFileTab
};
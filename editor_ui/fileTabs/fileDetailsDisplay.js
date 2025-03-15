/**
 * fileDetailsDisplay.js
 *
 * Handles the display of file details in the editor.
 */

const { formatDate, formatFileSize } = require('./fileTypeUtils');
const { addClipToTimeline, setCurrentVideoAssemblyData } = require('./fileTimelineIntegration');

/**
 * Updates the editor content to show file details
 * @param {Object} currentFile - The current file object
 * @param {Object} videoAssemblyData - The video assembly data
 */
function updateEditorContent(currentFile, videoAssemblyData) {
    if (!currentFile) {
        clearEditorContent();
        return;
    }
    
    // Store the video assembly data for use in the add to timeline function
    setCurrentVideoAssemblyData(videoAssemblyData);
    
    const editorContent = document.getElementById('editor-content');
    
    // Format dates
    const createdDate = formatDate(currentFile.created);
    const modifiedDate = formatDate(currentFile.modified);
    
    // Format file size
    const fileSize = formatFileSize(currentFile.size);
    
    // Check if the file is in the dismissed_files list
    let isDismissed = false;
    let dismissButtonText = '❌ Dismiss';
    let dismissButtonTitle = 'Dismiss file';
    
    if (videoAssemblyData && videoAssemblyData.cut && videoAssemblyData.cut.dismissed_files) {
        isDismissed = videoAssemblyData.cut.dismissed_files.some(file => file.path === currentFile.path);
        if (isDismissed) {
            dismissButtonText = '✓ Restore';
            dismissButtonTitle = 'Restore file';
        }
    }
    
    // Create HTML for file details
    let html = `
        <div class="file-details">
            <h2>
                ${currentFile.name}
                <button class="copy-icon-btn" title="Copy path to clipboard" onclick="copyToClipboard('${currentFile.name}')">📋 Copy</button>
                <button class="file-action-btn open-file-btn" title="Open file in default application" onclick="openFileInDefaultApp('${currentFile.path.replace(/'/g, "\\'")}')">🔍 Open</button>
                <button class="file-action-btn dismiss-file-btn" title="${dismissButtonTitle}" onclick="toggleFileDismissStatus('${currentFile.path.replace(/'/g, "\\'")}')">
                    ${dismissButtonText}
                </button>
            </h2>
            <div class="file-info">
                <div class="file-info-item">
                    <span class="file-info-label">Path:</span>
                    <div class="file-info-value-container">
                        <span class="file-info-value">${currentFile.path}</span>
                        <button class="copy-icon-btn" title="Copy path to clipboard" onclick="copyToClipboard('${currentFile.path.replace(/'/g, "\\'")}')">📋 Copy</button>
                    </div>
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
        setupTimelineEventListeners(currentFile);
    }
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Displaying file details for ${currentFile.name}</p>`;
}

/**
 * Sets up event listeners for the timeline functionality
 * @param {Object} currentFile - The current file object
 */
function setupTimelineEventListeners(currentFile) {
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
        const videoAssemblyData = require('./fileTimelineIntegration').getCurrentVideoAssemblyData();
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
        addClipToTimeline(currentFile);
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

module.exports = {
    updateEditorContent,
    clearEditorContent
};
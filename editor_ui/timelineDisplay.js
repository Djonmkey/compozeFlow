const path = require('path');
const { ICONS } = require('./uiConstants');

/**
 * Generates an HTML page from the provided video assembly JSON structure.
 *
 * @param {Object} data - Dictionary containing the video assembly data.
 * @returns {string} - The generated HTML content.
 */
function generateHtmlFromVideoAssembly(data) {
    const cut = data.cut || {};
    const title = cut.title || "Untitled";
    const subtitle = cut.subtitle || "";

    let htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            h1 { text-align: center; margin-bottom: 5px; }
            h2 { text-align: center; color: gray; margin-top: 5px; margin-bottom: 20px; }
            h3 { margin-top: 20px; display: inline-block; margin-right: 10px; }
            h4 { margin-top: 10px; font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .clip-path { font-size: 8pt; color: gray; }
            .clip-name { font-weight: bold; }
            .title-container { text-align: center; margin-bottom: 10px; }
            .segment-header { display: flex; align-items: center; margin-bottom: 10px; }
            /* Define render button styles directly instead of importing */
            .render-button-common {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 4px;
                background-color: #4CAF50; /* Standard green button color */
                color: white;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                font-size: 14px;
                font-weight: 500;
            }
            
            .render-button-common:hover {
                background-color: #45a049; /* Slightly darker shade for hover state */
            }
            
            .segment-render-button {
                margin-right: 10px;
            }
            .scene-header {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                margin-left: 20px;
            }
            .scene-render-button {
                margin-right: 10px;
                /* Keep the same font size and padding as segment buttons for consistency */
            }
            
            /* Styles for edit and delete buttons */
            .edit-clip-button, .delete-clip-button {
                padding: 4px 8px;
                margin-right: 5px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
                border: none;
            }
            
            .edit-clip-button {
                background-color: #2196F3;
                color: white;
            }
            
            .edit-clip-button:hover {
                background-color: #0b7dda;
            }
            
            .delete-clip-button {
                background-color: #f44336;
                color: white;
            }
            
            .delete-clip-button:hover {
                background-color: #d32f2f;
            }
            
            /* Modal styles */
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.4);
            }
            
            .modal-content {
                background-color: #fefefe;
                margin: 10% auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
                max-width: 600px;
                border-radius: 5px;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .modal-header h3 {
                margin: 0;
            }
            
            .close-modal {
                color: #aaa;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
            }
            
            .close-modal:hover {
                color: #000;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            
            .form-group input {
                width: 100%;
                padding: 8px;
                box-sizing: border-box;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            
            .form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }
            
            .btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .btn-primary {
                background-color: #4CAF50;
                color: white;
            }
            
            .btn-primary:hover {
                background-color: #45a049;
            }
            
            .btn-secondary {
                background-color: #f1f1f1;
                color: #333;
            }
            
            .btn-secondary:hover {
                background-color: #ddd;
            }
        </style>
        <script>
            function renderSegment(segmentSequence) {
                // Send a message to the parent window to handle the render
                window.parent.postMessage({
                    type: 'render-segment',
                    segmentSequence: segmentSequence
                }, '*');
            }
            
            function renderScene(segmentSequence, sceneSequence) {
                // Send a message to the parent window to handle the render
                window.parent.postMessage({
                    type: 'render-scene',
                    segmentSequence: segmentSequence,
                    sceneSequence: sceneSequence
                }, '*');
            }
            
            function editClip(segmentSequence, sceneSequence, clipSequence, clipType) {
                // Get the clip data from the parent window
                window.parent.postMessage({
                    type: 'get-clip-data',
                    segmentSequence: segmentSequence,
                    sceneSequence: sceneSequence,
                    clipSequence: clipSequence,
                    clipType: clipType
                }, '*');
            }
            
            function deleteClip(segmentSequence, sceneSequence, clipSequence, clipType) {
                if (confirm('Are you sure you want to delete this clip?')) {
                    // Send a message to the parent window to handle the delete
                    window.parent.postMessage({
                        type: 'delete-clip',
                        segmentSequence: segmentSequence,
                        sceneSequence: sceneSequence,
                        clipSequence: clipSequence,
                        clipType: clipType
                    }, '*');
                }
            }
            
            // Function to handle clip edit form submission
            function submitClipEdit(form) {
                const formData = new FormData(form);
                const clipData = {};
                
                // Convert form data to object
                for (const [key, value] of formData.entries()) {
                    clipData[key] = value;
                }
                
                // Get the clip path and comments based on the clip type
                const clipType = clipData.clipType;
                if (clipType === 'video') {
                    clipData.clipPath = document.getElementById('clip-path').value;
                    clipData.comments = document.getElementById('comments').value;
                } else if (clipType === 'image') {
                    clipData.clipPath = document.getElementById('image-path').value;
                    clipData.comments = document.getElementById('image-comments').value;
                }
                
                // Send the updated clip data to the parent window
                window.parent.postMessage({
                    type: 'update-clip',
                    clipData: clipData
                }, '*');
                
                // Close the modal
                document.getElementById('edit-clip-modal').style.display = 'none';
                
                // Prevent form submission
                return false;
            }
            
            // Function to open a file dialog to select a new clip path
            function openFileDialog() {
                // Send a message to the parent window to open a file dialog
                window.parent.postMessage({
                    type: 'open-file-dialog',
                    segmentSequence: document.getElementById('segment-sequence').value,
                    sceneSequence: document.getElementById('scene-sequence').value,
                    clipSequence: document.getElementById('clip-sequence').value,
                    clipType: document.getElementById('clip-type').value
                }, '*');
            }
            
            // Function to populate the edit form with clip data
            function populateEditForm(clipData) {
                const form = document.getElementById('edit-clip-form');
                
                // Set hidden fields
                document.getElementById('segment-sequence').value = clipData.segmentSequence;
                document.getElementById('scene-sequence').value = clipData.sceneSequence;
                document.getElementById('clip-sequence').value = clipData.clipSequence;
                document.getElementById('clip-type').value = clipData.clipType;
                
                // Set visible fields based on clip type
                if (clipData.clipType === 'video') {
                    document.getElementById('clip-path').value = clipData.clipPath || '';
                    document.getElementById('trim-start-minutes').value = clipData.trimStartMinutes || 0;
                    document.getElementById('trim-start-seconds').value = clipData.trimStartSeconds || 0;
                    document.getElementById('trim-end-minutes').value = clipData.trimEndMinutes || 0;
                    document.getElementById('trim-end-seconds').value = clipData.trimEndSeconds || 0;
                    document.getElementById('comments').value = clipData.comments || '';
                    
                    // Show video-specific fields
                    document.getElementById('video-fields').style.display = 'block';
                    document.getElementById('image-fields').style.display = 'none';
                } else if (clipData.clipType === 'image') {
                    document.getElementById('image-path').value = clipData.clipPath || '';
                    document.getElementById('duration-seconds').value = clipData.durationSeconds || 0;
                    document.getElementById('image-comments').value = clipData.comments || '';
                    
                    // Show image-specific fields
                    document.getElementById('video-fields').style.display = 'none';
                    document.getElementById('image-fields').style.display = 'block';
                }
                
                // Show the modal
                document.getElementById('edit-clip-modal').style.display = 'block';
            }
            
            // Function to close the modal
            function closeModal() {
                document.getElementById('edit-clip-modal').style.display = 'none';
            }
            
            // Listen for messages from the parent window
            window.addEventListener('message', function(event) {
                // Check if the message is clip data for editing
                if (event.data && event.data.type === 'clip-data-for-edit') {
                    populateEditForm(event.data.clipData);
                }
                // Check if the message is a new clip path
                else if (event.data && event.data.type === 'new-clip-path') {
                    // Update the clip path in the form
                    if (document.getElementById('clip-type').value === 'video') {
                        document.getElementById('clip-path').value = event.data.newPath;
                    } else {
                        document.getElementById('image-path').value = event.data.newPath;
                    }
                }
            });
            
            // Close modal when clicking outside of it
            window.onclick = function(event) {
                const modal = document.getElementById('edit-clip-modal');
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        </script>
    </head>
    <body>
    `;

    // Process segments
    const segments = cut.segments || [];
    segments.forEach(segment => {
        const segmentTitle = segment.title || "Unnamed Segment";
        const segmentSequence = segment.sequence || segment.order || 0;
        
        htmlContent += `
        <div class="segment-header">
            <button class="segment-render-button render-button-common" onclick="renderSegment(${segmentSequence})" title="Export/Render this segment">${ICONS.RENDER} Render</button>
            <h3>${segmentTitle}</h3>
        </div>\n`;

        const scenes = segment.scenes || [];
        scenes.forEach(scene => {
            const sceneTitle = scene.title;
            const sceneSequence = scene.sequence || scene.order || 0;
            
            if (sceneTitle) {
                htmlContent += `
                <div class="scene-header">
                    <button class="scene-render-button render-button-common" onclick="renderScene(${segmentSequence}, ${sceneSequence})" title="Export/Render this scene">${ICONS.RENDER} Render</button>
                    <h4>${sceneTitle}</h4>
                </div>\n`;
            }
            
            htmlContent += `
            <table>
                <tr>
                    <th>Order</th>
                    <th>File</th>
                    <th>Trim Start (min:sec)</th>
                    <th>Trim End (min:sec)</th>
                    <th>Duration (min:sec)</th>
                    <th>Actions</th>
                </tr>
            `;

            const timelineClipType = scene.timeline_clip_type || "video";
            const timelineClips = scene.timeline_clips || [];

            if (timelineClipType === "video") {
                timelineClips.forEach(clip => {
                    // Ensure sequence is properly displayed as the Order value
                    const sequence = clip.sequence !== undefined ? clip.sequence : "N/A";
                    const clipPath = clip.path || "Unknown Path";

                    let clipStart = "";
                    let clipEnd = "";
                    let duration = "";
                    
                    // Extract optional values safely
                    if ("trim_start_seconds" in clip) {
                        const trimStartMinutes = clip.trim_start_minutes || 0;
                        const trimStartSeconds = parseFloat(clip.trim_start_seconds || 0);
                        clipStart = `${trimStartMinutes}:${trimStartSeconds.toFixed(2).padStart(5, '0')}`;
                    } else {
                        clipStart = "Start of clip";
                    }

                    if ("trim_end_seconds" in clip) {
                        const trimEndMinutes = clip.trim_end_minutes || 0;
                        const trimEndSeconds = parseFloat(clip.trim_end_seconds || 0);
                        clipEnd = `${trimEndMinutes}:${trimEndSeconds.toFixed(2).padStart(5, '0')}`;
                    } else {
                        clipEnd = "End of clip";
                    }
                    
                    // Calculate duration
                    if ("duration_seconds" in clip) {
                        // Use provided duration if available
                        const durationMinutes = Math.floor(clip.duration_seconds / 60);
                        const durationSeconds = clip.duration_seconds % 60;
                        duration = `${durationMinutes}:${durationSeconds.toFixed(2).padStart(5, '0')}`;
                    } else if ("trim_start_seconds" in clip && "trim_end_seconds" in clip) {
                        // Calculate duration from trim points
                        const startTotalSeconds = (clip.trim_start_minutes || 0) * 60 + parseFloat(clip.trim_start_seconds || 0);
                        const endTotalSeconds = (clip.trim_end_minutes || 0) * 60 + parseFloat(clip.trim_end_seconds || 0);
                        const durationSeconds = endTotalSeconds - startTotalSeconds;
                        
                        if (durationSeconds >= 0) {
                            const durationMinutes = Math.floor(durationSeconds / 60);
                            const remainingSeconds = durationSeconds % 60;
                            duration = `${durationMinutes}:${remainingSeconds.toFixed(2).padStart(5, '0')}`;
                        } else {
                            duration = "Calculated on Next Render";
                        }
                    } else {
                        // If either trim start or end is missing
                        duration = "Calculated on Next Render";
                    }

                    const filePath = path.dirname(clipPath);
                    const fileName = path.basename(clipPath);

                    htmlContent += `
                    <tr>
                        <td>${sequence}</td>
                        <td>
                            <div class="clip-path">${filePath}</div>
                            <div class="clip-name">${fileName}</div>
                        </td>
                        <td>${clipStart}</td>
                        <td>${clipEnd}</td>
                        <td>${duration}</td>
                        <td>
                            <button class="edit-clip-button" 
                                onclick="editClip(${segmentSequence}, ${sceneSequence}, ${sequence}, 'video')"
                                title="Edit this clip">✏️ Edit</button>
                            <button class="delete-clip-button" 
                                onclick="deleteClip(${segmentSequence}, ${sceneSequence}, ${sequence}, 'video')"
                                title="Delete this clip">🗑️ Delete</button>
                        </td>
                    </tr>
                    `;
                });
            } else if (timelineClipType === "image") {
                timelineClips.forEach(image => {
                    // Ensure sequence is properly displayed as the Order value
                    const sequence = image.sequence !== undefined ? image.sequence : "N/A";
                    const clipPath = image.path || "Unknown Path";

                    const clipStart = "N/A";
                    const clipEnd = "N/A";
                    let duration = "";
                    
                    // Calculate duration for images
                    if ("duration_seconds" in image) {
                        // Use provided duration if available
                        const durationMinutes = Math.floor(image.duration_seconds / 60);
                        const durationSeconds = image.duration_seconds % 60;
                        duration = `${durationMinutes}:${durationSeconds.toFixed(2).padStart(5, '0')}`;
                    } else {
                        duration = "Calculated on Next Render";
                    }

                    const filePath = path.dirname(clipPath);
                    const fileName = path.basename(clipPath);

                    htmlContent += `
                    <tr>
                        <td>${sequence}</td>
                        <td>
                            <div class="clip-path">${filePath}</div>
                            <div class="clip-name">${fileName}</div>
                        </td>
                        <td>${clipStart}</td>
                        <td>${clipEnd}</td>
                        <td>${duration}</td>
                        <td>
                            <button class="edit-clip-button" 
                                onclick="editClip(${segmentSequence}, ${sceneSequence}, ${sequence}, 'image')"
                                title="Edit this clip">✏️ Edit</button>
                            <button class="delete-clip-button" 
                                onclick="deleteClip(${segmentSequence}, ${sceneSequence}, ${sequence}, 'image')"
                                title="Delete this clip">🗑️ Delete</button>
                        </td>
                    </tr>
                    `;
                });
            }
            htmlContent += "</table>\n";
        });
    });

    // Add the edit clip modal
    htmlContent += `
    <div id="edit-clip-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Clip</h3>
                <span class="close-modal" onclick="closeModal()">&times;</span>
            </div>
            <form id="edit-clip-form" onsubmit="return submitClipEdit(this)">
                <!-- Hidden fields for clip identification -->
                <input type="hidden" id="segment-sequence" name="segmentSequence">
                <input type="hidden" id="scene-sequence" name="sceneSequence">
                <input type="hidden" id="clip-sequence" name="clipSequence">
                <input type="hidden" id="clip-type" name="clipType">
                
                <!-- Video-specific fields -->
                <div id="video-fields">
                    <div class="form-group">
                        <label for="clip-path">Clip Path:</label>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="clip-path" name="clipPath" style="flex: 1;">
                            <button type="button" class="btn btn-secondary" onclick="openFileDialog()" title="Browse for a new clip file">Browse...</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Trim Start:</label>
                        <div style="display: flex; gap: 10px;">
                            <div style="flex: 1;">
                                <label for="trim-start-minutes">Minutes:</label>
                                <input type="number" id="trim-start-minutes" name="trimStartMinutes" min="0" step="1">
                            </div>
                            <div style="flex: 1;">
                                <label for="trim-start-seconds">Seconds:</label>
                                <input type="number" id="trim-start-seconds" name="trimStartSeconds" min="0" step="0.01">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Trim End:</label>
                        <div style="display: flex; gap: 10px;">
                            <div style="flex: 1;">
                                <label for="trim-end-minutes">Minutes:</label>
                                <input type="number" id="trim-end-minutes" name="trimEndMinutes" min="0" step="1">
                            </div>
                            <div style="flex: 1;">
                                <label for="trim-end-seconds">Seconds:</label>
                                <input type="number" id="trim-end-seconds" name="trimEndSeconds" min="0" step="0.01">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="comments">Comments:</label>
                        <input type="text" id="comments" name="comments">
                    </div>
                </div>
                
                <!-- Image-specific fields -->
                <div id="image-fields" style="display: none;">
                    <div class="form-group">
                        <label for="image-path">Image Path:</label>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="image-path" name="clipPath" style="flex: 1;">
                            <button type="button" class="btn btn-secondary" onclick="openFileDialog()" title="Browse for a new image file">Browse...</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="duration-seconds">Duration (seconds):</label>
                        <input type="number" id="duration-seconds" name="durationSeconds" min="0" step="0.1">
                    </div>
                    <div class="form-group">
                        <label for="image-comments">Comments:</label>
                        <input type="text" id="image-comments" name="comments">
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    </div>
    `;

    htmlContent += `
    </body>
    </html>
    `;

    return htmlContent;
}

module.exports = generateHtmlFromVideoAssembly;
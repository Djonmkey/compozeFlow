/**
 * Generates HTML content for the General tab, including title and subtitle editing.
 *
 * @param {Object} data - Dictionary containing the video assembly data.
 * @returns {string} - The generated HTML content.
 */
function generateGeneralHtml(data) {
    const cut = data.cut || {};
    const title = cut.title || "Untitled";
    const subtitle = cut.subtitle || "";
    const description = cut.description || "";

    let htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { margin-bottom: 5px; }
            h2 { color: #666; margin-top: 5px; margin-bottom: 20px; }
            .section { margin-bottom: 30px; }
            .section-title { font-weight: bold; margin-bottom: 10px; }
            .edit-container { margin-bottom: 20px; }
            .edit-label { font-weight: bold; display: block; margin-bottom: 5px; }
            .edit-value { display: flex; align-items: center; }
            .edit-text { font-size: 1.2em; margin-right: 10px; }
            .edit-icon { cursor: pointer; font-size: 1.2em; }
            .edit-controls { display: none; margin-top: 10px; }
            .edit-input { width: 100%; padding: 8px; font-size: 1em; margin-bottom: 10px; }
            .edit-textarea { width: 100%; padding: 8px; font-size: 1em; margin-bottom: 10px; min-height: 100px; }
            .edit-controls button { margin-right: 10px; padding: 5px 10px; cursor: pointer; }
            .info-row { margin-bottom: 15px; }
            .info-label { font-weight: bold; margin-right: 10px; }
        </style>
        <script>
            // Function to handle title editing
            function setupTitleEditing() {
                const titleText = document.getElementById('title-text');
                const editIcon = document.getElementById('edit-title-icon');
                const editControls = document.getElementById('title-edit-controls');
                const editInput = document.getElementById('title-edit-input');
                const saveButton = document.getElementById('title-save-button');
                const cancelButton = document.getElementById('title-cancel-button');
                
                // Show edit input when pencil icon is clicked
                editIcon.addEventListener('click', () => {
                    editInput.value = titleText.textContent;
                    titleText.style.display = 'none';
                    editIcon.style.display = 'none';
                    editControls.style.display = 'block';
                    editInput.focus();
                });
                
                // Handle cancel button
                cancelButton.addEventListener('click', () => {
                    titleText.style.display = 'inline-block';
                    editIcon.style.display = 'inline-block';
                    editControls.style.display = 'none';
                });
                
                // Handle save button
                saveButton.addEventListener('click', () => {
                    const newTitle = editInput.value.trim();
                    if (newTitle) {
                        titleText.textContent = newTitle;
                        
                        // Send message to parent window (renderer process)
                        window.parent.postMessage({
                            type: 'title-updated',
                            newTitle: newTitle
                        }, '*');
                    }
                    
                    titleText.style.display = 'inline-block';
                    editIcon.style.display = 'inline-block';
                    editControls.style.display = 'none';
                });
            }
            
            // Function to handle subtitle editing
            function setupSubtitleEditing() {
                const subtitleText = document.getElementById('subtitle-text');
                const editIcon = document.getElementById('edit-subtitle-icon');
                const editControls = document.getElementById('subtitle-edit-controls');
                const editInput = document.getElementById('subtitle-edit-input');
                const saveButton = document.getElementById('subtitle-save-button');
                const cancelButton = document.getElementById('subtitle-cancel-button');
                
                // Show edit input when pencil icon is clicked
                editIcon.addEventListener('click', () => {
                    editInput.value = subtitleText.textContent;
                    subtitleText.style.display = 'none';
                    editIcon.style.display = 'none';
                    editControls.style.display = 'block';
                    editInput.focus();
                });
                
                // Handle cancel button
                cancelButton.addEventListener('click', () => {
                    subtitleText.style.display = 'inline-block';
                    editIcon.style.display = 'inline-block';
                    editControls.style.display = 'none';
                });
                
                // Handle save button
                saveButton.addEventListener('click', () => {
                    const newSubtitle = editInput.value.trim();
                    if (newSubtitle !== undefined) {
                        subtitleText.textContent = newSubtitle;
                        
                        // Send message to parent window (renderer process)
                        window.parent.postMessage({
                            type: 'subtitle-updated',
                            newSubtitle: newSubtitle
                        }, '*');
                    }
                    
                    subtitleText.style.display = 'inline-block';
                    editIcon.style.display = 'inline-block';
                    editControls.style.display = 'none';
                });
            }
            
            // Initialize when DOM is loaded
            document.addEventListener('DOMContentLoaded', () => {
                setupTitleEditing();
                setupSubtitleEditing();
            });
        </script>
    </head>
    <body>
        <h1>General Settings</h1>
        <p>Edit general information about this video assembly.</p>
        
        <div class="section">
            <div class="edit-container">
                <div class="edit-label">Title</div>
                <div class="edit-value">
                    <div class="edit-text" id="title-text">${title}</div>
                    <span class="edit-icon" id="edit-title-icon" title="Edit title">✏️</span>
                </div>
                <div class="edit-controls" id="title-edit-controls">
                    <input type="text" class="edit-input" id="title-edit-input" value="${title}">
                    <div>
                        <button id="title-save-button">Save</button>
                        <button id="title-cancel-button">Cancel</button>
                    </div>
                </div>
            </div>
            
            <div class="edit-container">
                <div class="edit-label">Subtitle</div>
                <div class="edit-value">
                    <div class="edit-text" id="subtitle-text">${subtitle}</div>
                    <span class="edit-icon" id="edit-subtitle-icon" title="Edit subtitle">✏️</span>
                </div>
                <div class="edit-controls" id="subtitle-edit-controls">
                    <input type="text" class="edit-input" id="subtitle-edit-input" value="${subtitle}">
                    <div>
                        <button id="subtitle-save-button">Save</button>
                        <button id="subtitle-cancel-button">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Video Assembly Information</div>
            <div class="info-row">
                <span class="info-label">Number of Segments:</span>
                <span>${(cut.segments || []).length}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Min Length:</span>
                <span>${cut.min_len_seconds || 'Not specified'} seconds</span>
            </div>
            <div class="info-row">
                <span class="info-label">Max Length:</span>
                <span>${cut.max_len_seconds || 'Not specified'} seconds</span>
            </div>
        </div>
    </body>
    </html>`;

    return htmlContent;
}

module.exports = generateGeneralHtml;
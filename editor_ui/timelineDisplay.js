const path = require('path');

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
            h1 { text-align: center; display: inline-block; margin-right: 10px; }
            h2 { text-align: center; color: gray; }
            h3 { margin-top: 20px; }
            h4 { margin-top: 10px; font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .clip-path { font-size: 8pt; color: gray; }
            .clip-name { font-weight: bold; }
            .title-container { text-align: center; margin-bottom: 10px; }
            .edit-icon { cursor: pointer; font-size: 1.2em; vertical-align: middle; }
            .edit-controls { display: none; margin-top: 10px; }
            .edit-controls button { margin-right: 10px; padding: 5px 10px; cursor: pointer; }
            .edit-input { font-size: 1.8em; width: 80%; padding: 5px; margin-bottom: 10px; font-weight: bold; text-align: center; }
        </style>
        <script>
            // Function to handle title editing
            function setupTitleEditing() {
                const titleContainer = document.getElementById('title-container');
                const titleElement = document.getElementById('title-element');
                const editIcon = document.getElementById('edit-title-icon');
                const editControls = document.getElementById('edit-controls');
                const editInput = document.getElementById('edit-input');
                const saveButton = document.getElementById('save-button');
                const cancelButton = document.getElementById('cancel-button');
                
                // Show edit input when pencil icon is clicked
                editIcon.addEventListener('click', () => {
                    editInput.value = titleElement.textContent;
                    titleElement.style.display = 'none';
                    editIcon.style.display = 'none';
                    editControls.style.display = 'block';
                    editInput.focus();
                });
                
                // Handle cancel button
                cancelButton.addEventListener('click', () => {
                    titleElement.style.display = 'inline-block';
                    editIcon.style.display = 'inline-block';
                    editControls.style.display = 'none';
                });
                
                // Handle save button
                saveButton.addEventListener('click', () => {
                    const newTitle = editInput.value.trim();
                    if (newTitle) {
                        titleElement.textContent = newTitle;
                        
                        // Send message to parent window (renderer process)
                        window.parent.postMessage({
                            type: 'title-updated',
                            newTitle: newTitle
                        }, '*');
                    }
                    
                    titleElement.style.display = 'inline-block';
                    editIcon.style.display = 'inline-block';
                    editControls.style.display = 'none';
                });
            }
            
            // Initialize when DOM is loaded
            document.addEventListener('DOMContentLoaded', setupTitleEditing);
        </script>
    </head>
    <body>
        <div class="title-container" id="title-container">
            <h1 id="title-element">${title}</h1>
            <span class="edit-icon" id="edit-title-icon" title="Edit title">✏️</span>
            <div class="edit-controls" id="edit-controls">
                <input type="text" class="edit-input" id="edit-input" value="${title}">
                <div>
                    <button id="save-button">Save</button>
                    <button id="cancel-button">Cancel</button>
                </div>
            </div>
        </div>
        <h2>${subtitle}</h2>
    `;

    // Process segments
    const segments = cut.segments || [];
    segments.forEach(segment => {
        const segmentTitle = segment.title || "Unnamed Segment";
        htmlContent += `<h3>${segmentTitle}</h3>\n`;

        const scenes = segment.scenes || [];
        scenes.forEach(scene => {
            const sceneTitle = scene.title;
            if (sceneTitle) {
                htmlContent += `<h4>${sceneTitle}</h4>\n`;
            }

            htmlContent += `
            <table>
                <tr>
                    <th>Sequence</th>
                    <th>Clip File Pathname</th>
                    <th>Trim Start (min:sec)</th>
                    <th>Trim End (min:sec)</th>
                </tr>
            `;

            const timelineClipType = scene.timeline_clip_type || "video";
            const timelineClips = scene.timeline_clips || [];

            if (timelineClipType === "video") {
                timelineClips.forEach(clip => {
                    const sequence = clip.sequence || "N/A";
                    const clipPath = clip.clip_file_pathname || "Unknown Path";

                    let clipStart = "";
                    let clipEnd = "";
                    
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
                    </tr>
                    `;
                });
            } else if (timelineClipType === "image") {
                timelineClips.forEach(image => {
                    const sequence = image.sequence || "N/A";
                    const clipPath = image.clip_file_pathname || "Unknown Path";

                    const clipStart = "Start of clip";
                    const clipEnd = "End of clip";

                    const filePath = path.dirname(clipPath);
                    const fileName = path.basename(clipPath);

                    htmlContent += `
                    <tr>
                        <td>${sequence}</td>
                        <td>
                            <div class="clip-path">${filePath}</div>
                            <div class="clip-name">${fileName}</div>
                        </td>
                        <td>N/A</td>
                        <td>N/A</td>
                    </tr>
                    `;
                });
            }
            htmlContent += "</table>\n";
        });
    });

    htmlContent += `
    </body>
    </html>
    `;

    return htmlContent;
}

module.exports = generateHtmlFromVideoAssembly;
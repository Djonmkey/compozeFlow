/**
 * timelineHtmlGenerator.js
 *
 * Generates HTML for the Timeline tab from video assembly data.
 */

const path = require('path');
const { ICONS } = require('../uiConstants');
const getTimelineStyles = require('./timelineStyles');
const getTimelineEventHandlers = require('./timelineEventHandlers');

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
            ${getTimelineStyles()}
        </style>
        <script>
            ${getTimelineEventHandlers()}
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
                    
                    // Determine if up/down arrows should be shown
                    const isFirstClip = timelineClips.findIndex(c => c.sequence === Math.min(...timelineClips.map(c => c.sequence))) === timelineClips.findIndex(c => c.sequence === sequence);
                    const isLastClip = timelineClips.findIndex(c => c.sequence === Math.max(...timelineClips.map(c => c.sequence))) === timelineClips.findIndex(c => c.sequence === sequence);
                    
                    // Create up/down arrow HTML
                    const upArrowHtml = !isFirstClip ? `<span class="sequence-arrow up-arrow" onclick="moveClipUp(${segmentSequence}, ${sceneSequence}, ${sequence}, 'video')" title="Move clip up">▲</span>` : '';
                    const downArrowHtml = !isLastClip ? `<span class="sequence-arrow down-arrow" onclick="moveClipDown(${segmentSequence}, ${sceneSequence}, ${sequence}, 'video')" title="Move clip down">▼</span>` : '';

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
                        <td>
                            <span>${sequence}</span>
                            <span class="sequence-arrows">
                                ${upArrowHtml}
                                ${downArrowHtml}
                            </span>
                        </td>
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
                    
                    // Add a row for comments if they exist (check both comments and comment properties)
                    const clipComment = clip.comments || clip.comment;
                    if (clipComment && clipComment.trim() !== '') {
                        htmlContent += `
                        <tr>
                            <td colspan="6" style="background-color: #f9f9f9; font-style: italic; padding-left: 20px;">
                                <strong>Comment:</strong> ${clipComment}
                            </td>
                        </tr>
                        `;
                    }
                });
            } else if (timelineClipType === "image") {
                timelineClips.forEach(image => {
                    // Ensure sequence is properly displayed as the Order value
                    const sequence = image.sequence !== undefined ? image.sequence : "N/A";
                    const clipPath = image.path || "Unknown Path";
                    
                    // Determine if up/down arrows should be shown
                    const isFirstClip = timelineClips.findIndex(c => c.sequence === Math.min(...timelineClips.map(c => c.sequence))) === timelineClips.findIndex(c => c.sequence === sequence);
                    const isLastClip = timelineClips.findIndex(c => c.sequence === Math.max(...timelineClips.map(c => c.sequence))) === timelineClips.findIndex(c => c.sequence === sequence);
                    
                    // Create up/down arrow HTML
                    const upArrowHtml = !isFirstClip ? `<span class="sequence-arrow up-arrow" onclick="moveClipUp(${segmentSequence}, ${sceneSequence}, ${sequence}, 'image')" title="Move clip up">▲</span>` : '';
                    const downArrowHtml = !isLastClip ? `<span class="sequence-arrow down-arrow" onclick="moveClipDown(${segmentSequence}, ${sceneSequence}, ${sequence}, 'image')" title="Move clip down">▼</span>` : '';

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
                        <td>
                            <span>${sequence}</span>
                            <span class="sequence-arrows">
                                ${upArrowHtml}
                                ${downArrowHtml}
                            </span>
                        </td>
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
                    
                    // Add a row for comments if they exist (check both comments and comment properties)
                    const imageComment = image.comments || image.comment;
                    if (imageComment && imageComment.trim() !== '') {
                        htmlContent += `
                        <tr>
                            <td colspan="6" style="background-color: #f9f9f9; font-style: italic; padding-left: 20px;">
                                <strong>Comment:</strong> ${imageComment}
                            </td>
                        </tr>
                        `;
                    }
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
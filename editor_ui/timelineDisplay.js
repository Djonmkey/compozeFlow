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
            h1 { text-align: center; margin-bottom: 5px; }
            h2 { text-align: center; color: gray; margin-top: 5px; margin-bottom: 20px; }
            h3 { margin-top: 20px; }
            h4 { margin-top: 10px; font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .clip-path { font-size: 8pt; color: gray; }
            .clip-name { font-weight: bold; }
            .title-container { text-align: center; margin-bottom: 10px; }
        </style>
        <script>
            // No script needed for timeline display
        </script>
    </head>
    <body>
        <div class="title-container">
            <h1>${title}</h1>
        </div>
        <div class="title-container">
            <h2>${subtitle}</h2>
        </div>
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
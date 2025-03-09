const path = require('path');

/**
 * Generates an HTML page displaying only the sequential audio clips from the provided video assembly JSON structure.
 *
 * @param {Object} data - Dictionary containing the video assembly data.
 * @returns {string} - The generated HTML content.
 */
function generateMixedAudioHtml(data) {
    const cut = data.cut || {};
    const title = cut.title || "Untitled";
    const subtitle = cut.subtitle || "";

    let htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Mixed Audio</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            h1 { text-align: center; display: inline-block; margin-right: 10px; }
            h2 { text-align: center; color: gray; display: inline-block; margin-right: 10px; }
            h3 { margin-top: 20px; }
            h4 { margin-top: 10px; font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .audio-path { font-size: 8pt; color: gray; }
            .audio-name { font-weight: bold; }
            .title-container { text-align: center; margin-bottom: 10px; }
            .volume-info { color: #666; font-style: italic; }
        </style>
    </head>
    <body>
    `;

    // Process segments to extract sequential audio clips
    const segments = cut.segments || [];
    let hasAudioClips = false;

    segments.forEach(segment => {
        const segmentTitle = segment.title || "Unnamed Segment";
        let segmentHasAudio = false;
        let segmentContent = `<h3>${segmentTitle}</h3>\n`;

        // Process scenes within the segment
        const scenes = segment.scenes || [];
        scenes.forEach(scene => {
            const sceneTitle = scene.title;
            const sequentialAudioClips = scene.sequential_audio_clips || [];
            const volume = scene.sequential_audio_timeline_clips_volume || 1.0;
            
            if (sequentialAudioClips.length > 0) {
                hasAudioClips = true;
                segmentHasAudio = true;
                
                if (sceneTitle) {
                    segmentContent += `<h4>${sceneTitle}</h4>\n`;
                }

                segmentContent += `
                <table>
                    <tr>
                        <th>Order</th>
                        <th>Audio File</th>
                        <th>Volume</th>
                    </tr>
                `;

                sequentialAudioClips.forEach(audio => {
                    const sequence = audio.order || "N/A";
                    const audioPath = audio.path || "Unknown Path";
                    const filePath = path.dirname(audioPath);
                    const fileName = path.basename(audioPath);

                    segmentContent += `
                    <tr>
                        <td>${sequence}</td>
                        <td>
                            <div class="audio-path">${filePath}</div>
                            <div class="audio-name">${fileName}</div>
                        </td>
                        <td class="volume-info">${volume.toFixed(2)}</td>
                    </tr>
                    `;
                });

                segmentContent += "</table>\n";
            }
        });

        // Only add the segment content if it has audio clips
        if (segmentHasAudio) {
            htmlContent += segmentContent;
        }
    });

    if (!hasAudioClips) {
        htmlContent += `<p style="text-align: center;">No sequential audio clips found in this video assembly.</p>`;
    }

    htmlContent += `
    </body>
    </html>
    `;

    return htmlContent;
}

module.exports = generateMixedAudioHtml;
const path = require('path');

/**
 * Generates an HTML page displaying only the overlay images from the provided video assembly JSON structure.
 *
 * @param {Object} data - Dictionary containing the video assembly data.
 * @returns {string} - The generated HTML content.
 */
function generateOverlayImagesHtml(data) {
    const cut = data.cut || {};
    const title = cut.title || "Untitled";
    const subtitle = cut.subtitle || "";

    let htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Overlay Images</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            h1 { text-align: center; display: inline-block; margin-right: 10px; }
            h2 { text-align: center; color: gray; display: inline-block; margin-right: 10px; }
            h3 { margin-top: 20px; }
            h4 { margin-top: 10px; font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .image-path { font-size: 8pt; color: gray; }
            .image-name { font-weight: bold; }
            .title-container { text-align: center; margin-bottom: 10px; }
            .position-info { color: #666; font-style: italic; }
        </style>
    </head>
    <body>
        <div class="title-container">
            <h1>${title}</h1>
        </div>
        <div class="title-container">
            <h2>${subtitle}</h2>
        </div>
        <h2 style="text-align: center; display: block;">Overlay Images</h2>
    `;

    // Process segments to extract overlay images
    const segments = cut.segments || [];
    let hasOverlayImages = false;

    segments.forEach(segment => {
        const segmentTitle = segment.title || "Unnamed Segment";
        const overlayImages = segment.overlay_images || [];
        
        if (overlayImages.length > 0) {
            hasOverlayImages = true;
            htmlContent += `<h3>${segmentTitle}</h3>\n`;

            htmlContent += `
            <table>
                <tr>
                    <th>Image File</th>
                    <th>Position</th>
                </tr>
            `;

            overlayImages.forEach(image => {
                const imagePath = image.image_file_pathname || "Unknown Path";
                const filePath = path.dirname(imagePath);
                const fileName = path.basename(imagePath);
                
                // Extract position information if available
                let positionInfo = "Default";
                if (image.position) {
                    if (image.position.type === "preset") {
                        positionInfo = `Preset: ${image.position.value}`;
                    } else if (image.position.type === "custom") {
                        positionInfo = `Custom: X=${image.position.x || 0}, Y=${image.position.y || 0}`;
                    }
                }

                htmlContent += `
                <tr>
                    <td>
                        <div class="image-path">${filePath}</div>
                        <div class="image-name">${fileName}</div>
                    </td>
                    <td class="position-info">${positionInfo}</td>
                </tr>
                `;
            });

            htmlContent += "</table>\n";
        }
    });

    if (!hasOverlayImages) {
        htmlContent += `<p style="text-align: center;">No overlay images found in this video assembly.</p>`;
    }

    htmlContent += `
    </body>
    </html>
    `;

    return htmlContent;
}

module.exports = generateOverlayImagesHtml;
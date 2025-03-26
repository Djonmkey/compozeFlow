/**
 * Generates HTML content for the Export tab.
 *
 * @param {Object} data - Dictionary containing the video assembly data.
 * @returns {string} - The generated HTML content.
 */
function generateExportHtml(data) {
    let htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Export</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                padding: 20px; 
            }
            h1 { margin-bottom: 15px; }
        </style>
    </head>
    <body>
        <h1>Export</h1>
    </body>
    </html>`;

    return htmlContent;
}

module.exports = generateExportHtml;

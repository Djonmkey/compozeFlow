/**
 * Generates HTML content for the Render tab of the video assembly editor.
 * This tab is intentionally left blank to prevent application crashes.
 *
 * @param {Object} data - Dictionary containing the video assembly data.
 * @returns {string} - The generated HTML content.
 */
function generateRenderHtml(data) {
    // Return a minimal blank HTML structure with no interactive elements
    let htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Render Tab</title>
        <style>
            body { 
                margin: 0;
                padding: 0;
                height: 100vh;
                background-color: white;
            }
        </style>
    </head>
    <body>
        <!-- Intentionally left blank -->
    </body>
    </html>`;

    return htmlContent;
}

module.exports = generateRenderHtml;

/**
 * Generates HTML content for the Render tab of the video assembly editor.
 * This tab has a minimal structure without any automatic JS execution,
 * but still provides the necessary elements for other components.
 *
 * @param {Object} data - Dictionary containing the video assembly data.
 * @returns {string} - The generated HTML content.
 */
function generateRenderHtml(data) {
    let htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Render Tab</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                padding: 20px; 
            }
            h1 { 
                margin-bottom: 5px; 
            }
            p { 
                margin-bottom: 20px; 
            }
            .render-section { 
                margin-bottom: 30px; 
                padding: 20px; 
                background-color: #f8f8f8; 
                border-radius: 8px; 
                border: 1px solid #ddd;
            }
            .render-status {
                padding: 15px;
                background-color: #e6f7ff;
                border-left: 4px solid #1890ff;
                margin-bottom: 20px;
            }
            #render-status-text {
                margin: 0;
            }
        </style>
    </head>
    <body>
        <h1>Render Video</h1>
        <p>Configure render settings and start the rendering process for your video assembly.</p>
        
        <div class="render-status">
            <h3>Render Status</h3>
            <p id="render-status-text">Ready to render</p>
        </div>
        
        <div class="render-section">
            <h2>Render Controls</h2>
            <p>
                Use the render button in the top bar to start rendering your video. 
                Rendering may take some time depending on the length and complexity of your video assembly.
            </p>
        </div>
    </body>
    </html>`;

    return htmlContent;
}

module.exports = generateRenderHtml;

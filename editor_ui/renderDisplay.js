/**
 * Generates HTML content for the Render tab of the video assembly editor.
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
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { margin-bottom: 5px; }
            p { margin-bottom: 20px; }
            .render-section { 
                margin-bottom: 30px; 
                padding: 20px; 
                background-color: #f8f8f8; 
                border-radius: 8px; 
                border: 1px solid #ddd;
            }
            .render-section h2 {
                margin-top: 0;
                color: #333;
            }
            .render-status {
                padding: 15px;
                background-color: #e6f7ff;
                border-left: 4px solid #1890ff;
                margin-bottom: 20px;
            }
            .render-controls {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            .render-button {
                padding: 10px 20px;
                background-color: #1890ff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            }
            .render-button:hover {
                background-color: #40a9ff;
            }
            .render-button:disabled {
                background-color: #cccccc;
                cursor: not-allowed;
            }
            .render-history {
                margin-top: 30px;
            }
            .history-item {
                padding: 10px;
                border-bottom: 1px solid #eee;
            }
            .history-item:last-child {
                border-bottom: none;
            }
        </style>
        <script>
            // Function to handle render button click
            function handleRenderClick() {
                // Send message to parent window (renderer process)
                window.parent.postMessage({
                    type: 'render-video',
                    data: {}
                }, '*');
                
                // Update the status display
                document.getElementById('render-status-text').textContent = 'Render initiated...';
            }
            
            // Initialize when DOM is loaded
            document.addEventListener('DOMContentLoaded', () => {
                const renderButton = document.getElementById('start-render-button');
                if (renderButton) {
                    renderButton.addEventListener('click', handleRenderClick);
                }
            });
        </script>
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
            <div class="render-controls">
                <button id="start-render-button" class="render-button">Start Render</button>
                <button id="cancel-render-button" class="render-button" disabled>Cancel</button>
            </div>
            
            <p>
                Start the render process to create your final video file. Rendering may take some time depending 
                on the length and complexity of your video assembly.
            </p>
        </div>
        
        <div class="render-section render-history">
            <h2>Render History</h2>
            <div id="render-history-list">
                <div class="history-item">No previous renders found.</div>
            </div>
        </div>
    </body>
    </html>`;

    return htmlContent;
}

module.exports = generateRenderHtml;

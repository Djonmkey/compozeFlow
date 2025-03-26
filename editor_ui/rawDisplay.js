/**
 * Generates HTML content for the Raw tab of the video assembly editor.
 * This tab displays the raw JSON data of the video assembly.
 *
 * @param {Object} data - Dictionary containing the video assembly data.
 * @returns {string} - The generated HTML content.
 */
function generateRawHtml(data) {
    // Create a formatted JSON string with proper indentation
    const formattedJson = JSON.stringify(data, null, 4);
    
    let htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Raw JSON Data</title>
        <style>
            body { 
                font-family: Monaco, Menlo, Consolas, 'Courier New', monospace; 
                line-height: 1.6; 
                padding: 20px; 
                background-color: #f8f8f8;
            }
            h1 { margin-bottom: 15px; font-family: Arial, sans-serif; }
            .info-text { 
                font-family: Arial, sans-serif; 
                margin-bottom: 20px; 
                color: #666;
            }
            .json-container {
                background-color: #fff;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 15px;
                overflow: auto;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                white-space: pre;
                font-size: 14px;
            }
            .copy-button {
                display: inline-block;
                padding: 8px 16px;
                margin-bottom: 15px;
                background-color: #4285f4;
                color: white;
                border: none;
                border-radius: 4px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                cursor: pointer;
            }
            .copy-button:hover {
                background-color: #3367d6;
            }
            .success-message {
                display: none;
                color: #0f9d58;
                margin-left: 10px;
                font-family: Arial, sans-serif;
            }
        </style>
        <script>
            function copyToClipboard() {
                const jsonText = document.getElementById('json-data').textContent;
                
                // Use the clipboard API if available
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(jsonText)
                        .then(() => showSuccess())
                        .catch(err => console.error('Could not copy text: ', err));
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = jsonText;
                    textArea.style.position = 'fixed';  // Avoid scrolling to bottom
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    try {
                        const successful = document.execCommand('copy');
                        if (successful) {
                            showSuccess();
                        } else {
                            console.error('Copying failed');
                        }
                    } catch (err) {
                        console.error('Error in copying: ', err);
                    }
                    
                    document.body.removeChild(textArea);
                }
            }
            
            function showSuccess() {
                const successMessage = document.getElementById('success-message');
                successMessage.style.display = 'inline';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 2000);
            }
        </script>
    </head>
    <body>
        <h1>Raw Video Assembly Data</h1>
        <p class="info-text">This view shows the raw JSON structure of the current video assembly.</p>
        
        <button class="copy-button" onclick="copyToClipboard()">Copy to Clipboard</button>
        <span id="success-message" class="success-message">✓ Copied!</span>
        
        <div class="json-container">
            <pre id="json-data">${escapeHtml(formattedJson)}</pre>
        </div>
    </body>
    </html>`;

    return htmlContent;
}

/**
 * Escapes HTML special characters to prevent XSS when displaying raw content
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

module.exports = generateRawHtml;

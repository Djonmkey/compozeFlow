/**
 * contentSources/styles.js
 * 
 * CSS styles for the content sources display.
 */

/**
 * Initializes the CSS styles for the content sources display
 */
function initializeStyles() {
    // Create a style element if it doesn't already exist
    let styleElement = document.getElementById('content-sources-styles');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'content-sources-styles';
        document.head.appendChild(styleElement);
    }

    // Set the CSS content
    styleElement.textContent = `
        /* Dismissed files styling */
        .dismissed-files-section {
            margin-top: 20px;
            border-top: 2px dashed #ffb0b0;
            padding-top: 10px;
        }
        
        .dismissed-files-section .explorer-section-header {
            background-color: #fff0f0;
        }
        
        .dismissed-files-count {
            font-size: 12px;
            color: #888;
            margin-left: 5px;
        }
        
        .explorer-file.dismissed .explorer-name {
            text-decoration: line-through;
            color: #888;
        }
        
        /* Occurrence count styling */
        .occurrence-count {
            font-size: 12px;
            color: #0066cc;
            margin-left: 5px;
            font-weight: bold;
        }
        
        /* Dialog styling */
        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .dialog-content {
            background-color: white;
            border-radius: 4px;
            padding: 20px;
            width: 400px;
            max-width: 90%;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .dialog-form {
            margin-top: 15px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .form-group input[type="text"] {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        
        .dialog-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }
        
        .dialog-buttons button {
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        
        #dialog-cancel {
            background-color: #f5f5f5;
            border: 1px solid #ccc;
        }
        
        #dialog-add, #dialog-remove {
            background-color: #4a86e8;
            color: white;
            border: none;
        }
        
        #dialog-remove {
            background-color: #e84a4a;
        }
    `;
}

module.exports = {
    initializeStyles
};
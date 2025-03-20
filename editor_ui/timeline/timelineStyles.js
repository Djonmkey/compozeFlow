/**
 * timelineStyles.js
 *
 * Contains CSS styles for the Timeline tab.
 */

/**
 * Returns the CSS styles for the Timeline tab
 * @returns {string} CSS styles as a string
 */
function getTimelineStyles() {
    return `
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        h1 { text-align: center; margin-bottom: 5px; }
        h2 { text-align: center; color: gray; margin-top: 5px; margin-bottom: 20px; }
        h3 { margin-top: 20px; display: inline-block; margin-right: 10px; }
        h4 { margin-top: 10px; font-style: italic; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .clip-path { font-size: 8pt; color: gray; }
        .clip-name { font-weight: bold; }
        .title-container { text-align: center; margin-bottom: 10px; }
        .segment-header { display: flex; align-items: center; margin-bottom: 10px; }
        
        /* Render button styles */
        .render-button-common {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 4px;
            background-color: #4CAF50; /* Standard green button color */
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            font-size: 14px;
            font-weight: 500;
        }
        
        .render-button-common:hover {
            background-color: #45a049; /* Slightly darker shade for hover state */
        }
        
        .segment-render-button {
            margin-right: 10px;
        }
        
        .scene-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            margin-left: 20px;
        }
        
        .scene-render-button {
            margin-right: 10px;
        }
        
        /* Styles for edit and delete buttons */
        .edit-clip-button, .delete-clip-button {
            padding: 4px 8px;
            margin-right: 5px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            border: none;
        }
        
        .edit-clip-button {
            background-color: #2196F3;
            color: white;
        }
        
        .edit-clip-button:hover {
            background-color: #0b7dda;
        }
        
        .delete-clip-button {
            background-color: #f44336;
            color: white;
        }
        
        .delete-clip-button:hover {
            background-color: #d32f2f;
        }
        
        /* Sequence arrow styles */
        .sequence-arrows {
            display: inline-flex;
            align-items: center;
            margin-left: 8px;
        }
        
        .sequence-arrow {
            cursor: pointer;
            font-size: 10px;
            color: #555;
            margin: 0 2px;
            transition: color 0.2s ease;
        }
        
        .sequence-arrow:hover {
            color: #000;
        }
        
        /* Modal styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.4);
        }
        
        .modal-content {
            background-color: #fefefe;
            margin: 10% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 600px;
            border-radius: 5px;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .modal-header h3 {
            margin: 0;
        }
        
        .close-modal {
            color: #aaa;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .close-modal:hover {
            color: #000;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .form-group input {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .btn-primary {
            background-color: #4CAF50;
            color: white;
        }
        
        .btn-primary:hover {
            background-color: #45a049;
        }
        
        .btn-secondary {
            background-color: #f1f1f1;
            color: #333;
        }
        
        .btn-secondary:hover {
            background-color: #ddd;
        }
    `;
}

module.exports = getTimelineStyles;
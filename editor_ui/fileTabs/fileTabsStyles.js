/**
 * fileTabsStyles.js
 *
 * CSS styles for file tabs and related UI elements.
 */

/**
 * Applies CSS styles for file tabs to the document
 */
function applyFileTabsStyles() {
    const fileTabsStyle = document.createElement('style');
    fileTabsStyle.textContent = `
    /* File tab styling */
    .tab.file-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
    }
    
    .tab.file-tab.active {
        background-color: #ddd;
        font-weight: bold;
    }
    
    .tab-name {
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .tab-close {
        font-size: 16px;
        font-weight: bold;
        color: #888;
        cursor: pointer;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    
    .tab-close:hover {
        background-color: #ccc;
        color: #333;
    }
    
    /* File details styling */
    .file-details {
        padding: 20px;
    }
    
    .file-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
    }
    
    .file-header h2 {
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
    }
    
    .file-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }
    
    .file-details h3 {
        margin-top: 30px;
        margin-bottom: 15px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 8px;
    }
    
    .file-info {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .file-info-item {
        display: flex;
        align-items: flex-start;
    }
    
    .file-info-label {
        font-weight: bold;
        width: 100px;
        flex-shrink: 0;
    }
    
    .file-info-value-container {
        display: flex;
        align-items: center;
        flex: 1;
    }
    
    .file-info-value {
        word-break: break-all;
        margin-right: 10px;
        flex: 1;
    }
    
    .copy-icon-btn, .file-action-btn {
        cursor: pointer;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        color: #333;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        margin-left: 5px;
    }
    
    .copy-icon-btn:hover, .file-action-btn:hover {
        background-color: #e0e0e0;
    }
    
    .open-file-btn {
        background-color: #e8f4ff;
        border-color: #a0c8ff;
    }
    
    .open-file-btn:hover {
        background-color: #d0e8ff;
    }
    
    .dismiss-file-btn {
        background-color: #fff0f0;
        border-color: #ffb0b0;
    }
    
    .dismiss-file-btn:hover {
        background-color: #ffe0e0;
    }
    
    /* Strikethrough style for dismissed files */
    .explorer-file.dismissed .explorer-name {
        text-decoration: line-through;
        color: #888;
    }
    
    .search-result-item.dismissed .explorer-name {
        text-decoration: line-through;
        color: #888;
    }
    
    /* Add to Timeline styling */
    .add-to-timeline-section {
        margin-top: 30px;
    }
    
    .add-to-timeline-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .form-row {
        display: flex;
        gap: 15px;
    }
    
    .half-width {
        width: 50%;
    }
    
    .form-control {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
    }
    
    textarea.form-control {
        resize: vertical;
        min-height: 80px;
    }
    
    .form-actions {
        margin-top: 10px;
    }
    
    .btn {
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        border: none;
    }
    
    .btn-primary {
        background-color: #4a86e8;
        color: white;
    }
    
    .btn-primary:hover {
        background-color: #3a76d8;
    }
    
    .btn-primary:disabled {
        background-color: #a0b8e0;
        cursor: not-allowed;
    }
    
    /* File usages styling */
    .file-usages-section {
        margin-top: 30px;
    }
    
    .file-usages-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-top: 15px;
    }
    
    .file-usage-item {
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .file-usage-header {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background-color: #f5f5f5;
        border-bottom: 1px solid #ddd;
    }
    
    .file-usage-number {
        font-weight: bold;
        margin-right: 10px;
        color: #555;
    }
    
    .file-usage-type {
        font-weight: bold;
        color: #0066cc;
    }
    
    .file-usage-details {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .file-usage-detail {
        display: flex;
        align-items: flex-start;
    }
    
    .file-usage-label {
        font-weight: bold;
        width: 100px;
        flex-shrink: 0;
    }
    
    .file-usage-value {
        word-break: break-all;
    }
`;
    document.head.appendChild(fileTabsStyle);
}

module.exports = {
    applyFileTabsStyles
};
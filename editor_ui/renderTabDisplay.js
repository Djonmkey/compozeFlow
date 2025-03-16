/**
 * renderTabDisplay.js
 *
 * Handles the display and functionality of the Render tab,
 * showing output files from render paths and providing play functionality.
 */

// Import required modules
const electronSetup = require('./electronSetup');
const renderProcessManager = require('./renderProcessManager');
const videoAssemblyManager = require('./videoAssemblyManager');
const { ICONS } = require('./uiConstants');

// Store the interval ID for refreshing the render tab content
let refreshIntervalId = null;

/**
 * Generate HTML for the Render tab
 * @returns {string} HTML content for the Render tab
 */
function generateRenderTabHtml() {
    const currentVideoAssemblyData = videoAssemblyManager.getCurrentVideoAssemblyData();
    
    // If no video assembly data is available, show a message
    if (!currentVideoAssemblyData || !currentVideoAssemblyData.cut || !currentVideoAssemblyData.cut.render_output || !currentVideoAssemblyData.cut.render_output.output_paths) {
        return `
            <div class="render-tab-container">
                <h2>Render Output</h2>
                <p>No render output paths configured. Please set up render output paths in the Output tab.</p>
            </div>
        `;
    }
    
    // Get the output paths from the video assembly data
    const outputPaths = currentVideoAssemblyData.cut.render_output.output_paths;
    
    // Get the supported video file extensions
    const supportedVideoExtensions = currentVideoAssemblyData["composeflow.org"] ? 
        currentVideoAssemblyData["composeflow.org"].supported_video_file_extensions || [".mp4", ".avi", ".mov", ".mkv"] :
        [".mp4", ".avi", ".mov", ".mkv"];
    
    // Check if rendering is in progress
    const isRendering = renderProcessManager.isRenderingInProgress();
    
    // Start building the HTML content
    let html = `
        <div class="render-tab-container">
            <h2>Render Output</h2>
            <p>Showing files from render output paths. ${isRendering ? '<span class="rendering-status">Render in progress...</span>' : ''}</p>
            <p class="last-refresh">Last refreshed: ${new Date().toLocaleTimeString()}</p>
    `;
    
    // Function to create a section for each output path
    const createOutputPathSection = (pathType, path) => {
        if (!path) return ''; // Skip if path is empty
        
        // Get files in the directory
        let files = [];
        try {
            if (electronSetup.fs.existsSync(path)) {
                files = electronSetup.fs.readdirSync(path)
                    .filter(file => {
                        const stats = electronSetup.fs.statSync(electronSetup.path.join(path, file));
                        return stats.isFile(); // Only include files, not directories
                    })
                    .map(file => {
                        const filePath = electronSetup.path.join(path, file);
                        const stats = electronSetup.fs.statSync(filePath);
                        return {
                            name: file,
                            path: filePath,
                            size: formatFileSize(stats.size),
                            mtime: stats.mtime,
                            extension: electronSetup.path.extname(file).toLowerCase()
                        };
                    })
                    // Sort by last modified date, newest first
                    .sort((a, b) => b.mtime - a.mtime);
            }
        } catch (error) {
            console.error(`Error reading directory ${path}:`, error);
        }
        
        // Create the section HTML
        let sectionHtml = `
            <div class="output-path-section">
                <h3>${pathType} Output</h3>
                <p class="output-path">Path: ${path}</p>
        `;
        
        if (files.length === 0) {
            sectionHtml += `<p class="no-files">No files found in this directory.</p>`;
        } else {
            sectionHtml += `
                <table class="files-table">
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>Size</th>
                            <th>Last Modified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            files.forEach(file => {
                const isVideoFile = supportedVideoExtensions.includes(file.extension);
                const playButtonDisabled = isRendering ? 'disabled' : '';
                const playButtonTooltip = isRendering ? 'Waiting on render to complete.' : 'Play video';
                
                sectionHtml += `
                    <tr>
                        <td>${file.name}</td>
                        <td>${file.size}</td>
                        <td>${file.mtime.toLocaleString()}</td>
                        <td>
                            ${isVideoFile ? 
                                `<button class="play-button" data-path="${file.path}" ${playButtonDisabled} title="${playButtonTooltip}">${ICONS.PLAY}</button>` : 
                                ''}
                        </td>
                    </tr>
                `;
            });
            
            sectionHtml += `
                    </tbody>
                </table>
            `;
        }
        
        sectionHtml += `</div>`;
        return sectionHtml;
    };
    
    // Add sections for each output path
    if (outputPaths.cut) {
        html += createOutputPathSection('Cut', outputPaths.cut);
    }
    
    if (outputPaths.segment_scene) {
        html += createOutputPathSection('Segment Scene', outputPaths.segment_scene);
    }
    
    if (outputPaths.clip) {
        html += createOutputPathSection('Clip', outputPaths.clip);
    }
    
    html += `</div>`;
    
    return html;
}

/**
 * Format file size in a human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Initialize the Render tab
 * Adds event listeners and sets up the refresh interval
 */
function initializeRenderTab() {
    // Add CSS styles for the Render tab
    addRenderTabStyles();
    
    // Set up event delegation for play buttons
    document.addEventListener('click', (event) => {
        // Check if the clicked element is a play button
        if (event.target.classList.contains('play-button') && !event.target.hasAttribute('disabled')) {
            const filePath = event.target.getAttribute('data-path');
            if (filePath) {
                playVideo(filePath);
            }
        }
    });
}

/**
 * Add CSS styles for the Render tab
 */
function addRenderTabStyles() {
    // Create a style element
    const style = document.createElement('style');
    
    // Add the CSS rules
    style.textContent = `
        .render-tab-container {
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        
        .render-tab-container h2 {
            margin-top: 0;
            margin-bottom: 10px;
            color: #333;
        }
        
        .render-tab-container h3 {
            margin-top: 20px;
            margin-bottom: 10px;
            color: #444;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        
        .output-path {
            font-family: monospace;
            background-color: #f5f5f5;
            padding: 5px;
            border-radius: 3px;
            margin-bottom: 10px;
        }
        
        .files-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        .files-table th, .files-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        .files-table th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        
        .files-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .files-table tr:hover {
            background-color: #f0f0f0;
        }
        
        .play-button {
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 5px 10px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .play-button:hover:not([disabled]) {
            background-color: #45a049;
        }
        
        .play-button[disabled] {
            background-color: #cccccc;
            cursor: not-allowed;
            opacity: 0.7;
        }
        
        .no-files {
            font-style: italic;
            color: #777;
        }
        
        .last-refresh {
            font-size: 12px;
            color: #777;
            margin-bottom: 20px;
        }
        
        .rendering-status {
            color: #ff6600;
            font-weight: bold;
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .output-path-section {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            background-color: #fafafa;
        }
    `;
    
    // Add the style element to the document head
    document.head.appendChild(style);
}

/**
 * Start the refresh interval for the Render tab
 * Updates the content every 5 seconds
 */
function startRefreshInterval() {
    // Clear any existing interval
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
    }
    
    // Set up a new interval
    refreshIntervalId = setInterval(() => {
        // Only refresh if the Render tab is active
        if (window.uiManager && window.uiManager.getActiveTab() === 'Render') {
            // Update the editor content with fresh render tab HTML
            const editorContent = document.getElementById('editor-content');
            if (editorContent) {
                const htmlContent = generateRenderTabHtml();
                editorContent.innerHTML = `
                    <iframe
                        id="video-assembly-frame"
                        style="width: 100%; height: 100%; border: none;"
                        srcdoc="${htmlContent.replace(/"/g, '&quot;')}"
                    ></iframe>
                `;
            }
        }
    }, 5000); // Refresh every 5 seconds
}

/**
 * Stop the refresh interval for the Render tab
 */
function stopRefreshInterval() {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
    }
}

/**
 * Play a video file using the system's default video player
 * @param {string} filePath - Path to the video file
 */
function playVideo(filePath) {
    if (electronSetup.isElectron && electronSetup.ipcRenderer) {
        // Use Electron's shell.openPath to open the file with the default application
        electronSetup.ipcRenderer.send('open-external-link', `file://${filePath}`);
        
        // Update the terminal with a message
        const terminal = document.getElementById('terminal');
        if (terminal) {
            terminal.innerHTML += `<p>Opening video file: ${filePath}</p>`;
        }
    }
}

// Export the functions
module.exports = {
    generateRenderTabHtml,
    initializeRenderTab,
    startRefreshInterval,
    stopRefreshInterval
};
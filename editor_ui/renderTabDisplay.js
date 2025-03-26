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
 * Log errors to both console and the terminal element
 * @param {Error} error - The error to log
 * @param {string} source - Source function or context where the error occurred
 */
function logError(error, source) {
    // Always log to console
    console.error(`Error in ${source}:`, error);
    
    // Also try to log to the terminal element if it exists
    try {
        const terminal = document.getElementById('terminal');
        if (terminal) {
            terminal.innerHTML += `<p class="error">Error in ${source}: ${error.message}</p>`;
            // Auto-scroll to bottom
            terminal.scrollTop = terminal.scrollHeight;
        }
    } catch (terminalError) {
        // Don't let errors in error logging cause more problems
        console.error('Error while logging to terminal:', terminalError);
    }
}

/**
 * Generate HTML for the Render tab
 * @returns {string} HTML content for the Render tab
 */
function generateRenderTabHtml() {
    try {
        // Get current video assembly data with error handling
        let currentVideoAssemblyData;
        try {
            currentVideoAssemblyData = videoAssemblyManager.getCurrentVideoAssemblyData();
        } catch (dataError) {
            logError(dataError, 'generateRenderTabHtml (getting video assembly data)');
            return `
                <div class="render-tab-container">
                    <h2>Render Output</h2>
                    <p>Error retrieving video assembly data. Please check the terminal for details.</p>
                </div>
            `;
        }
        
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
        
        // Get the supported video file extensions with safe fallback
        let supportedVideoExtensions;
        try {
            supportedVideoExtensions = currentVideoAssemblyData["composeflow.org"] ?
                currentVideoAssemblyData["composeflow.org"].supported_video_file_extensions || [".mp4", ".avi", ".mov", ".mkv"] :
                [".mp4", ".avi", ".mov", ".mkv"];
        } catch (extError) {
            logError(extError, 'generateRenderTabHtml (getting supported extensions)');
            supportedVideoExtensions = [".mp4", ".avi", ".mov", ".mkv"]; // Fallback to defaults
        }
        
        // Check if rendering is in progress with error handling
        let isRendering = false;
        try {
            isRendering = renderProcessManager.isRenderingInProgress();
        } catch (renderError) {
            logError(renderError, 'generateRenderTabHtml (checking render status)');
            // Continue with isRendering = false
        }
    
        // Start building the HTML content
        let html = `
            <div class="render-tab-container">
                <h2>Render Output</h2>
                <p class="title-container">Showing files from render output paths. ${isRendering ? '<span class="rendering-status">Render in progress...</span>' : ''}</p>
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
                <div class="output-section-header">
                    <button class="play-button" data-folder-path="${path}" title="Open folder">📂 Open Folder</button>
                    <h3>${pathType} Output</h3>
                </div>
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
                        <td>
                            <div class="clip-path">${electronSetup.path.dirname(file.path)}</div>
                            <div class="file-name">${file.name}</div>
                        </td>
                        <td>${file.size}</td>
                        <td>${file.mtime.toLocaleString()}</td>
                        <td>
                            ${isVideoFile ?
                                `<button class="play-button" data-path="${file.path}" ${playButtonDisabled} title="${playButtonTooltip}">${ICONS.PLAY} Play</button>` :
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
        try {
            if (outputPaths.cut) {
                html += createOutputPathSection('Cut', outputPaths.cut);
            }
            
            if (outputPaths.segment_scene) {
                html += createOutputPathSection('Segment Scene', outputPaths.segment_scene);
            }
            
            if (outputPaths.clip) {
                html += createOutputPathSection('Clip', outputPaths.clip);
            }
        } catch (sectionError) {
            logError(sectionError, 'generateRenderTabHtml (creating output sections)');
            // Continue with what we have
        }
        
        html += `</div>`;
        
        return html;
    } catch (error) {
        // Catch any other errors that might have occurred
        logError(error, 'generateRenderTabHtml');
        return `
            <div class="render-tab-container">
                <h2>Render Output</h2>
                <p>An unexpected error occurred. Please check the terminal for details.</p>
            </div>
        `;
    }
}

/**
 * Format file size in a human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    try {
        if (bytes === 0) return '0 Bytes';
        
        // Handle invalid input
        if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
            logError(new Error(`Invalid bytes value: ${bytes}`), 'formatFileSize');
            return 'Unknown size';
        }
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        // Check if i is out of bounds of the sizes array
        if (i < 0 || i >= sizes.length) {
            logError(new Error(`Size index out of bounds: ${i}`), 'formatFileSize');
            return `${bytes} Bytes`;
        }
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    } catch (error) {
        logError(error, 'formatFileSize');
        return 'Unknown size';
    }
}

/**
 * Initialize the Render tab
 * Adds event listeners and sets up the refresh interval
 */
function initializeRenderTab() {
    try {
        // Add CSS styles for the Render tab with error handling
        try {
            addRenderTabStyles();
        } catch (styleError) {
            logError(styleError, 'initializeRenderTab (adding styles)');
            // Continue even if styles fail to load
        }
        
        // Set up event delegation for play buttons and folder open buttons
        document.addEventListener('click', (event) => {
            try {
                // Check if the clicked element is a play button
                if (event.target.classList.contains('play-button') && !event.target.hasAttribute('disabled')) {
                    const filePath = event.target.getAttribute('data-path');
                    const folderPath = event.target.getAttribute('data-folder-path');
                    
                    if (filePath) {
                        playVideo(filePath);
                    } else if (folderPath) {
                        openFolder(folderPath);
                    }
                }
            } catch (clickError) {
                logError(clickError, 'initializeRenderTab (click handler)');
                // Don't let click handler errors crash the app
            }
        });
    } catch (initError) {
        logError(initError, 'initializeRenderTab');
        // If initialization fails, log but don't crash
    }
}

/**
 * Open a folder in the system's file explorer
 * @param {string} folderPath - Path to the folder
 */
function openFolder(folderPath) {
    try {
        if (!folderPath) {
            logError(new Error('Empty folder path provided'), 'openFolder');
            return;
        }
        
        if (electronSetup.isElectron && electronSetup.ipcRenderer) {
            try {
                // Use Electron's shell.openPath to open the folder
                electronSetup.ipcRenderer.send('open-external-link', `file://${folderPath}`);
                
                // Update the terminal with a message
                try {
                    const terminal = document.getElementById('terminal');
                    if (terminal) {
                        terminal.innerHTML += `<p>Opening folder: ${folderPath}</p>`;
                    }
                } catch (terminalError) {
                    logError(terminalError, 'openFolder (updating terminal)');
                    // Continue even if terminal update fails
                }
            } catch (ipcError) {
                logError(ipcError, 'openFolder (sending IPC message)');
            }
        } else {
            logError(new Error('Electron IPC not available'), 'openFolder');
        }
    } catch (error) {
        logError(error, 'openFolder');
    }
}

/**
 * Add CSS styles for the Render tab
 */
function addRenderTabStyles() {
    try {
        // Create a style element
        const style = document.createElement('style');
        
        // Add the CSS rules
        style.textContent = `
            .render-tab-container {
                padding: 20px;
                font-family: Arial, sans-serif;
                line-height: 1.6;
            }
            
            .render-tab-container h2 {
                text-align: center;
                margin-bottom: 5px;
                color: #333;
            }
            
            .render-tab-container h3 {
                margin-top: 20px;
                display: inline-block;
                margin-right: 10px;
                color: #444;
            }
            
            .output-path {
                font-family: monospace;
                font-size: 8pt;
                color: gray;
                padding: 5px;
                border-radius: 3px;
                margin-bottom: 10px;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            
            .files-table th {
                background-color: #f4f4f4;
                font-weight: bold;
            }
            
            .files-table tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            
            .files-table tr:hover {
                background-color: #f0f0f0;
            }
            
            .play-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 4px;
                background-color: #4CAF50;
                color: white;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                font-size: 14px;
                font-weight: 500;
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
                text-align: center;
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
            
            .output-section-header {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .file-name {
                font-weight: bold;
            }
            
            .error {
                color: #ff0000;
                font-weight: bold;
                background-color: #ffeeee;
                padding: 5px;
                border-radius: 3px;
                margin: 5px 0;
            }
        `;
        
        // Add the style element to the document head
        try {
            document.head.appendChild(style);
        } catch (domError) {
            logError(domError, 'addRenderTabStyles (adding to DOM)');
            // Try an alternative approach if direct append fails
            if (document.head) {
                try {
                    const existingStyles = document.head.getElementsByTagName('style');
                    if (existingStyles.length > 0) {
                        // If there's an existing style tag, append to it
                        existingStyles[0].textContent += style.textContent;
                    }
                } catch (fallbackError) {
                    logError(fallbackError, 'addRenderTabStyles (fallback method)');
                }
            }
        }
    } catch (error) {
        logError(error, 'addRenderTabStyles');
    }
}

/**
 * Start the refresh interval for the Render tab
 * Updates the content every 5 seconds
 */
function startRefreshInterval() {
    try {
        // Clear any existing interval
        try {
            if (refreshIntervalId) {
                clearInterval(refreshIntervalId);
            }
        } catch (clearError) {
            logError(clearError, 'startRefreshInterval (clearing interval)');
            // Continue with setting up a new interval
        }
        
        // Set up a new interval
        refreshIntervalId = setInterval(() => {
            try {
                // Check if Render tab is active
                let isRenderTabActive = false;
                try {
                    isRenderTabActive = window.uiManager && window.uiManager.getActiveTab() === 'Render';
                } catch (tabError) {
                    logError(tabError, 'startRefreshInterval (checking active tab)');
                    return; // Skip this refresh cycle
                }
                
                // Only refresh if the Render tab is active
                if (isRenderTabActive) {
                    try {
                        // Find editor content element
                        const editorContent = document.getElementById('editor-content');
                        if (editorContent) {
                            // Generate HTML with error handling
                            let htmlContent;
                            try {
                                htmlContent = generateRenderTabHtml();
                            } catch (generateError) {
                                logError(generateError, 'startRefreshInterval (generating HTML)');
                                htmlContent = `
                                    <div class="render-tab-container">
                                        <h2>Render Output</h2>
                                        <p class="error">Error refreshing render tab content. See terminal for details.</p>
                                    </div>
                                `;
                            }
                            
                            // Update the editor content
                            try {
                                editorContent.innerHTML = `
                                    <iframe
                                        id="video-assembly-frame"
                                        style="width: 100%; height: 100%; border: none;"
                                        srcdoc="${htmlContent.replace(/"/g, '&quot;')}"
                                    ></iframe>
                                `;
                            } catch (updateError) {
                                logError(updateError, 'startRefreshInterval (updating DOM)');
                            }
                        }
                    } catch (domError) {
                        logError(domError, 'startRefreshInterval (DOM operations)');
                    }
                }
            } catch (intervalCallbackError) {
                // Catch-all for any errors in the interval callback
                logError(intervalCallbackError, 'startRefreshInterval (interval callback)');
            }
        }, 5000); // Refresh every 5 seconds
    } catch (error) {
        logError(error, 'startRefreshInterval');
    }
}

/**
 * Stop the refresh interval for the Render tab
 */
function stopRefreshInterval() {
    try {
        if (refreshIntervalId) {
            clearInterval(refreshIntervalId);
            refreshIntervalId = null;
        }
    } catch (error) {
        logError(error, 'stopRefreshInterval');
        // Even if there's an error, try to ensure the interval ID is nullified
        refreshIntervalId = null;
    }
}

/**
 * Play a video file using the system's default video player
 * @param {string} filePath - Path to the video file
 */
function playVideo(filePath) {
    try {
        // Validate the file path
        if (!filePath) {
            logError(new Error('Empty file path provided'), 'playVideo');
            return;
        }
        
        if (electronSetup.isElectron && electronSetup.ipcRenderer) {
            try {
                // Check if file exists first with error handling
                let fileExists = false;
                try {
                    if (electronSetup.fs && electronSetup.fs.existsSync) {
                        fileExists = electronSetup.fs.existsSync(filePath);
                        if (!fileExists) {
                            logError(new Error(`File does not exist: ${filePath}`), 'playVideo');
                            // Continue anyway since the path might be valid in a different context
                        }
                    }
                } catch (fsError) {
                    logError(fsError, 'playVideo (checking file existence)');
                    // Continue with opening anyway
                }
                
                // Use Electron's shell.openPath to open the file with the default application
                electronSetup.ipcRenderer.send('open-external-link', `file://${filePath}`);
                
                // Update the terminal with a message
                try {
                    const terminal = document.getElementById('terminal');
                    if (terminal) {
                        terminal.innerHTML += `<p>Opening video file: ${filePath}</p>`;
                    }
                } catch (terminalError) {
                    logError(terminalError, 'playVideo (updating terminal)');
                    // Continue even if terminal update fails
                }
            } catch (ipcError) {
                logError(ipcError, 'playVideo (sending IPC message)');
            }
        } else {
            logError(new Error('Electron IPC not available'), 'playVideo');
        }
    } catch (error) {
        logError(error, 'playVideo');
    }
}

// Export the functions
module.exports = {
    generateRenderTabHtml,
    initializeRenderTab,
    startRefreshInterval,
    stopRefreshInterval
};
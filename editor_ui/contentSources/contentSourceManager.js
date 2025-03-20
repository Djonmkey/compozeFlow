/**
 * contentSources/contentSourceManager.js
 *
 * Functions for managing content sources (adding, removing, etc.).
 */

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const htmlGenerator = require('./htmlGenerator');
// Remove direct import of eventHandlers to avoid circular dependency

/**
 * Adds a new content source to the video assembly data
 * @param {Object} videoAssemblyData - The video assembly data
 */
async function addNewContentSource(videoAssemblyData) {
    try {
        // Check if we're running in Electron
        if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
            // Use IPC to request the main process to show the open folder dialog
            const result = await ipcRenderer.invoke('show-open-folder-dialog');
            
            if (result.canceled) {
                console.log('Folder selection was canceled');
                return;
            }
            
            const sourcePath = result.folderPath;
            console.log(`Selected folder: ${sourcePath}`);
            
            // Default include_subpaths to true
            const includeSubpaths = true;
            
            // Find the highest order value
            let maxOrder = 0;
            if (videoAssemblyData.cut && videoAssemblyData.cut.content_sources) {
                videoAssemblyData.cut.content_sources.forEach(source => {
                    if (source.order > maxOrder) {
                        maxOrder = source.order;
                    }
                });
            }
            
            // Create a new content source object
            const newContentSource = {
                order: maxOrder + 1,
                path: sourcePath,
                include_subpaths: includeSubpaths
            };
            
            // Add the new content source to the video assembly data
            if (!videoAssemblyData.cut) {
                videoAssemblyData.cut = {};
            }
            
            if (!videoAssemblyData.cut.content_sources) {
                videoAssemblyData.cut.content_sources = [];
            }
            
            videoAssemblyData.cut.content_sources.push(newContentSource);
            
            // Update the explorer
            const explorer = document.getElementById('explorer');
            explorer.innerHTML = htmlGenerator.generateContentSourcesHtml(videoAssemblyData);
            
            // Dispatch a custom event to initialize content sources
            document.dispatchEvent(new CustomEvent('contentSourcesUpdated', { detail: { videoAssemblyData } }));
            
            // Save the updated video assembly data and wait for the result
            const saveResult = await saveVideoAssemblyData(videoAssemblyData);
            
            if (saveResult) {
                console.log(`Content source ${sourcePath} added successfully`);
                
                // Update the terminal with a message
                const terminal = document.getElementById('terminal');
                if (terminal) {
                    terminal.innerHTML += `<p>Content source added: ${sourcePath}</p>`;
                }
            } else {
                console.error(`Failed to save after adding content source ${sourcePath}`);
                
                // Update the terminal with an error message
                const terminal = document.getElementById('terminal');
                if (terminal) {
                    terminal.innerHTML += `<p>Error: Failed to save after adding content source</p>`;
                }
            }
        } else {
            console.log('Not running in Electron, cannot show folder dialog');
        }
    } catch (error) {
        console.error('Error adding content source:', error);
        
        // Update the terminal with an error message
        const terminal = document.getElementById('terminal');
        if (terminal) {
            terminal.innerHTML += `<p>Error adding content source: ${error.message}</p>`;
        }
    }
}

/**
 * Removes a content source from the video assembly data
 * @param {Object} videoAssemblyData - The video assembly data
 * @param {string} sourcePath - The path of the content source to remove
 * @param {number} sourceOrder - The order of the content source to remove
 */
function removeContentSource(videoAssemblyData, sourcePath, sourceOrder) {
    if (!videoAssemblyData.cut || !videoAssemblyData.cut.content_sources) {
        return;
    }
    
    // Create a confirmation dialog
    const dialogHtml = `
        <div class="dialog-overlay">
            <div class="dialog-content">
                <h3>Remove Content Source</h3>
                <p>Are you sure you want to remove this content source?</p>
                <p><strong>${sourcePath}</strong></p>
                <div class="dialog-buttons">
                    <button id="dialog-cancel">Cancel</button>
                    <button id="dialog-remove">Remove</button>
                </div>
            </div>
        </div>
    `;
    
    // Add the dialog to the DOM
    const dialogElement = document.createElement('div');
    dialogElement.innerHTML = dialogHtml;
    document.body.appendChild(dialogElement);
    
    // Add event listeners for the dialog buttons
    const cancelButton = document.getElementById('dialog-cancel');
    const removeButton = document.getElementById('dialog-remove');
    
    // Cancel button closes the dialog
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(dialogElement);
    });
    
    // Remove button removes the content source and closes the dialog
    removeButton.addEventListener('click', async () => {
        // Remove the content source from the video assembly data
        videoAssemblyData.cut.content_sources = videoAssemblyData.cut.content_sources.filter(source => {
            // Check if the path matches
            if (source.path !== sourcePath) {
                return true; // Keep sources with different paths
            }
            
            // Check if either order or sequence matches
            const sourceIdentifier = source.order !== undefined ? source.order : source.sequence;
            return sourceIdentifier !== sourceOrder;
        });
        
        // Update the explorer
        const explorer = document.getElementById('explorer');
        explorer.innerHTML = htmlGenerator.generateContentSourcesHtml(videoAssemblyData);
        
        // Dispatch a custom event to initialize content sources
        document.dispatchEvent(new CustomEvent('contentSourcesUpdated', { detail: { videoAssemblyData } }));
        
        // Save the updated video assembly data and wait for the result
        const saveResult = await saveVideoAssemblyData(videoAssemblyData);
        
        if (saveResult) {
            console.log(`Content source ${sourcePath} removed successfully`);
            
            // Update the terminal with a message
            const terminal = document.getElementById('terminal');
            if (terminal) {
                terminal.innerHTML += `<p>Content source removed: ${sourcePath}</p>`;
            }
        } else {
            console.error(`Failed to save after removing content source ${sourcePath}`);
            
            // Update the terminal with an error message
            const terminal = document.getElementById('terminal');
            if (terminal) {
                terminal.innerHTML += `<p>Error: Failed to save after removing content source</p>`;
            }
        }
        
        // Close the dialog
        document.body.removeChild(dialogElement);
    });
}

/**
 * Saves the video assembly data to the file
 * @param {Object} videoAssemblyData - The video assembly data to save
 * @returns {Promise<boolean>} - Promise resolving to true if save was successful
 */
async function saveVideoAssemblyData(videoAssemblyData) {
    // Check if we're running in Electron
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        try {
            // Get the electron module
            const electron = require('electron');
            const ipcRenderer = electron.ipcRenderer;
            
            // Send a message to the main process to save the data and wait for the result
            const result = await ipcRenderer.invoke('save-video-assembly-data', videoAssemblyData);
            
            if (result && result.success) {
                console.log('Video assembly data saved successfully');
                return true;
            } else {
                console.error('Error saving video assembly data:', result ? result.error : 'Unknown error');
                return false;
            }
        } catch (error) {
            console.error('Error saving video assembly data:', error);
            return false;
        }
    } else {
        console.log('Not running in Electron, cannot save video assembly data');
        return false;
    }
}

module.exports = {
    addNewContentSource,
    removeContentSource,
    saveVideoAssemblyData
};
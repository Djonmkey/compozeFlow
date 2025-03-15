/**
 * fileOperationsUI.js
 *
 * UI operations for files like copying to clipboard, opening files, etc.
 */

/**
 * Copies the given text to the clipboard
 * @param {string} text - The text to copy
 */
function copyToClipboard(text) {
    // Check if we're running in Electron
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        try {
            // Get the electron module
            const electron = require('electron');
            const clipboard = electron.clipboard;
            
            // Copy the text to clipboard
            clipboard.writeText(text);
            
            // Update the terminal with a message
            const terminal = document.getElementById('terminal');
            terminal.innerHTML += `<p>Copied path to clipboard: ${text}</p>`;
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    } else {
        // Fallback for non-Electron environments
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Text copied to clipboard');
                // Update the terminal with a message
                const terminal = document.getElementById('terminal');
                terminal.innerHTML += `<p>Copied path to clipboard: ${text}</p>`;
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    }
}

/**
 * Opens a file in the system's default application
 * @param {string} filePath - The path of the file to open
 */
function openFileInDefaultApp(filePath) {
    // Check if we're running in Electron
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        try {
            // Get the electron module
            const electron = require('electron');
            const { shell } = electron;
            
            // Open the file in the default application
            shell.openPath(filePath)
                .then((result) => {
                    if (result) {
                        console.error(`Error opening file: ${result}`);
                        // Update the terminal with an error message
                        const terminal = document.getElementById('terminal');
                        terminal.innerHTML += `<p>Error opening file: ${result}</p>`;
                    } else {
                        console.log(`File opened: ${filePath}`);
                        // Update the terminal with a message
                        const terminal = document.getElementById('terminal');
                        terminal.innerHTML += `<p>File opened in default application: ${filePath}</p>`;
                    }
                })
                .catch(error => {
                    console.error('Error opening file:', error);
                });
        } catch (error) {
            console.error('Error opening file:', error);
        }
    } else {
        console.log('Not running in Electron, cannot open file');
    }
}

/**
 * Toggles the dismiss status of a file
 * @param {string} filePath - The path of the file to toggle dismiss status
 */
function toggleFileDismissStatus(filePath) {
    // Check if we're running in Electron
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        try {
            // Get the current video assembly data
            const videoAssemblyData = window.currentVideoAssemblyData;
            
            if (!videoAssemblyData || !videoAssemblyData.cut) {
                console.error('No video assembly data available');
                return;
            }
            
            // Ensure dismissed_files array exists
            if (!videoAssemblyData.cut.dismissed_files) {
                videoAssemblyData.cut.dismissed_files = [];
            }
            
            // Check if the file is already in the dismissed_files array
            const isDismissed = videoAssemblyData.cut.dismissed_files.some(file => file.path === filePath);
            
            if (isDismissed) {
                // Remove the file from the dismissed_files array
                videoAssemblyData.cut.dismissed_files = videoAssemblyData.cut.dismissed_files.filter(file => file.path !== filePath);
                
                // Update the button text
                const dismissButton = document.querySelector('.dismiss-file-btn');
                if (dismissButton) {
                    dismissButton.textContent = '❌ Dismiss';
                    dismissButton.title = 'Dismiss file';
                }
                
                // Update the terminal with a message
                const terminal = document.getElementById('terminal');
                terminal.innerHTML += `<p>File restored: ${filePath}</p>`;
            } else {
                // Add the file to the dismissed_files array
                videoAssemblyData.cut.dismissed_files.push({ path: filePath });
                
                // Update the button text
                const dismissButton = document.querySelector('.dismiss-file-btn');
                if (dismissButton) {
                    dismissButton.textContent = '✓ Restore';
                    dismissButton.title = 'Restore file';
                }
                
                // Update the terminal with a message
                const terminal = document.getElementById('terminal');
                terminal.innerHTML += `<p>File dismissed: ${filePath}</p>`;
            }
            
            // Save the updated video assembly data
            const { saveVideoAssemblyData } = require('./fileTimelineIntegration');
            saveVideoAssemblyData(videoAssemblyData);
            
            console.log('Attempting to update the explorer view');
            const explorerMode = document.querySelector('.explorer-mode-selector .active');
            if (explorerMode) {
                const explorer = document.getElementById('explorer');
                const activeMode = explorerMode.textContent.trim();
                console.log(`Active Explorer Mode: ${activeMode}`);
                
                // Update based on the active explorer mode
                if (activeMode === 'Content Sources') {
                    const contentSourcesDisplay = require('../contentSourcesDisplay');
                    explorer.innerHTML = contentSourcesDisplay.generateContentSourcesHtml(videoAssemblyData);
                    contentSourcesDisplay.initializeContentSources(videoAssemblyData);
                    console.log('Content Sources Explorer updated');
                } else if (activeMode === 'Search') {
                    // If in search mode, refresh the search results if there's an active search
                    const searchInput = document.getElementById('global-search-input');
                    if (searchInput && searchInput.value.trim().length >= 2) {
                        const searchDisplay = require('../searchDisplay');
                        // Re-trigger the search with current input
                        const searchEvent = new Event('input', { bubbles: true });
                        searchInput.dispatchEvent(searchEvent);
                        console.log('Search results refreshed');
                    }
                }
                
                // Update the terminal with a message about the view refresh
                const terminal = document.getElementById('terminal');
                terminal.innerHTML += `<p>Explorer view updated to reflect file status change</p>`;
            } else {
                console.log('No active explorer mode found');
            }
        } catch (error) {
            console.error('Error toggling file dismiss status:', error);
        }
    } else {
        console.log('Not running in Electron, cannot toggle file dismiss status');
    }
}

// Export functions
module.exports = {
    copyToClipboard,
    openFileInDefaultApp,
    toggleFileDismissStatus
};
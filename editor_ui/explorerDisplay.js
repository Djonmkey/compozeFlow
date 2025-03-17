/**
 * explorerDisplay.js
 *
 * Coordinates the display of the explorer area with three modes:
 * - Content Sources (folder icon)
 * - Search (magnifier icon)
 * - Plugins (puzzle piece icon)
 */

const fs = require('fs');
const path = require('path');

// Import the three mode modules
const contentSourcesModule = require('./contentSourcesDisplay');
const searchModule = require('./searchDisplay');
const pluginsModule = require('./pluginsDisplay');

// Current active mode
let currentMode = 'content-sources'; // Default mode

// Track expanded folders in the explorer
let expandedFolders = new Set();

// Track the active scroll position
let explorerScrollPosition = 0;

/**
 * Generates HTML for the explorer area based on the current mode
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {string} HTML content for the explorer
 */
function generateExplorerHtml(videoAssemblyData) {
    switch (currentMode) {
        case 'search':
            return searchModule.generateSearchHtml();
        case 'plugins':
            return pluginsModule.generatePluginsHtml();
        case 'content-sources':
        default:
            return contentSourcesModule.generateContentSourcesHtml(videoAssemblyData);
    }
}

/**
 * Initializes the explorer with event handlers
 * @param {Object} videoAssemblyData - The video assembly data
 */
function initializeExplorer(videoAssemblyData) {
    // Initialize the current mode
    switch (currentMode) {
        case 'search':
            searchModule.initializeSearch(videoAssemblyData);
            break;
        case 'plugins':
            pluginsModule.initializePlugins();
            break;
        case 'content-sources':
        default:
            contentSourcesModule.initializeContentSources(videoAssemblyData);
            break;
    }

    // Set up icon click handlers for mode switching
    setupModeToggleHandlers(videoAssemblyData);
    
    // Set up event listener for explorer refresh requests
    setupExplorerRefreshListener(videoAssemblyData);
}

/**
 * Sets up event listener for explorer refresh requests
 * @param {Object} videoAssemblyData - The video assembly data
 */
function setupExplorerRefreshListener(videoAssemblyData) {
    // Remove any existing listener to prevent duplicates
    document.removeEventListener('refreshExplorer', handleExplorerRefresh);
    
    // Add event listener for the custom refreshExplorer event
    document.addEventListener('refreshExplorer', (event) => handleExplorerRefresh(event, videoAssemblyData));
}

/**
 * Handles the refreshExplorer event
 * @param {CustomEvent} event - The event object
 * @param {Object} videoAssemblyData - The video assembly data
 */
function handleExplorerRefresh(event, videoAssemblyData) {
    console.log('Explorer refresh event received');
    
    // Use setTimeout to ensure the event is disconnected from the caller
    setTimeout(() => {
        // Get the explorer element
        const explorer = document.getElementById('explorer');
        if (!explorer) {
            console.error('Explorer element not found');
            return;
        }
        
        // Save the current expanded folders state before refreshing
        saveExpandedFoldersState();
        
        // Save the current scroll position
        explorerScrollPosition = explorer.scrollTop;
        
        // Update the explorer content based on the current mode
        explorer.innerHTML = generateExplorerHtml(videoAssemblyData);
        
        // Re-initialize the explorer with the updated content
        switch (currentMode) {
            case 'search':
                searchModule.initializeSearch(videoAssemblyData);
                // If in search mode, refresh the search results if there's an active search
                const searchInput = document.getElementById('global-search-input');
                if (searchInput && searchInput.value.trim().length >= 2) {
                    // Re-trigger the search with current input
                    const searchEvent = new Event('input', { bubbles: true });
                    searchInput.dispatchEvent(searchEvent);
                    console.log('Search results refreshed');
                }
                break;
            case 'plugins':
                pluginsModule.initializePlugins();
                break;
            case 'content-sources':
            default:
                contentSourcesModule.initializeContentSources(videoAssemblyData);
                console.log('Content Sources Explorer updated');
                
                // Restore the expanded folders state after initialization
                restoreExpandedFoldersState();
                break;
        }
        
        // Restore scroll position
        explorer.scrollTop = explorerScrollPosition;
        
        // Update the terminal with a message about the view refresh
        const terminal = document.getElementById('terminal');
        if (terminal) {
            terminal.innerHTML += `<p>Explorer view updated to reflect file status change</p>`;
        }
    }, 0); // Using 0ms timeout to execute after the current call stack is cleared
}

/**
 * Saves the current state of expanded folders in the explorer
 */
function saveExpandedFoldersState() {
    if (currentMode !== 'content-sources') return;
    
    // Clear the previous state
    expandedFolders.clear();
    
    // Find all expanded directories and save their paths
    document.querySelectorAll('.explorer-directory.expanded').forEach(dir => {
        const dirPath = getDirectoryPath(dir);
        if (dirPath) {
            expandedFolders.add(dirPath);
        }
    });
    
    console.log(`Saved state of ${expandedFolders.size} expanded folders`);
}

/**
 * Restores the expanded folders state after refresh
 */
function restoreExpandedFoldersState() {
    if (currentMode !== 'content-sources' || expandedFolders.size === 0) return;
    
    // Find all directories and expand those that were expanded before
    document.querySelectorAll('.explorer-directory').forEach(dir => {
        const dirPath = getDirectoryPath(dir);
        if (dirPath && expandedFolders.has(dirPath)) {
            dir.classList.add('expanded');
        }
    });
    
    console.log(`Restored state of ${expandedFolders.size} expanded folders`);
}

/**
 * Gets the full path of a directory element
 * @param {Element} dirElement - The directory element
 * @returns {string|null} The directory path or null if not found
 */
function getDirectoryPath(dirElement) {
    // Try to get the path from the data-path attribute
    let dirPath = dirElement.getAttribute('data-path');
    
    // If the directory doesn't have a data-path attribute, try to construct it
    if (!dirPath) {
        // Get the section element that contains this directory
        const section = dirElement.closest('.explorer-section');
        if (!section) return null;
        
        const sectionPath = section.getAttribute('data-path');
        if (!sectionPath) return null;
        
        // Get the directory name
        const dirName = dirElement.querySelector('.explorer-name')?.textContent;
        if (!dirName) return null;
        
        // Construct the path by combining the section path and directory name
        dirPath = path.join(sectionPath, dirName);
    }
    
    return dirPath;
}

/**
 * Sets up click handlers for the mode toggle icons
 * @param {Object} videoAssemblyData - The video assembly data
 */
function setupModeToggleHandlers(videoAssemblyData) {
    // Get the icon elements
    const contentSourcesIcon = document.querySelector('#top-icons .icon:nth-child(1)');
    const searchIcon = document.querySelector('#top-icons .icon:nth-child(2)');
    const pluginsIcon = document.querySelector('#top-icons .icon:nth-child(3)');

    // Add click handlers
    if (contentSourcesIcon) {
        contentSourcesIcon.addEventListener('click', () => {
            switchMode('content-sources', videoAssemblyData);
        });
    }

    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            switchMode('search', videoAssemblyData);
        });
    }

    if (pluginsIcon) {
        pluginsIcon.addEventListener('click', () => {
            switchMode('plugins', videoAssemblyData);
        });
    }

    // Highlight the current active mode icon
    updateActiveIcon();
}

/**
 * Switches the explorer mode
 * @param {string} mode - The mode to switch to
 * @param {Object} videoAssemblyData - The video assembly data
 */
function switchMode(mode, videoAssemblyData) {
    // If already in this mode, do nothing
    if (currentMode === mode) return;

    // Update the current mode
    currentMode = mode;

    // Update the explorer content
    const explorer = document.getElementById('explorer');
    explorer.innerHTML = generateExplorerHtml(videoAssemblyData);

    // Initialize the new mode
    initializeExplorer(videoAssemblyData);

    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    if (terminal) {
        terminal.innerHTML += `<p>Explorer mode switched to ${getModeDisplayName(mode)}</p>`;
    }
}

/**
 * Updates the active icon styling
 */
function updateActiveIcon() {
    // Remove active class from all icons
    document.querySelectorAll('#top-icons .icon').forEach(icon => {
        icon.classList.remove('active-icon');
    });

    // Add active class to the current mode icon
    let activeIcon;
    switch (currentMode) {
        case 'search':
            activeIcon = document.querySelector('#top-icons .icon:nth-child(2)');
            break;
        case 'plugins':
            activeIcon = document.querySelector('#top-icons .icon:nth-child(3)');
            break;
        case 'content-sources':
        default:
            activeIcon = document.querySelector('#top-icons .icon:nth-child(1)');
            break;
    }

    if (activeIcon) {
        activeIcon.classList.add('active-icon');
    }
}

/**
 * Gets a display name for a mode
 * @param {string} mode - The mode
 * @returns {string} The display name
 */
function getModeDisplayName(mode) {
    switch (mode) {
        case 'search':
            return 'Search';
        case 'plugins':
            return 'Plugins';
        case 'content-sources':
        default:
            return 'Content Sources';
    }
}

// Add CSS for the active icon
const iconStyle = document.createElement('style');
iconStyle.textContent = `
    .icon.active-icon {
        background-color: #444;
        width: 100%;
        text-align: center;
    }
`;
document.head.appendChild(iconStyle);

module.exports = {
    generateExplorerHtml,
    initializeExplorer,
    switchMode,
    handleExplorerRefresh,
    saveExpandedFoldersState,
    restoreExpandedFoldersState
};
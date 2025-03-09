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
    switchMode
};
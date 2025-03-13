/**
 * pluginsDisplay.js
 *
 * Main entry point for the plugins display functionality.
 * Handles the display of plugins in the explorer area.
 */

// Import functionality from other modules
const { FEATURE_FLAGS } = require('./featureFlags');

const {
    setupDependencies: setupUIDependencies,
    generatePluginsHtml,
    filterPlugins,
    addPluginsStyles,
    displayInstalledPlugins,
    displayAvailablePlugins
} = require('./pluginsUI');

const {
    setupDependencies: setupDataDependencies,
    loadPluginsData,
    addPlaceholderPlugins,
    togglePluginActive,
    installPlugin
} = require('./pluginsData');

const {
    setupDependencies: setupDialogsDependencies,
    showInstallPluginDialog,
    showUninstallPluginDialog
} = require('./pluginsDialogs');

// Set up dependencies between modules
setupUIDependencies(togglePluginActive, installPlugin, showUninstallPluginDialog);
setupDataDependencies(displayInstalledPlugins, displayAvailablePlugins);
setupDialogsDependencies(loadPluginsData, addPlaceholderPlugins);

/**
 * Initializes the plugins mode with event handlers
 */
function initializePlugins() {
    // Check if plugins feature is enabled
    if (!FEATURE_FLAGS.ENABLE_PLUGINS) {
        console.log('Plugins feature is disabled by feature flag');
        return;
    }
    
    // Add styles for plugins
    addPluginsStyles();
    
    // Load plugins data
    loadPluginsData();
    
    // Add event listeners for tabs
    document.querySelectorAll('.plugins-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            document.querySelectorAll('.plugins-tab').forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
            
            // Show the corresponding tab content
            const tabName = tab.getAttribute('data-tab');
            document.querySelectorAll('.plugins-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(`${tabName}-plugins-tab`).style.display = 'block';
        });
    });
    
    // Add event listener for plugin search
    const searchInput = document.getElementById('plugins-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const searchText = event.target.value.toLowerCase();
            filterPlugins(searchText);
        });
    }
    
    // Add event listener for install plugin button
    const installButton = document.querySelector('.install-plugin-btn');
    if (installButton) {
        installButton.addEventListener('click', () => {
            showInstallPluginDialog();
        });
    }
}

// Export the public API
module.exports = {
    generatePluginsHtml,
    initializePlugins
};
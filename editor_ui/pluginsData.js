/**
 * pluginsData.js
 *
 * Handles the data management for plugins, including loading, installing, and toggling.
 */

const fs = require('fs');
const path = require('path');
const { FEATURE_FLAGS } = require('./featureFlags');

// UI display functions (will be set via dependency injection)
let displayInstalledPluginsFunc;
let displayAvailablePluginsFunc;

/**
 * Sets up the dependencies for this module
 * @param {Function} displayInstalled - Function to display installed plugins
 * @param {Function} displayAvailable - Function to display available plugins
 */
function setupDependencies(displayInstalled, displayAvailable) {
    displayInstalledPluginsFunc = displayInstalled;
    displayAvailablePluginsFunc = displayAvailable;
}

/**
 * Loads plugins data from JSON files
 */
function loadPluginsData() {
    // Check if plugins feature is enabled
    if (!FEATURE_FLAGS.ENABLE_PLUGINS) {
        console.log('Plugins feature is disabled by feature flag');
        return;
    }
    
    // Check if we're running in Electron
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        try {
            // Load installed plugins
            const installedPluginsData = fs.readFileSync('./plugins/installed_plugins.json', 'utf-8');
            const installedPlugins = JSON.parse(installedPluginsData).installedPlugins;
            
            // Load available plugins
            const availablePluginsData = fs.readFileSync('./plugins/available_plugins.json', 'utf-8');
            const availablePlugins = JSON.parse(availablePluginsData).plugins;
            
            // Display the plugins
            if (displayInstalledPluginsFunc && displayAvailablePluginsFunc) {
                displayInstalledPluginsFunc(installedPlugins, availablePlugins);
                displayAvailablePluginsFunc(availablePlugins, installedPlugins);
            } else {
                console.error('Display functions not set');
            }
        } catch (error) {
            console.error('Error loading plugins data:', error);
            
            // Show error message
            document.getElementById('installed-plugins-list').innerHTML = `
                <div class="plugins-error">
                    Error loading plugins: ${error.message}
                </div>
            `;
            
            document.getElementById('available-plugins-list').innerHTML = `
                <div class="plugins-error">
                    Error loading plugins: ${error.message}
                </div>
            `;
            
            // Add placeholder plugins for browser mode
            addPlaceholderPlugins();
        }
    } else {
        // In browser mode, add placeholder plugins
        addPlaceholderPlugins();
    }
}

/**
 * Adds placeholder plugins for browser mode
 */
function addPlaceholderPlugins() {
    // Placeholder installed plugins
    const installedPlugins = [
        { id: 'plugin1', version: '1.0.0', active: true },
        { id: 'plugin2', version: '0.5.2', active: false },
        { id: 'plugin3', version: '2.1.0', active: true }
    ];
    
    // Placeholder available plugins
    const availablePlugins = [
        {
            id: 'plugin1',
            displayName: 'Example Plugin 1',
            description: 'This is an example plugin for demonstration purposes.',
            author: 'compozeFlow Team',
            version: '1.0.0'
        },
        {
            id: 'plugin2',
            displayName: 'Example Plugin 2',
            description: 'Another example plugin with different features.',
            author: 'compozeFlow Team',
            version: '0.5.2'
        },
        {
            id: 'plugin3',
            displayName: 'Example Plugin 3',
            description: 'A third example plugin for testing the UI.',
            author: 'compozeFlow Team',
            version: '2.1.0'
        },
        {
            id: 'plugin4',
            displayName: 'Example Plugin 4',
            description: 'A plugin that is not yet installed.',
            author: 'compozeFlow Team',
            version: '1.2.3'
        }
    ];
    
    // Display the placeholder plugins
    if (displayInstalledPluginsFunc && displayAvailablePluginsFunc) {
        displayInstalledPluginsFunc(installedPlugins, availablePlugins);
        displayAvailablePluginsFunc(availablePlugins, installedPlugins);
    } else {
        console.error('Display functions not set');
    }
}

/**
 * Toggles a plugin's active state
 * @param {string} pluginId - The ID of the plugin
 * @param {Element} pluginItem - The plugin item element
 */
function togglePluginActive(pluginId, pluginItem) {
    // Check if plugins feature is enabled
    if (!FEATURE_FLAGS.ENABLE_PLUGINS) {
        console.log('Plugins feature is disabled by feature flag');
        return;
    }
    
    // Check if we're running in Electron
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        try {
            // Read the installed plugins JSON file
            const installedPluginsData = fs.readFileSync('./plugins/installed_plugins.json', 'utf-8');
            const installedPluginsObj = JSON.parse(installedPluginsData);
            
            // Find the plugin and toggle its active state
            const plugin = installedPluginsObj.installedPlugins.find(p => p.id === pluginId);
            if (plugin) {
                plugin.active = !plugin.active;
                
                // Write the updated data back to the file
                fs.writeFileSync(
                    './plugins/installed_plugins.json',
                    JSON.stringify(installedPluginsObj, null, 4),
                    'utf-8'
                );
                
                // Update the UI
                pluginItem.classList.toggle('plugin-active');
                pluginItem.classList.toggle('plugin-inactive');
                
                const toggleButton = pluginItem.querySelector('.plugin-toggle-btn');
                toggleButton.textContent = plugin.active ? '✓' : '✗';
                toggleButton.title = plugin.active ? 'Deactivate plugin' : 'Activate plugin';
                
                // Update the terminal with a message
                const terminal = document.getElementById('terminal');
                if (terminal) {
                    terminal.innerHTML += `<p>Plugin ${pluginId} ${plugin.active ? 'activated' : 'deactivated'}</p>`;
                }
            }
        } catch (error) {
            console.error('Error toggling plugin active state:', error);
            
            // In browser mode, just toggle the UI
            pluginItem.classList.toggle('plugin-active');
            pluginItem.classList.toggle('plugin-inactive');
            
            const toggleButton = pluginItem.querySelector('.plugin-toggle-btn');
            const isActive = pluginItem.classList.contains('plugin-active');
            toggleButton.textContent = isActive ? '✓' : '✗';
            toggleButton.title = isActive ? 'Deactivate plugin' : 'Activate plugin';
            
            // Update the terminal with a message
            const terminal = document.getElementById('terminal');
            if (terminal) {
                terminal.innerHTML += `<p>Plugin ${pluginId} ${isActive ? 'activated' : 'deactivated'} (browser mode)</p>`;
            }
        }
    } else {
        // In browser mode, just toggle the UI
        pluginItem.classList.toggle('plugin-active');
        pluginItem.classList.toggle('plugin-inactive');
        
        const toggleButton = pluginItem.querySelector('.plugin-toggle-btn');
        const isActive = pluginItem.classList.contains('plugin-active');
        toggleButton.textContent = isActive ? '✓' : '✗';
        toggleButton.title = isActive ? 'Deactivate plugin' : 'Activate plugin';
        
        // Update the terminal with a message
        const terminal = document.getElementById('terminal');
        if (terminal) {
            terminal.innerHTML += `<p>Plugin ${pluginId} ${isActive ? 'activated' : 'deactivated'} (browser mode)</p>`;
        }
    }
}

/**
 * Installs a plugin
 * @param {string} pluginId - The ID of the plugin to install
 * @param {Array} availablePlugins - Array of available plugins
 */
function installPlugin(pluginId, availablePlugins) {
    // Check if plugins feature is enabled
    if (!FEATURE_FLAGS.ENABLE_PLUGINS) {
        console.log('Plugins feature is disabled by feature flag');
        return;
    }
    
    // Find the plugin in available plugins
    const plugin = availablePlugins.find(p => p.id === pluginId);
    if (!plugin) return;
    
    // Check if we're running in Electron
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        try {
            // Read the installed plugins JSON file
            const installedPluginsData = fs.readFileSync('./plugins/installed_plugins.json', 'utf-8');
            const installedPluginsObj = JSON.parse(installedPluginsData);
            
            // Add the plugin to installed plugins
            installedPluginsObj.installedPlugins.push({
                id: plugin.id,
                version: plugin.version,
                active: true
            });
            
            // Write the updated data back to the file
            fs.writeFileSync(
                './plugins/installed_plugins.json',
                JSON.stringify(installedPluginsObj, null, 4),
                'utf-8'
            );
            
            // Reload the plugins data
            loadPluginsData();
            
            // Update the terminal with a message
            const terminal = document.getElementById('terminal');
            if (terminal) {
                terminal.innerHTML += `<p>Plugin ${plugin.displayName} installed</p>`;
            }
        } catch (error) {
            console.error('Error installing plugin:', error);
            
            // Show error message
            alert(`Error installing plugin: ${error.message}`);
        }
    } else {
        // In browser mode, just update the UI
        alert(`Plugin ${plugin.displayName} would be installed in Electron mode`);
        
        // Reload the plugins data with updated placeholder data
        addPlaceholderPlugins();
        
        // Update the terminal with a message
        const terminal = document.getElementById('terminal');
        if (terminal) {
            terminal.innerHTML += `<p>Plugin ${plugin.displayName} installed (browser mode)</p>`;
        }
    }
}

module.exports = {
    setupDependencies,
    loadPluginsData,
    addPlaceholderPlugins,
    togglePluginActive,
    installPlugin
};
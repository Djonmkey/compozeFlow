/**
 * pluginsDialogs.js
 *
 * Handles dialog creation and interaction for plugin operations.
 */

const fs = require('fs');
const { FEATURE_FLAGS } = require('./featureFlags');

// Data management functions (will be set via dependency injection)
let loadPluginsDataFunc;
let addPlaceholderPluginsFunc;

/**
 * Sets up the dependencies for this module
 * @param {Function} loadData - Function to load plugins data
 * @param {Function} addPlaceholders - Function to add placeholder plugins
 */
function setupDependencies(loadData, addPlaceholders) {
    loadPluginsDataFunc = loadData;
    addPlaceholderPluginsFunc = addPlaceholders;
}

/**
 * Shows a dialog to uninstall a plugin
 * @param {string} pluginId - The ID of the plugin to uninstall
 * @param {string} pluginName - The display name of the plugin
 */
function showUninstallPluginDialog(pluginId, pluginName) {
    // Check if plugins feature is enabled
    if (!FEATURE_FLAGS.ENABLE_PLUGINS) {
        console.log('Plugins feature is disabled by feature flag');
        return;
    }
    
    // Create a confirmation dialog
    const dialogHtml = `
        <div class="dialog-overlay">
            <div class="dialog-content">
                <h3>Uninstall Plugin</h3>
                <p>Are you sure you want to uninstall this plugin?</p>
                <p><strong>${pluginName}</strong></p>
                <div class="dialog-buttons">
                    <button id="dialog-cancel">Cancel</button>
                    <button id="dialog-uninstall">Uninstall</button>
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
    const uninstallButton = document.getElementById('dialog-uninstall');
    
    // Cancel button closes the dialog
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(dialogElement);
    });
    
    // Uninstall button uninstalls the plugin and closes the dialog
    uninstallButton.addEventListener('click', () => {
        // Check if we're running in Electron
        if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
            try {
                // Read the installed plugins JSON file
                const installedPluginsData = fs.readFileSync('./plugins/installed_plugins.json', 'utf-8');
                const installedPluginsObj = JSON.parse(installedPluginsData);
                
                // Remove the plugin from installed plugins
                installedPluginsObj.installedPlugins = installedPluginsObj.installedPlugins.filter(
                    p => p.id !== pluginId
                );
                
                // Write the updated data back to the file
                fs.writeFileSync(
                    './plugins/installed_plugins.json',
                    JSON.stringify(installedPluginsObj, null, 4),
                    'utf-8'
                );
                
                // Reload the plugins data
                if (loadPluginsDataFunc) {
                    loadPluginsDataFunc();
                } else {
                    console.error('loadPluginsData function not set');
                }
                
                // Update the terminal with a message
                const terminal = document.getElementById('terminal');
                if (terminal) {
                    terminal.innerHTML += `<p>Plugin ${pluginName} uninstalled</p>`;
                }
            } catch (error) {
                console.error('Error uninstalling plugin:', error);
                
                // Show error message
                alert(`Error uninstalling plugin: ${error.message}`);
            }
        } else {
            // In browser mode, just update the UI
            alert(`Plugin ${pluginName} would be uninstalled in Electron mode`);
            
            // Reload the plugins data with updated placeholder data
            if (addPlaceholderPluginsFunc) {
                addPlaceholderPluginsFunc();
            } else {
                console.error('addPlaceholderPlugins function not set');
            }
            
            // Update the terminal with a message
            const terminal = document.getElementById('terminal');
            if (terminal) {
                terminal.innerHTML += `<p>Plugin ${pluginName} uninstalled (browser mode)</p>`;
            }
        }
        
        // Close the dialog
        document.body.removeChild(dialogElement);
    });
}

/**
 * Shows a dialog to install a plugin from a URL or file
 */
function showInstallPluginDialog() {
    // Check if plugins feature is enabled
    if (!FEATURE_FLAGS.ENABLE_PLUGINS) {
        console.log('Plugins feature is disabled by feature flag');
        return;
    }
    
    // Create a dialog
    const dialogHtml = `
        <div class="dialog-overlay">
            <div class="dialog-content">
                <h3>Install Plugin</h3>
                <div class="dialog-form">
                    <div class="form-group">
                        <label for="plugin-source">Plugin Source:</label>
                        <select id="plugin-source">
                            <option value="url">URL</option>
                            <option value="file">Local File</option>
                        </select>
                    </div>
                    <div class="form-group" id="plugin-url-group">
                        <label for="plugin-url">Plugin URL:</label>
                        <input type="text" id="plugin-url" placeholder="Enter plugin URL">
                    </div>
                    <div class="form-group" id="plugin-file-group" style="display: none;">
                        <label for="plugin-file">Plugin File:</label>
                        <button id="browse-plugin-file">Browse...</button>
                        <span id="selected-file-name">No file selected</span>
                    </div>
                    <div class="dialog-buttons">
                        <button id="dialog-cancel">Cancel</button>
                        <button id="dialog-install">Install</button>
                    </div>
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
    const installButton = document.getElementById('dialog-install');
    const sourceSelect = document.getElementById('plugin-source');
    const urlGroup = document.getElementById('plugin-url-group');
    const fileGroup = document.getElementById('plugin-file-group');
    const browseButton = document.getElementById('browse-plugin-file');
    
    // Source select changes the visible form group
    sourceSelect.addEventListener('change', () => {
        if (sourceSelect.value === 'url') {
            urlGroup.style.display = '';
            fileGroup.style.display = 'none';
        } else {
            urlGroup.style.display = 'none';
            fileGroup.style.display = '';
        }
    });
    
    // Browse button would open a file dialog in Electron
    browseButton.addEventListener('click', () => {
        if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
            try {
                // In a real implementation, you would use Electron's dialog API
                // For this example, we'll just show a message
                document.getElementById('selected-file-name').textContent = 'example-plugin.zip';
            } catch (error) {
                console.error('Error browsing for plugin file:', error);
            }
        } else {
            // In browser mode, just update the UI
            document.getElementById('selected-file-name').textContent = 'example-plugin.zip';
        }
    });
    
    // Cancel button closes the dialog
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(dialogElement);
    });
    
    // Install button installs the plugin and closes the dialog
    installButton.addEventListener('click', () => {
        const source = sourceSelect.value;
        let pluginSource = '';
        
        if (source === 'url') {
            pluginSource = document.getElementById('plugin-url').value.trim();
            if (!pluginSource) {
                alert('Please enter a plugin URL');
                return;
            }
        } else {
            pluginSource = document.getElementById('selected-file-name').textContent;
            if (pluginSource === 'No file selected') {
                alert('Please select a plugin file');
                return;
            }
        }
        
        // In a real implementation, you would download and install the plugin
        // For this example, we'll just show a message
        alert(`Plugin would be installed from ${source}: ${pluginSource}`);
        
        // Close the dialog
        document.body.removeChild(dialogElement);
        
        // Update the terminal with a message
        const terminal = document.getElementById('terminal');
        if (terminal) {
            terminal.innerHTML += `<p>Plugin installation from ${source} initiated</p>`;
        }
    });
}

module.exports = {
    setupDependencies,
    showUninstallPluginDialog,
    showInstallPluginDialog
};
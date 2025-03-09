/**
 * pluginsDisplay.js
 * 
 * Handles the display of plugins in the explorer area.
 */

const fs = require('fs');
const path = require('path');

/**
 * Generates HTML for the plugins mode in the explorer area
 * @returns {string} HTML content for the plugins explorer
 */
function generatePluginsHtml() {
    let html = '<div class="explorer-container plugins-mode">';
    
    // Add plugins header
    html += `
        <div class="explorer-plugins-header">
            <h3>Plugins</h3>
            <button class="install-plugin-btn" title="Install a new plugin">
                <span class="add-icon">+</span>
                <span>Install Plugin</span>
            </button>
        </div>
    `;
    
    // Add plugins search
    html += `
        <div class="explorer-search-container">
            <div class="explorer-search-bar">
                <span class="search-icon">🔍</span>
                <input type="text" id="plugins-search-input" class="explorer-search-input" placeholder="Search plugins" />
            </div>
        </div>
    `;
    
    // Add tabs for installed and available plugins
    html += `
        <div class="plugins-tabs">
            <div class="plugins-tab active" data-tab="installed">Installed</div>
            <div class="plugins-tab" data-tab="available">Available</div>
        </div>
    `;
    
    // Add container for installed plugins
    html += `
        <div class="plugins-tab-content" id="installed-plugins-tab" style="display: block;">
            <div class="plugins-list" id="installed-plugins-list">
                <div class="plugins-loading">Loading installed plugins...</div>
            </div>
        </div>
    `;
    
    // Add container for available plugins
    html += `
        <div class="plugins-tab-content" id="available-plugins-tab" style="display: none;">
            <div class="plugins-list" id="available-plugins-list">
                <div class="plugins-loading">Loading available plugins...</div>
            </div>
        </div>
    `;
    
    html += '</div>';
    return html;
}

/**
 * Initializes the plugins mode with event handlers
 */
function initializePlugins() {
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

/**
 * Loads plugins data from JSON files
 */
function loadPluginsData() {
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
            displayInstalledPlugins(installedPlugins, availablePlugins);
            displayAvailablePlugins(availablePlugins, installedPlugins);
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
 * Displays installed plugins in the list
 * @param {Array} installedPlugins - Array of installed plugins
 * @param {Array} availablePlugins - Array of available plugins (for details)
 */
function displayInstalledPlugins(installedPlugins, availablePlugins) {
    const container = document.getElementById('installed-plugins-list');
    
    if (installedPlugins.length === 0) {
        container.innerHTML = `
            <div class="plugins-empty">
                No plugins installed. Install plugins from the Available tab.
            </div>
        `;
        return;
    }
    
    // Create a map of plugin IDs to their details for quick lookup
    const pluginDetailsMap = {};
    availablePlugins.forEach(plugin => {
        pluginDetailsMap[plugin.id] = plugin;
    });
    
    let html = '';
    
    // Sort plugins by name
    installedPlugins.sort((a, b) => {
        const nameA = (pluginDetailsMap[a.id]?.displayName || a.id).toLowerCase();
        const nameB = (pluginDetailsMap[b.id]?.displayName || b.id).toLowerCase();
        return nameA.localeCompare(nameB);
    });
    
    // Add each installed plugin
    installedPlugins.forEach(plugin => {
        const pluginDetails = pluginDetailsMap[plugin.id] || {
            displayName: plugin.id,
            description: 'No description available',
            author: 'Unknown'
        };
        
        const activeClass = plugin.active ? 'plugin-active' : 'plugin-inactive';
        
        html += `
            <div class="plugin-item ${activeClass}" data-plugin-id="${plugin.id}">
                <div class="plugin-header">
                    <div class="plugin-icon">
                        ${pluginDetails.iconUrl ? '🖼️' : '🧩'}
                    </div>
                    <div class="plugin-info">
                        <div class="plugin-name">${pluginDetails.displayName}</div>
                        <div class="plugin-version">v${plugin.version}</div>
                    </div>
                    <div class="plugin-actions">
                        <button class="plugin-toggle-btn" title="${plugin.active ? 'Deactivate' : 'Activate'} plugin">
                            ${plugin.active ? '✓' : '✗'}
                        </button>
                        <button class="plugin-uninstall-btn" title="Uninstall plugin">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="plugin-details">
                    <div class="plugin-description">${pluginDetails.description}</div>
                    <div class="plugin-author">By: ${pluginDetails.author}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add event listeners for plugin actions
    document.querySelectorAll('.plugin-toggle-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            // Prevent the click from propagating
            event.stopPropagation();
            
            // Get the plugin item
            const pluginItem = button.closest('.plugin-item');
            const pluginId = pluginItem.getAttribute('data-plugin-id');
            
            // Toggle the active state
            togglePluginActive(pluginId, pluginItem);
        });
    });
    
    document.querySelectorAll('.plugin-uninstall-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            // Prevent the click from propagating
            event.stopPropagation();
            
            // Get the plugin item
            const pluginItem = button.closest('.plugin-item');
            const pluginId = pluginItem.getAttribute('data-plugin-id');
            
            // Show uninstall confirmation dialog
            showUninstallPluginDialog(pluginId, pluginDetailsMap[pluginId]?.displayName || pluginId);
        });
    });
    
    // Add click event to expand/collapse plugin details
    document.querySelectorAll('.plugin-header').forEach(header => {
        header.addEventListener('click', () => {
            const pluginItem = header.closest('.plugin-item');
            pluginItem.classList.toggle('expanded');
        });
    });
}

/**
 * Displays available plugins in the list
 * @param {Array} availablePlugins - Array of available plugins
 * @param {Array} installedPlugins - Array of installed plugins (to check if already installed)
 */
function displayAvailablePlugins(availablePlugins, installedPlugins) {
    const container = document.getElementById('available-plugins-list');
    
    if (availablePlugins.length === 0) {
        container.innerHTML = `
            <div class="plugins-empty">
                No plugins available.
            </div>
        `;
        return;
    }
    
    // Create a set of installed plugin IDs for quick lookup
    const installedPluginIds = new Set();
    installedPlugins.forEach(plugin => {
        installedPluginIds.add(plugin.id);
    });
    
    let html = '';
    
    // Sort plugins by name
    availablePlugins.sort((a, b) => {
        return a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase());
    });
    
    // Add each available plugin
    availablePlugins.forEach(plugin => {
        const isInstalled = installedPluginIds.has(plugin.id);
        const installButtonText = isInstalled ? 'Installed' : 'Install';
        const installButtonClass = isInstalled ? 'plugin-installed-btn' : 'plugin-install-btn';
        
        html += `
            <div class="plugin-item" data-plugin-id="${plugin.id}">
                <div class="plugin-header">
                    <div class="plugin-icon">
                        ${plugin.iconUrl ? '🖼️' : '🧩'}
                    </div>
                    <div class="plugin-info">
                        <div class="plugin-name">${plugin.displayName}</div>
                        <div class="plugin-version">v${plugin.version}</div>
                    </div>
                    <div class="plugin-actions">
                        <button class="${installButtonClass}" ${isInstalled ? 'disabled' : ''}>
                            ${installButtonText}
                        </button>
                    </div>
                </div>
                <div class="plugin-details">
                    <div class="plugin-description">${plugin.description}</div>
                    <div class="plugin-author">By: ${plugin.author}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add event listeners for plugin install buttons
    document.querySelectorAll('.plugin-install-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            // Prevent the click from propagating
            event.stopPropagation();
            
            // Get the plugin item
            const pluginItem = button.closest('.plugin-item');
            const pluginId = pluginItem.getAttribute('data-plugin-id');
            
            // Install the plugin
            installPlugin(pluginId, availablePlugins);
        });
    });
    
    // Add click event to expand/collapse plugin details
    document.querySelectorAll('.plugin-header').forEach(header => {
        header.addEventListener('click', () => {
            const pluginItem = header.closest('.plugin-item');
            pluginItem.classList.toggle('expanded');
        });
    });
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
    displayInstalledPlugins(installedPlugins, availablePlugins);
    displayAvailablePlugins(availablePlugins, installedPlugins);
}

/**
 * Filters plugins based on search text
 * @param {string} searchText - The text to search for
 */
function filterPlugins(searchText) {
    // Filter installed plugins
    const installedPlugins = document.querySelectorAll('#installed-plugins-list .plugin-item');
    filterPluginItems(installedPlugins, searchText);
    
    // Filter available plugins
    const availablePlugins = document.querySelectorAll('#available-plugins-list .plugin-item');
    filterPluginItems(availablePlugins, searchText);
}

/**
 * Filters plugin items based on search text
 * @param {NodeList} pluginItems - The plugin items to filter
 * @param {string} searchText - The text to search for
 */
function filterPluginItems(pluginItems, searchText) {
    pluginItems.forEach(item => {
        const pluginName = item.querySelector('.plugin-name').textContent.toLowerCase();
        const pluginDescription = item.querySelector('.plugin-description').textContent.toLowerCase();
        
        if (pluginName.includes(searchText) || pluginDescription.includes(searchText)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Toggles a plugin's active state
 * @param {string} pluginId - The ID of the plugin
 * @param {Element} pluginItem - The plugin item element
 */
function togglePluginActive(pluginId, pluginItem) {
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

/**
 * Shows a dialog to uninstall a plugin
 * @param {string} pluginId - The ID of the plugin to uninstall
 * @param {string} pluginName - The display name of the plugin
 */
function showUninstallPluginDialog(pluginId, pluginName) {
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
                loadPluginsData();
                
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
            addPlaceholderPlugins();
            
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

// Add CSS for plugins mode
const pluginsStyle = document.createElement('style');
pluginsStyle.textContent = `
    .plugins-mode {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    
    .explorer-plugins-header {
        padding: 10px;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .explorer-plugins-header h3 {
        margin: 0;
        font-size: 14px;
        color: #555;
    }
    
    .install-plugin-btn {
        display: flex;
        align-items: center;
        gap: 5px;
        background-color: #4a86e8;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .install-plugin-btn:hover {
        background-color: #3a76d8;
    }
    
    .plugins-tabs {
        display: flex;
        border-bottom: 1px solid #ddd;
    }
    
    .plugins-tab {
        padding: 8px 15px;
        cursor: pointer;
        font-size: 13px;
        border-bottom: 2px solid transparent;
    }
    
    .plugins-tab:hover {
        background-color: #f0f0f0;
    }
    
    .plugins-tab.active {
        border-bottom-color: #4a86e8;
        font-weight: bold;
    }
    
    .plugins-tab-content {
        flex: 1;
        overflow: auto;
        padding: 10px;
    }
    
    .plugins-loading {
        color: #888;
        font-style: italic;
        text-align: center;
        margin-top: 20px;
    }
    
    .plugins-error {
        color: #d32f2f;
        font-style: italic;
        text-align: center;
        margin-top: 20px;
        padding: 10px;
        background-color: #ffebee;
        border-radius: 4px;
    }
    
    .plugins-empty {
        color: #888;
        font-style: italic;
        text-align: center;
        margin-top: 20px;
    }
    
    .plugin-item {
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .plugin-item.expanded .plugin-details {
        display: block;
    }
    
    .plugin-header {
        display: flex;
        align-items: center;
        padding: 10px;
        cursor: pointer;
        background-color: #f5f5f5;
    }
    
    .plugin-header:hover {
        background-color: #e0e0e0;
    }
    
    .plugin-icon {
        font-size: 20px;
        margin-right: 10px;
    }
    
    .plugin-info {
        flex: 1;
    }
    
    .plugin-name {
        font-weight: bold;
    }
    
    .plugin-version {
        font-size: 12px;
        color: #666;
    }
    
    .plugin-actions {
        display: flex;
        gap: 5px;
    }
    
    .plugin-toggle-btn,
    .plugin-uninstall-btn,
    .plugin-install-btn,
    .plugin-installed-btn {
        background-color: transparent;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .plugin-toggle-btn:hover {
        background-color: #e0e0e0;
    }
    
    .plugin-uninstall-btn:hover {
        background-color: #ffdddd;
        border-color: #ff6666;
    }
    
    .plugin-install-btn {
        width: auto;
        padding: 0 8px;
        background-color: #4a86e8;
        color: white;
        border-color: #4a86e8;
    }
    
    .plugin-install-btn:hover {
        background-color: #3a76d8;
    }
    
    .plugin-installed-btn {
        width: auto;
        padding: 0 8px;
        background-color: #4caf50;
        color: white;
        border-color: #4caf50;
        cursor: default;
    }
    
    .plugin-details {
        padding: 10px;
        border-top: 1px solid #ddd;
        background-color: white;
        display: none;
    }
    
    .plugin-description {
        margin-bottom: 5px;
    }
    
    .plugin-author {
        font-size: 12px;
        color: #666;
    }
    
    .plugin-active {
        border-left: 3px solid #4caf50;
    }
    
    .plugin-inactive {
        border-left: 3px solid #f44336;
    }
`;
document.head.appendChild(pluginsStyle);

module.exports = {
    generatePluginsHtml,
    initializePlugins
};
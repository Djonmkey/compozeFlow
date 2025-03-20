/**
 * pluginsUI.js
 *
 * Handles the UI generation and display for the plugins feature.
 */

// Import feature flags
const { FEATURE_FLAGS } = require('./featureFlags');

// We'll use dependency injection to avoid circular dependencies
let togglePluginActiveFunc;
let installPluginFunc;
let showUninstallPluginDialogFunc;

/**
 * Sets up the dependencies for this module
 * @param {Function} toggleActive - Function to toggle plugin active state
 * @param {Function} install - Function to install a plugin
 * @param {Function} showUninstall - Function to show uninstall dialog
 */
function setupDependencies(toggleActive, install, showUninstall) {
    togglePluginActiveFunc = toggleActive;
    installPluginFunc = install;
    showUninstallPluginDialogFunc = showUninstall;
}

/**
 * Generates HTML for the plugins mode in the explorer area
 * @returns {string} HTML content for the plugins explorer
 */
function generatePluginsHtml() {
    // Check if plugins feature is enabled
    if (!FEATURE_FLAGS.ENABLE_PLUGINS) {
        console.log('Plugins feature is disabled by feature flag');
        return '<div class="explorer-container"><div class="explorer-empty">Plugins feature is currently disabled.</div></div>';
    }
    
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
 * Displays installed plugins in the list
 * @param {Array} installedPlugins - Array of installed plugins
 * @param {Array} availablePlugins - Array of available plugins (for details)
 */
function displayInstalledPlugins(installedPlugins, availablePlugins) {
    // Check if plugins feature is enabled
    if (!FEATURE_FLAGS.ENABLE_PLUGINS) {
        console.log('Plugins feature is disabled by feature flag');
        return;
    }
    
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
            if (togglePluginActiveFunc) {
                togglePluginActiveFunc(pluginId, pluginItem);
            } else {
                console.error('togglePluginActive function not set');
            }
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
            if (showUninstallPluginDialogFunc) {
                showUninstallPluginDialogFunc(pluginId, pluginDetailsMap[pluginId]?.displayName || pluginId);
            } else {
                console.error('showUninstallPluginDialog function not set');
            }
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
    // Check if plugins feature is enabled
    if (!FEATURE_FLAGS.ENABLE_PLUGINS) {
        console.log('Plugins feature is disabled by feature flag');
        return;
    }
    
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
            if (installPluginFunc) {
                installPluginFunc(pluginId, availablePlugins);
            } else {
                console.error('installPlugin function not set');
            }
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
 * Filters plugins based on search text
 * @param {string} searchText - The text to search for
 */
function filterPlugins(searchText) {
    // Check if plugins feature is enabled
    if (!FEATURE_FLAGS.ENABLE_PLUGINS) {
        console.log('Plugins feature is disabled by feature flag');
        return;
    }
    
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

// Add CSS for plugins mode
function addPluginsStyles() {
    // Check if plugins feature is enabled
    if (!FEATURE_FLAGS.ENABLE_PLUGINS) {
        console.log('Plugins feature is disabled by feature flag');
        return;
    }
    
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
}

module.exports = {
    setupDependencies,
    generatePluginsHtml,
    displayInstalledPlugins,
    displayAvailablePlugins,
    filterPlugins,
    filterPluginItems,
    addPluginsStyles
};
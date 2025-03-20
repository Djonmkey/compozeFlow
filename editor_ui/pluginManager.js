/**
 * pluginManager.js
 *
 * Handles plugin management for the application.
 */

// Import required modules
const electronSetup = require('./electronSetup');
const { FEATURE_FLAGS } = require('./featureFlags');

/**
 * Function to load and display installed plugins
 */
async function loadInstalledPlugins() {
  // Check if plugins feature is enabled
  if (!FEATURE_FLAGS.ENABLE_PLUGINS) {
    console.log('Plugins feature is disabled by feature flag');
    return;
  }

  // Get the container for installed plugin icons
  const installedPluginsContainer = document.getElementById('installed-plugins-icons');
  
  // Clear any existing content
  installedPluginsContainer.innerHTML = '';
  
  if (electronSetup.isElectron && electronSetup.fs) {
    try {
      // Read the installed plugins JSON file
      const installedPluginsData = electronSetup.fs.readFileSync('./plugins/installed_plugins.json', 'utf-8');
      const installedPlugins = JSON.parse(installedPluginsData).installedPlugins;
      
      // Read the available plugins JSON file to get icon URLs
      const availablePluginsData = electronSetup.fs.readFileSync('./plugins/available_plugins.json', 'utf-8');
      const availablePlugins = JSON.parse(availablePluginsData).plugins;
      
      // Create a map of plugin IDs to their details for quick lookup
      const pluginDetailsMap = {};
      availablePlugins.forEach(plugin => {
        pluginDetailsMap[plugin.id] = plugin;
      });
      
      // Create an icon for each installed plugin
      installedPlugins.forEach(plugin => {
        const pluginIcon = document.createElement('div');
        pluginIcon.className = `plugin-icon ${plugin.active ? 'active' : 'inactive'}`;
        
        // Get the plugin details from the available plugins
        const pluginDetails = pluginDetailsMap[plugin.id];
        
        // Check if we have details and an icon URL
        if (pluginDetails && pluginDetails.iconUrl) {
          // Use the actual icon URL
          // In a real implementation, you would load the image from the URL
          // For this example, we'll use a placeholder
          pluginIcon.textContent = '🖼️'; // Image icon as placeholder
          pluginIcon.title = `${pluginDetails.displayName} (v${plugin.version})${plugin.active ? '' : ' - Inactive'}`;
        } else {
          // Use a blue puzzle piece for plugins without icons
          pluginIcon.textContent = '🧩'; // Puzzle piece
          pluginIcon.classList.add('default-icon'); // Add class for blue color
          
          // Use the plugin ID for the title if we don't have display name
          const displayName = pluginDetails ? pluginDetails.displayName : plugin.id;
          pluginIcon.title = `${displayName} (v${plugin.version})${plugin.active ? '' : ' - Inactive'}`;
        }
        
        // Add click event to toggle plugin active state
        pluginIcon.addEventListener('click', () => {
          // Toggle the active state in the UI
          plugin.active = !plugin.active;
          pluginIcon.classList.toggle('active');
          pluginIcon.classList.toggle('inactive');
          
          // Update the title
          const displayName = pluginDetails ? pluginDetails.displayName : plugin.id;
          pluginIcon.title = `${displayName} (v${plugin.version})${plugin.active ? '' : ' - Inactive'}`;
          
          // In a real implementation, you would also update the JSON file
          // and possibly notify the main process about the change
          
          // Update the terminal with a message
          const terminal = document.getElementById('terminal');
          terminal.innerHTML += `<p>Plugin ${displayName} ${plugin.active ? 'activated' : 'deactivated'}</p>`;
        });
        
        // Add the plugin icon to the container
        installedPluginsContainer.appendChild(pluginIcon);
      });
      
      console.log('Installed plugins loaded successfully');
    } catch (error) {
      console.error('Error loading installed plugins:', error);
      
      // Update the terminal with an error message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Error loading installed plugins: ${error.message}</p>`;
      
      // Add placeholder plugins for browser mode
      addPlaceholderPlugins(installedPluginsContainer);
    }
  } else {
    // In browser mode, add placeholder plugins
    addPlaceholderPlugins(installedPluginsContainer);
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Running in browser mode - showing placeholder plugins</p>`;
  }
}

/**
 * Helper function to add placeholder plugins in browser mode
 * @param {HTMLElement} container - The container to add placeholder plugins to
 */
function addPlaceholderPlugins(container) {
  // Add a few placeholder plugin icons for demonstration
  const placeholderPlugins = [
    { icon: '🧩', name: 'Plugin 1', active: true },
    { icon: '🖼️', name: 'Plugin 2', active: true },
    { icon: '📊', name: 'Plugin 3', active: false }
  ];
  
  placeholderPlugins.forEach(plugin => {
    const pluginIcon = document.createElement('div');
    pluginIcon.className = `plugin-icon ${plugin.active ? 'active' : 'inactive'}`;
    pluginIcon.textContent = plugin.icon;
    
    if (!plugin.active) {
      pluginIcon.classList.add('inactive');
    }
    
    if (plugin.icon === '🧩') {
      pluginIcon.classList.add('default-icon');
    }
    
    pluginIcon.title = `${plugin.name}${plugin.active ? '' : ' - Inactive'}`;
    
    // Add click event to toggle active state
    pluginIcon.addEventListener('click', () => {
      // Toggle the active state in the UI
      plugin.active = !plugin.active;
      pluginIcon.classList.toggle('active');
      pluginIcon.classList.toggle('inactive');
      
      // Update the title
      pluginIcon.title = `${plugin.name}${plugin.active ? '' : ' - Inactive'}`;
      
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Plugin ${plugin.name} ${plugin.active ? 'activated' : 'deactivated'}</p>`;
    });
    
    // Add the plugin icon to the container
    container.appendChild(pluginIcon);
  });
}

/**
 * Function to save plugin state to the installed_plugins.json file
 * @param {Array} plugins - The array of plugin objects to save
 * @returns {boolean} - Whether the save was successful
 */
function savePluginState(plugins) {
  if (!electronSetup.isElectron || !electronSetup.fs) {
    console.error('Cannot save plugin state in browser mode');
    return false;
  }
  
  try {
    // Create the data object
    const data = {
      installedPlugins: plugins
    };
    
    // Convert to JSON
    const jsonContent = JSON.stringify(data, null, 2);
    
    // Write to file
    electronSetup.fs.writeFileSync('./plugins/installed_plugins.json', jsonContent, 'utf-8');
    
    console.log('Plugin state saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving plugin state:', error);
    return false;
  }
}

// Export the functions
module.exports = {
  loadInstalledPlugins,
  addPlaceholderPlugins,
  savePluginState
};
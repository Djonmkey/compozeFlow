/**
 * renderer.js
 *
 * Handles communication between the main process and the renderer process,
 * and updates the UI accordingly.
 */

const { ipcRenderer } = require('electron');
const fs = require('fs');
const generateHtmlFromVideoAssembly = require('./timelineDisplay');
const generateOverlayImagesHtml = require('./overlayImagesDisplay');
const generateMixedAudioHtml = require('./mixedAudioDisplay');

// DOM elements
const editorContent = document.getElementById('editor-content');
const tabs = document.querySelectorAll('.tab');
const tab1 = document.querySelector('.tab:nth-child(1)');

// Keep track of the currently active tab
let activeTab = 'Timeline';

// Store the current video assembly data and file path
let currentVideoAssemblyData = null;
let currentVideoAssemblyPath = null;

// Function to update the editor content based on the active tab
function updateEditorContent() {
  if (!currentVideoAssemblyData) return;
  
  let htmlContent = '';
  
  if (activeTab === 'Timeline') {
    htmlContent = generateHtmlFromVideoAssembly(currentVideoAssemblyData);
  } else if (activeTab === 'Overlay Images') {
    htmlContent = generateOverlayImagesHtml(currentVideoAssemblyData);
  } else if (activeTab === 'Mixed Audio') {
    htmlContent = generateMixedAudioHtml(currentVideoAssemblyData);
  } else {
    // For other tabs, show a placeholder
    htmlContent = `<h2>Content for ${activeTab} tab</h2><p>This tab is not yet implemented.</p>`;
  }
  
  // Update the editor content with the generated HTML
  editorContent.innerHTML = `
    <iframe
      id="video-assembly-frame"
      style="width: 100%; height: 100%; border: none;"
      srcdoc="${htmlContent.replace(/"/g, '&quot;')}"
    ></iframe>
  `;
  
  // Update the terminal with a message
  const terminal = document.getElementById('terminal');
  terminal.innerHTML += `<p>Displaying ${activeTab} view</p>`;
}

// Initialize tab click handlers
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Update active tab styling
    tabs.forEach(t => {
      t.style.backgroundColor = t.textContent === tab.textContent ? '#ddd' : '';
      t.style.fontWeight = t.textContent === tab.textContent ? 'bold' : 'normal';
    });
    
    activeTab = tab.textContent;
    updateEditorContent();
  });
});

// Listen for the 'video-assembly-opened' event from the main process
ipcRenderer.on('video-assembly-opened', (event, data) => {
  console.log('Received video assembly data:', data);
  
  // Store the current data
  currentVideoAssemblyData = data;
  
  // Make sure Timeline tab is active
  tabs.forEach(tab => {
    tab.style.backgroundColor = tab.textContent === 'Timeline' ? '#ddd' : '';
    tab.style.fontWeight = tab.textContent === 'Timeline' ? 'bold' : 'normal';
  });
  
  activeTab = 'Timeline';
  
  // Update the editor content based on the active tab
  updateEditorContent();
  
  // Update the terminal with a message
  const terminal = document.getElementById('terminal');
  terminal.innerHTML += `<p>Video assembly loaded and displayed in Timeline tab</p>`;
});

// Listen for messages from the iframe
window.addEventListener('message', (event) => {
  // Check if the message is a title update
  if (event.data && event.data.type === 'title-updated') {
    const newTitle = event.data.newTitle;
    
    // Update the title in the current data
    if (currentVideoAssemblyData && currentVideoAssemblyData.cut) {
      currentVideoAssemblyData.cut.title = newTitle;
      
      // Get the current file path from the main process
      ipcRenderer.invoke('get-current-file-path').then((filePath) => {
        if (filePath) {
          // Save the updated data to the file
          saveVideoAssemblyToFile(filePath, currentVideoAssemblyData);
        } else {
          console.error('No file path available for saving');
        }
      });
    }
  }
  // Check if the message is a subtitle update
  else if (event.data && event.data.type === 'subtitle-updated') {
    const newSubtitle = event.data.newSubtitle;
    
    // Update the subtitle in the current data
    if (currentVideoAssemblyData && currentVideoAssemblyData.cut) {
      currentVideoAssemblyData.cut.subtitle = newSubtitle;
      
      // Get the current file path from the main process
      ipcRenderer.invoke('get-current-file-path').then((filePath) => {
        if (filePath) {
          // Save the updated data to the file
          saveVideoAssemblyToFile(filePath, currentVideoAssemblyData);
        } else {
          console.error('No file path available for saving');
        }
      });
    }
  }
});

// Function to save video assembly data to a file
function saveVideoAssemblyToFile(filePath, data) {
  try {
    // Convert data to JSON string
    const jsonContent = JSON.stringify(data, null, 4);
    
    // Write to file
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Video assembly saved with updated title</p>`;
    
    console.log(`File saved to: ${filePath}`);
  } catch (error) {
    console.error('Error saving file:', error);
    
    // Update the terminal with an error message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Error saving file: ${error.message}</p>`;
  }
}

// Function to load and display installed plugins
async function loadInstalledPlugins() {
  try {
    // Read the installed plugins JSON file
    const installedPluginsData = fs.readFileSync('./plugins/installed_plugins.json', 'utf-8');
    const installedPlugins = JSON.parse(installedPluginsData).installedPlugins;
    
    // Read the available plugins JSON file to get icon URLs
    const availablePluginsData = fs.readFileSync('./plugins/available_plugins.json', 'utf-8');
    const availablePlugins = JSON.parse(availablePluginsData).plugins;
    
    // Create a map of plugin IDs to their details for quick lookup
    const pluginDetailsMap = {};
    availablePlugins.forEach(plugin => {
      pluginDetailsMap[plugin.id] = plugin;
    });
    
    // Get the container for installed plugin icons
    const installedPluginsContainer = document.getElementById('installed-plugins-icons');
    
    // Clear any existing content
    installedPluginsContainer.innerHTML = '';
    
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
  }
}

// Initialize the UI
document.addEventListener('DOMContentLoaded', () => {
  console.log('Renderer process initialized');
  
  // Load and display installed plugins
  loadInstalledPlugins();
});

// Listen for the current file path from the main process
ipcRenderer.on('current-file-path', (event, filePath) => {
  currentVideoAssemblyPath = filePath;
});
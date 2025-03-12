/**
 * renderer.js
 *
 * Handles communication between the main process and the renderer process,
 * and updates the UI accordingly.
 *
 * @sourceMappingURL=renderer.js.map
 */

// Check if we're running in Electron or a browser
const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';

// Install source map support for better debugging
if (isElectron) {
  try {
    require('source-map-support').install({
      handleUncaughtExceptions: true,
      environment: 'node',
      hookRequire: true
    });
    console.log('Source map support installed in renderer process');
  } catch (error) {
    console.error('Failed to install source map support in renderer:', error);
  }
}

// Initialize variables that would normally come from required modules
let ipcRenderer, fs, child_process, path, generateHtmlFromVideoAssembly, generateOverlayImagesHtml,
    generateMixedAudioHtml, generateGeneralHtml, generateExplorerHtml, initializeExplorer,
    fileTabsDisplay;

// Only try to require modules if we're in Electron
if (isElectron) {
  try {
    const electron = require('electron');
    ipcRenderer = electron.ipcRenderer;
    fs = require('fs');
    child_process = require('child_process');
    path = require('path');
    generateHtmlFromVideoAssembly = require('./timelineDisplay');
    generateOverlayImagesHtml = require('./overlayImagesDisplay');
    generateMixedAudioHtml = require('./mixedAudioDisplay');
    generateGeneralHtml = require('./generalDisplay');
    
    // Load explorer modules
    const explorerModule = require('./explorerDisplay');
    generateExplorerHtml = explorerModule.generateExplorerHtml;
    initializeExplorer = explorerModule.initializeExplorer;
    switchExplorerMode = explorerModule.switchMode;
    
    // Make sure the content sources, search, and plugins modules are loaded
    require('./contentSourcesDisplay');
    require('./searchDisplay');
    require('./pluginsDisplay');
    
    // Load the file tabs display module
    fileTabsDisplay = require('./fileTabsDisplay');
  } catch (error) {
    console.error('Error loading modules:', error);
  }
}

// DOM elements
const editorContent = document.getElementById('editor-content');
const tabs = document.querySelectorAll('.tab');
const tab1 = document.querySelector('.tab:nth-child(1)');

// Keep track of the currently active tab
let activeTab = 'Timeline';

// Store the current video assembly data and file path
let currentVideoAssemblyData = null;
let currentVideoAssemblyPath = null;

// Variables for render process
let renderProcess = null;
let isRendering = false;

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
  } else if (activeTab === 'General') {
    htmlContent = generateGeneralHtml(currentVideoAssemblyData);
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

// Function to update the explorer with content sources from the video assembly
function updateExplorer() {
  if (!currentVideoAssemblyData) return;
  
  const explorer = document.getElementById('explorer');
  
  // Only use generateExplorerHtml if it's available (in Electron)
  if (typeof generateExplorerHtml === 'function') {
    // Generate the explorer HTML
    const explorerHtml = generateExplorerHtml(currentVideoAssemblyData);
    
    // Update the explorer content
    explorer.innerHTML = explorerHtml;
    
    // Initialize explorer event handlers
    if (typeof initializeExplorer === 'function') {
      initializeExplorer(currentVideoAssemblyData);
    }
  } else {
    // In browser mode, show a placeholder
    explorer.innerHTML = `
      <div class="explorer-empty">
        Explorer functionality requires Electron environment.
        <br><br>
        <small>(Resize handle will still work in browser mode)</small>
      </div>
    `;
  }
  
  // Update the terminal with a message
  const terminal = document.getElementById('terminal');
  terminal.innerHTML += `<p>Explorer updated with content sources</p>`;
}

// Set up event listeners for Electron if available
if (isElectron && ipcRenderer) {
  // Listen for the 'video-assembly-opened' event from the main process
  ipcRenderer.on('video-assembly-opened', (event, data) => {
    console.log('Received video assembly data:', data);
    
    // Store the current data
    currentVideoAssemblyData = data;
    
    // Update the application title with the video assembly title
    if (data && data.cut && data.cut.title) {
      document.title = `compozeFlow - ${data.cut.title}`;
    } else {
      document.title = 'compozeFlow';
    }
    
    // Make sure Timeline tab is active
    tabs.forEach(tab => {
      tab.style.backgroundColor = tab.textContent === 'Timeline' ? '#ddd' : '';
      tab.style.fontWeight = tab.textContent === 'Timeline' ? 'bold' : 'normal';
    });
    
    activeTab = 'Timeline';
    
    // Update the editor content based on the active tab
    updateEditorContent();
    
    // Update the explorer with content sources
    updateExplorer();
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Video assembly loaded and displayed in Timeline tab</p>`;
  });
}

// Listen for messages from the iframe
window.addEventListener('message', (event) => {
  // Check if the message is a title update
  if (event.data && event.data.type === 'title-updated') {
    const newTitle = event.data.newTitle;
    
    // Update the title in the current data
    if (currentVideoAssemblyData && currentVideoAssemblyData.cut) {
      currentVideoAssemblyData.cut.title = newTitle;
      
      // Update the application title
      document.title = `compozeFlow - ${newTitle}`;
      
      // Only try to save if we're in Electron
      if (isElectron && ipcRenderer) {
        // Get the current file path from the main process
        ipcRenderer.invoke('get-current-file-path').then((filePath) => {
          if (filePath) {
            // Save the updated data to the file
            saveVideoAssemblyToFile(filePath, currentVideoAssemblyData);
          } else {
            console.error('No file path available for saving');
          }
        });
      } else {
        // In browser mode, just log the change
        console.log('Title updated to:', newTitle);
        // Update the terminal with a message
        const terminal = document.getElementById('terminal');
        terminal.innerHTML += `<p>Title updated to: ${newTitle} (changes not saved in browser mode)</p>`;
      }
    }
  }
  // Check if the message is a subtitle update
  else if (event.data && event.data.type === 'subtitle-updated') {
    const newSubtitle = event.data.newSubtitle;
    
    // Update the subtitle in the current data
    if (currentVideoAssemblyData && currentVideoAssemblyData.cut) {
      currentVideoAssemblyData.cut.subtitle = newSubtitle;
      
      // Only try to save if we're in Electron
      if (isElectron && ipcRenderer) {
        // Get the current file path from the main process
        ipcRenderer.invoke('get-current-file-path').then((filePath) => {
          if (filePath) {
            // Save the updated data to the file
            saveVideoAssemblyToFile(filePath, currentVideoAssemblyData);
          } else {
            console.error('No file path available for saving');
          }
        });
      } else {
        // In browser mode, just log the change
        console.log('Subtitle updated to:', newSubtitle);
        // Update the terminal with a message
        const terminal = document.getElementById('terminal');
        terminal.innerHTML += `<p>Subtitle updated to: ${newSubtitle} (changes not saved in browser mode)</p>`;
      }
    }
  }
});

// Function to save video assembly data to a file
function saveVideoAssemblyToFile(filePath, data) {
  // Only try to save if we're in Electron and have fs
  if (!isElectron || !fs) {
    console.error('Cannot save file in browser mode');
    return;
  }
  
  try {
    // Convert data to JSON string
    const jsonContent = JSON.stringify(data, null, 4);
    
    // Write to file
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Video assembly saved with updated data</p>`;
    
    console.log(`File saved to: ${filePath}`);
  } catch (error) {
    console.error('Error saving file:', error);
    
    // Update the terminal with an error message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Error saving file: ${error.message}</p>`;
  }
}

// Expose the saveVideoAssemblyToFile function to the window object
// so it can be accessed from other modules
window.saveVideoAssemblyToFile = saveVideoAssemblyToFile;

// Function to load and display installed plugins
async function loadInstalledPlugins() {
  // Get the container for installed plugin icons
  const installedPluginsContainer = document.getElementById('installed-plugins-icons');
  
  // Clear any existing content
  installedPluginsContainer.innerHTML = '';
  
  if (isElectron && fs) {
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

// Helper function to add placeholder plugins in browser mode
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

// Function to initialize the resize handle for the explorer section
function initializeResizeHandle() {
  const resizeHandle = document.getElementById('resize-handle');
  const explorer = document.getElementById('explorer');
  const app = document.getElementById('app');
  
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;
  
  // Update the resize handle position to match the explorer width
  function updateResizeHandlePosition() {
    // Position the handle at the right edge of the explorer
    // Subtract the width of the handle (8px) to align it with the right edge
    resizeHandle.style.left = `${explorer.offsetWidth + 42}px`;
  }
  
  // Initialize the resize handle position
  updateResizeHandlePosition();
  
  // Mouse down event on the resize handle
  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = explorer.offsetWidth;
    
    // Add a class to the body to indicate resizing is in progress
    document.body.classList.add('resizing');
    
    // Prevent text selection during resize
    e.preventDefault();
  });
  
  // Mouse move event to handle resizing
  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    // Calculate the new width based on mouse movement
    const newWidth = startWidth + (e.clientX - startX);
    
    // Apply min and max constraints
    const minWidth = 150;
    const maxWidth = 500;
    const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    
    // Update the explorer width
    explorer.style.width = `${constrainedWidth}px`;
    
    // Update the resize handle position
    updateResizeHandlePosition();
  });
  
  // Mouse up event to stop resizing
  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.classList.remove('resizing');
      
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Explorer width adjusted to ${explorer.offsetWidth}px</p>`;
    }
  });
  
  // Handle window resize to ensure the resize handle stays in the correct position
  window.addEventListener('resize', () => {
    updateResizeHandlePosition();
  });
}

// Function to handle the render button click
function handleRenderButtonClick() {
  const renderButton = document.getElementById('render-button');
  const terminal = document.getElementById('terminal');
  
  if (!isRendering) {
    // Start rendering
    startRender(renderButton, terminal);
  } else {
    // Stop rendering
    stopRender(renderButton, terminal);
  }
}

// Function to start the render process
function startRender(renderButton, terminal) {
  if (isRendering) return;
  
  isRendering = true;
  
  // Update button appearance
  renderButton.textContent = '■'; // Square for stop
  renderButton.classList.add('running');
  renderButton.title = 'Stop Render';
  
  // Clear terminal
  terminal.innerHTML = '<p>Starting render process...</p>';
  
  // Path to the Python script (using relative path since both are in the same base path)
  const pythonScriptPath = '../render_engine/main.py';
  
  // Path to the Python virtual environment
  const pythonVenvPath = process.platform === 'win32'
    ? '../render_engine/venv/Scripts/python.exe'  // Windows path
    : '../render_engine/venv/bin/python';         // macOS/Linux path
  
  try {
    // Check if we have a current video assembly path
    if (!currentVideoAssemblyPath) {
      terminal.innerHTML += `<p style="color: #ff6666;">Error: No video assembly file is currently loaded.</p>`;
      isRendering = false;
      renderButton.classList.remove('running');
      renderButton.classList.add('failed');
      renderButton.textContent = '▶';
      renderButton.title = 'Render failed - no file loaded';
      return;
    }
    
    // Check if the virtual environment exists
    const venvExists = fs.existsSync(path.resolve(__dirname, pythonVenvPath));
    
    // Use the virtual environment Python if it exists, otherwise fall back to system Python
    const pythonExecutable = venvExists ? pythonVenvPath : 'python';
    
    // Display the command being executed
    const command = `${pythonExecutable} ${pythonScriptPath} ${currentVideoAssemblyPath}`;
    terminal.innerHTML += `<p style="color: #88ccff;">Executing: ${command}</p>`;
    terminal.innerHTML += venvExists
      ? `<p>Using Python from virtual environment: ${pythonVenvPath}</p>`
      : `<p style="color: #ffcc66;">Warning: Virtual environment not found, falling back to system Python</p>`;
    
    // Spawn the Python process with the current video assembly file path as argument
    // Use shell option to ensure proper path handling
    renderProcess = child_process.spawn(pythonExecutable, [pythonScriptPath, currentVideoAssemblyPath], {
      shell: process.platform === 'win32', // Use shell on Windows for better path handling
      env: process.env, // Pass environment variables
      cwd: path.resolve(__dirname) // Set current working directory to ensure relative paths work
    });
    
    // Handle stdout data
    renderProcess.stdout.on('data', (data) => {
      // Process the output to handle line breaks properly
      const output = data.toString().trim();
      const lines = output.split('\n');
      
      // Add each line as a separate paragraph for better readability
      lines.forEach(line => {
        if (line.trim()) {
          terminal.innerHTML += `<p>${line}</p>`;
        }
      });
      
      // Auto-scroll to bottom
      terminal.scrollTop = terminal.scrollHeight;
    });
    
    // Handle stderr data
    renderProcess.stderr.on('data', (data) => {
      // Process the output to handle line breaks properly
      const output = data.toString().trim();
      const lines = output.split('\n');
      
      // Add each line as a separate paragraph with error styling
      lines.forEach(line => {
        if (line.trim()) {
          terminal.innerHTML += `<p style="color: #ff6666;">${line}</p>`;
        }
      });
      
      // Auto-scroll to bottom
      terminal.scrollTop = terminal.scrollHeight;
    });
    
    // Handle process completion
    renderProcess.on('close', (code) => {
      isRendering = false;
      renderProcess = null;
      
      if (code === 0) {
        // Success
        terminal.innerHTML += '<p style="color: #88ff88;">Render completed successfully.</p>';
        renderButton.classList.remove('running');
        renderButton.classList.remove('failed');
        renderButton.textContent = '▶';
        renderButton.title = 'Render Video';
      } else if (code === -2) {
        // Process was terminated by a signal (likely SIGINT)
        terminal.innerHTML += `<p style="color: #ffcc66;">Render process was terminated (code ${code}). This typically happens when the process is interrupted.</p>`;
        terminal.innerHTML += `<p>Check that Python is installed correctly and the script path is valid.</p>`;
        renderButton.classList.remove('running');
        renderButton.classList.add('failed');
        renderButton.textContent = '▶';
        renderButton.title = 'Last render was interrupted';
      } else {
        // Other failure
        terminal.innerHTML += `<p style="color: #ff6666;">Render process exited with code ${code}</p>`;
        terminal.innerHTML += `<p>This may indicate an error in the Python script or missing dependencies.</p>`;
        renderButton.classList.remove('running');
        renderButton.classList.add('failed');
        renderButton.textContent = '▶';
        renderButton.title = 'Last render failed';
      }
      
      // Auto-scroll to bottom
      terminal.scrollTop = terminal.scrollHeight;
    });
    
    // Handle process error
    renderProcess.on('error', (err) => {
      isRendering = false;
      renderProcess = null;
      
      // Display detailed error information
      terminal.innerHTML += `<p style="color: #ff6666;">Error starting render process: ${err.message}</p>`;
      
      // Add more helpful information based on the error
      if (err.code === 'ENOENT') {
        terminal.innerHTML += `<p>Python executable not found. Please ensure Python is installed and in your PATH.</p>`;
        terminal.innerHTML += `<p>Command attempted: python ${pythonScriptPath}</p>`;
      } else if (err.code === 'EACCES') {
        terminal.innerHTML += `<p>Permission denied. Check that you have execute permissions for the Python script.</p>`;
      } else {
        terminal.innerHTML += `<p>Error code: ${err.code || 'unknown'}</p>`;
      }
      
      // Suggest checking the script path
      terminal.innerHTML += `<p>Verify that the script exists at: ${pythonScriptPath}</p>`;
      
      renderButton.classList.remove('running');
      renderButton.classList.add('failed');
      renderButton.textContent = '▶';
      renderButton.title = 'Last render failed';
      
      // Auto-scroll to bottom
      terminal.scrollTop = terminal.scrollHeight;
    });
    
  } catch (error) {
    isRendering = false;
    terminal.innerHTML += `<p style="color: #ff6666;">Error: ${error.message}</p>`;
    renderButton.classList.remove('running');
    renderButton.classList.add('failed');
    renderButton.textContent = '▶';
    renderButton.title = 'Last render failed';
  }
}

// Function to stop the render process
function stopRender(renderButton, terminal) {
  if (!isRendering || !renderProcess) return;
  
  try {
    // Kill the process
    if (process.platform === 'win32') {
      // On Windows, we need to use taskkill to kill the process tree
      child_process.exec(`taskkill /pid ${renderProcess.pid} /t /f`);
    } else {
      // On Unix-like systems, we can kill the process group
      process.kill(-renderProcess.pid, 'SIGTERM');
    }
    
    terminal.innerHTML += '<p>Render process stopped by user.</p>';
    
    // Update button state
    renderButton.classList.remove('running');
    renderButton.textContent = '▶';
    renderButton.title = 'Render Video';
    
    isRendering = false;
    renderProcess = null;
    
  } catch (error) {
    terminal.innerHTML += `<p style="color: #ff6666;">Error stopping render process: ${error.message}</p>`;
  }
}

// Function to initialize the resize handle for the terminal section
function initializeTerminalResizeHandle() {
  const resizeHandle = document.getElementById('terminal-resize-handle');
  const terminal = document.getElementById('terminal');
  const editorContent = document.getElementById('editor-content');
  
  let isResizing = false;
  let startY = 0;
  let startHeight = 0;
  
  // Mouse down event on the resize handle
  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startY = e.clientY;
    startHeight = terminal.offsetHeight;
    
    // Add a class to the body to indicate resizing is in progress
    document.body.classList.add('resizing');
    
    // Prevent text selection during resize
    e.preventDefault();
  });
  
  // Mouse move event to handle resizing
  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    // Calculate the new height based on mouse movement (moving up decreases terminal height)
    const newHeight = startHeight - (e.clientY - startY);
    
    // Apply min and max constraints
    const minHeight = 50;
    const maxHeight = window.innerHeight * 0.8; // 80% of viewport height
    const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
    
    // Update the terminal height
    terminal.style.height = `${constrainedHeight}px`;
  });
  
  // Mouse up event to stop resizing
  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.classList.remove('resizing');
      
      // Update the terminal with a message
      terminal.innerHTML += `<p>Terminal height adjusted to ${terminal.offsetHeight}px</p>`;
      
      // Auto-scroll to bottom
      terminal.scrollTop = terminal.scrollHeight;
    }
  });
  
  // Handle window resize to ensure the resize handle stays in the correct position
  window.addEventListener('resize', () => {
    // No position updates needed for the terminal resize handle as it's relatively positioned
  });
}

// Initialize the UI
document.addEventListener('DOMContentLoaded', () => {
  console.log('Renderer process initialized');
  
  // Load and display installed plugins
  loadInstalledPlugins();
  
  // Initialize the resize handles
  initializeResizeHandle(); // For explorer
  initializeTerminalResizeHandle(); // For terminal
  
  // Initialize render button
  const renderButton = document.getElementById('render-button');
  if (renderButton) {
    renderButton.addEventListener('click', handleRenderButtonClick);
  }
});

// Listen for the current file path from the main process (only in Electron)
if (isElectron && ipcRenderer) {
  ipcRenderer.on('current-file-path', (event, filePath) => {
    currentVideoAssemblyPath = filePath;
  });
}
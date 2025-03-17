/**
 * renderer.js
 *
 * Handles communication between the main process and the renderer process,
 * and coordinates the various modules of the application.
 *
 * @sourceMappingURL=renderer.js.map
 */

// Import the modules
const electronSetup = require('./electronSetup');
const uiManager = require('./uiManager');
const videoAssemblyManager = require('./videoAssemblyManager');
const renderProcessManager = require('./renderProcessManager');
const renderTabDisplay = require('./renderTabDisplay');
const pluginManager = require('./pluginManager');
const { FEATURE_FLAGS } = require('./featureFlags');

// Getting Started UI elements
let gettingStartedContainer;
let newAssemblyBtn;
let openAssemblyBtn;
let githubLink;
let docsLink;
let communityLink;
let issuesLink;

// DOM elements
const editorContent = document.getElementById('editor-content');
const tabs = document.querySelectorAll('.tab');
const tab1 = document.querySelector('.tab:nth-child(1)');

// Set up event listeners for Electron if available
if (electronSetup.isElectron && electronSetup.ipcRenderer) {
  // Listen for the 'video-assembly-opened' event from the main process
  electronSetup.ipcRenderer.on('video-assembly-opened', (event, data) => {
    videoAssemblyManager.handleVideoAssemblyData(data);
    
    // Fire a resize event after a short delay to ensure UI is fully updated
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      console.log('Resize event fired after file load');
    }, 100);
  });
  
  // Listen for the current file path from the main process
  electronSetup.ipcRenderer.on('current-file-path', (event, filePath) => {
    videoAssemblyManager.setCurrentVideoAssemblyPath(filePath);
  });
  
  // Listen for file state changes from the main process
  electronSetup.ipcRenderer.on('file-state-changed', (event, data) => {
    if (typeof updateGettingStartedVisibility === 'function') {
      updateGettingStartedVisibility();
      
      // Fire a resize event after a short delay to ensure UI is fully updated
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        console.log('Resize event fired after file state change');
      }, 100);
    }
  });
  
  // Listen for requests to get the current content
  electronSetup.ipcRenderer.on('request-current-content', (event) => {
    console.log('Main process requested current content');
    const currentContent = videoAssemblyManager.getCurrentVideoAssemblyData();
    electronSetup.ipcRenderer.send('current-content-response', currentContent);
  });
}

// Listen for messages from the iframe
window.addEventListener('message', (event) => {
  // Check if the message is a title update
  if (event.data && event.data.type === 'title-updated') {
    videoAssemblyManager.handleTitleUpdate(event.data.newTitle);
  }
  // Check if the message is a subtitle update
  else if (event.data && event.data.type === 'subtitle-updated') {
    videoAssemblyManager.handleSubtitleUpdate(event.data.newSubtitle);
  }
  // Check if the message is a render segment request
  else if (event.data && event.data.type === 'render-segment') {
    // Switch to the Render tab before handling the render request
    if (window.uiManager) {
      window.uiManager.setActiveTab('Render');
    }
    videoAssemblyManager.handleRenderSegmentRequest(event.data.segmentSequence);
  }
  // Check if the message is a render scene request
  else if (event.data && event.data.type === 'render-scene') {
    // Switch to the Render tab before handling the render request
    if (window.uiManager) {
      window.uiManager.setActiveTab('Render');
    }
    videoAssemblyManager.handleRenderSceneRequest(event.data.segmentSequence, event.data.sceneSequence);
  }
  // Check if the message is to save output paths
  else if (event.data && event.data.type === 'save-output-paths') {
    videoAssemblyManager.handleSaveOutputPaths(event.data.data);
  }
  // Check if the message is to save high quality render settings
  else if (event.data && event.data.type === 'save-high-quality-settings') {
    videoAssemblyManager.handleSaveHighQualitySettings(event.data.data);
  }
  // Check if the message is to save quick render settings
  else if (event.data && event.data.type === 'save-quick-render-settings') {
    videoAssemblyManager.handleSaveQuickRenderSettings(event.data.data);
  }
  // Check if the message is to get clip data for editing
  else if (event.data && event.data.type === 'get-clip-data') {
    const clipData = videoAssemblyManager.handleGetClipData(event.data);
    if (clipData) {
      // Send the clip data back to the iframe for editing
      const iframe = document.getElementById('video-assembly-frame');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'clip-data-for-edit',
          clipData: clipData
        }, '*');
      }
    }
  }
  // Check if the message is to update a clip
  else if (event.data && event.data.type === 'update-clip') {
    videoAssemblyManager.handleUpdateClip(event.data.clipData);
  }
  // Check if the message is to delete a clip
  else if (event.data && event.data.type === 'delete-clip') {
    videoAssemblyManager.handleDeleteClip(event.data);
  }
  // Check if the message is to open a file dialog for a clip
  else if (event.data && event.data.type === 'open-file-dialog') {
    handleOpenFileDialogForClip(event.data);
  }
  // Check if the message is to add a file to the timeline from the File tab
  else if (event.data && event.data.type === 'add-to-timeline-from-file-tab') {
    const { currentFile, formData } = event.data;
    const timelineClipOperations = require('./timelineClipOperations');
    const success = timelineClipOperations.addClipToTimeline(currentFile, formData, videoAssemblyManager.getCurrentVideoAssemblyData());
    
    if (success) {
      timelineClipOperations.switchToTimelineTab();
    }
  }
});

// Expose the saveVideoAssemblyToFile function to the window object
// so it can be accessed from other modules
window.saveVideoAssemblyToFile = videoAssemblyManager.saveVideoAssemblyToFile;

// Expose the handleRenderButtonClick function to the window object
// so it can be accessed from the renderOptionsDisplay module
window.handleRenderButtonClick = renderProcessManager.handleRenderButtonClick;

// Expose the electronSetup module to the window object
// to avoid circular dependencies with modules that need it
window.electronSetup = electronSetup;

// Expose the updateGettingStartedVisibility function to the window object
// so it can be accessed from other modules
window.updateGettingStartedVisibility = updateGettingStartedVisibility;

/**
 * Function to handle opening a file dialog for a clip
 * @param {Object} data - Data containing segment, scene, and clip sequence numbers
 */
async function handleOpenFileDialogForClip(data) {
  const { segmentSequence, sceneSequence, clipSequence, clipType } = data;
  
  if (electronSetup.isElectron && electronSetup.ipcRenderer) {
    try {
      // Determine file filters based on clip type
      let filters = [];
      if (clipType === 'video') {
        filters = [
          { name: 'Video Files', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'] },
          { name: 'All Files', extensions: ['*'] }
        ];
      } else if (clipType === 'image') {
        filters = [
          { name: 'Image Files', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] },
          { name: 'All Files', extensions: ['*'] }
        ];
      }
      
      // Show the open file dialog
      const result = await electronSetup.ipcRenderer.invoke('show-open-file-dialog', filters);
      
      if (!result.canceled && result.filePath) {
        // Send the new path back to the iframe without updating the video assembly data
        // The actual update will happen when the user clicks "Save Changes" in the dialog
        const iframe = document.getElementById('video-assembly-frame');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'new-clip-path',
            newPath: result.filePath
          }, '*');
        }
        
        // Update the terminal with a message
        const terminal = document.getElementById('terminal');
        terminal.innerHTML += `<p>Selected new clip path: ${result.filePath}</p>`;
      }
    } catch (error) {
      console.error('Error opening file dialog:', error);
      
      // Update the terminal with an error message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Error opening file dialog: ${error.message}</p>`;
    }
  } else {
    console.error('Cannot open file dialog in browser mode');
    
    // Update the terminal with an error message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Cannot open file dialog in browser mode</p>`;
  }
}

const { getCurrentVideoAssemblyData } = require('./videoAssemblyManager');

/**
 * Initialize the Getting Started UI
 */
function initializeGettingStartedUI() {
  // Get references to UI elements
  gettingStartedContainer = document.getElementById('getting-started-container');
  newAssemblyBtn = document.getElementById('new-assembly-btn');
  openAssemblyBtn = document.getElementById('open-assembly-btn');
  githubLink = document.getElementById('github-link');
  docsLink = document.getElementById('docs-link');
  communityLink = document.getElementById('community-link');
  issuesLink = document.getElementById('issues-link');
  
  // Add event listeners for the action buttons
  if (newAssemblyBtn) {
    newAssemblyBtn.addEventListener('click', () => {
      if (electronSetup.isElectron && electronSetup.ipcRenderer) {
        // Trigger the New Video Assembly action in the main process
        electronSetup.ipcRenderer.send('menu-action', 'new-video-assembly');
      }
    });
  }
  
  if (openAssemblyBtn) {
    openAssemblyBtn.addEventListener('click', () => {
      if (electronSetup.isElectron && electronSetup.ipcRenderer) {
        // Trigger the Open Video Assembly action in the main process
        electronSetup.ipcRenderer.send('menu-action', 'open-video-assembly');
      }
    });
  }
  
  // Add event listeners for the external links
  const externalLinks = [githubLink, docsLink, communityLink, issuesLink];
  externalLinks.forEach(link => {
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (electronSetup.isElectron && electronSetup.ipcRenderer) {
          // Open the link in the default browser
          electronSetup.ipcRenderer.send('open-external-link', link.href);
        } else {
          // Fallback for non-Electron environment
          window.open(link.href, '_blank');
        }
      });
    }
  });
  
  // Show or hide the getting started UI based on whether a file is active
  updateGettingStartedVisibility();
}

/**
 * Update the visibility of the Getting Started UI based on whether a file is active
 */
function updateGettingStartedVisibility() {
  const hasActiveFile = videoAssemblyManager.getCurrentVideoAssemblyPath() !== null;
  
  if (gettingStartedContainer) {
    if (hasActiveFile) {
      // Hide the getting started UI and show the regular UI
      gettingStartedContainer.style.display = 'none';
      showRegularUI();
    } else {
      // Show the getting started UI and hide the regular UI
      gettingStartedContainer.style.display = 'block';
      hideRegularUI();
    }
    
    // Fire a resize event after a short delay to ensure UI is fully updated
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      console.log('Resize event fired after UI visibility change');
    }, 100);
  }
}

/**
 * Show the regular UI components
 */
function showRegularUI() {
  const iconBar = document.getElementById('icon-bar');
  const explorer = document.getElementById('explorer');
  const resizeHandle = document.getElementById('resize-handle');
  const mainSection = document.getElementById('main-section');
  
  if (iconBar) iconBar.style.display = 'flex';
  if (explorer) explorer.style.display = 'block';
  if (resizeHandle) resizeHandle.style.display = 'block';
  if (mainSection) mainSection.style.display = 'flex';
  
  // Ensure resize handles are properly positioned by calling the initialize functions
  setTimeout(() => {
    if (typeof uiManager.initializeResizeHandle === 'function') {
      uiManager.initializeResizeHandle();
    }
    if (typeof uiManager.initializeTerminalResizeHandle === 'function') {
      uiManager.initializeTerminalResizeHandle();
    }
  }, 50);
}

/**
 * Hide the regular UI components
 */
function hideRegularUI() {
  const iconBar = document.getElementById('icon-bar');
  const explorer = document.getElementById('explorer');
  const resizeHandle = document.getElementById('resize-handle');
  const mainSection = document.getElementById('main-section');
  
  if (iconBar) iconBar.style.display = 'none';
  if (explorer) explorer.style.display = 'none';
  if (resizeHandle) resizeHandle.style.display = 'none';
  if (mainSection) mainSection.style.display = 'none';
}

// Initialize the UI
document.addEventListener('DOMContentLoaded', () => {
    console.log('Renderer process initialized');
    
    // Initialize tabs
    uiManager.initializeTabs();

    // Add event listener for Raw tab
    const rawTab = document.querySelector('.tab:nth-child(7)'); // Updated index due to added Render tab
    rawTab.addEventListener('click', () => {
        const data = getCurrentVideoAssemblyData();
        if (data) {
            const prettyPrintedJson = JSON.stringify(data, null, 2);
            editorContent.innerText = prettyPrintedJson;
        } else {
            editorContent.innerText = 'No video assembly data available.';
        }
    });
    
    // Initialize the Getting Started UI
    initializeGettingStartedUI();
    
    // Initialize the Render tab
    renderTabDisplay.initializeRenderTab();
    
    // Start the refresh interval for the Render tab
    renderTabDisplay.startRefreshInterval();
  
    // Load and display installed plugins if the feature is enabled
    if (FEATURE_FLAGS.ENABLE_PLUGINS) {
        pluginManager.loadInstalledPlugins();
    } else {
        console.log('Plugins feature is disabled by feature flag');
        
        // Hide the plugins icon and container when the feature is disabled
        const pluginsIcon = document.getElementById('plugins-icon');
        const installedPluginsContainer = document.getElementById('installed-plugins-icons');
        
        if (pluginsIcon) {
            pluginsIcon.style.display = 'none';
        }
        
        if (installedPluginsContainer) {
            installedPluginsContainer.style.display = 'none';
        }
    }
    
    // Check if account icon should be displayed
    if (!FEATURE_FLAGS.ENABLE_ACCOUNT_FEATURES) {
        console.log('Account icon is disabled by feature flag');
        
        // Hide the account icon when the feature is disabled
        const accountIcon = document.getElementById('account-icon');
        
        if (accountIcon) {
            accountIcon.style.display = 'none';
        }
    }
    
    // Check if settings icon should be displayed
    if (!FEATURE_FLAGS.ENABLE_SETTINGS_FEATURE) {
        console.log('Settings icon is disabled by feature flag');
        
        // Hide the settings icon when the feature is disabled
        const settingsIcon = document.getElementById('settings-icon');
        
        if (settingsIcon) {
            settingsIcon.style.display = 'none';
        }
    }
    
    // Initialize the resize handles
    uiManager.initializeResizeHandle(); // For explorer
    uiManager.initializeTerminalResizeHandle(); // For terminal
    
    // Initialize render options
    if (typeof electronSetup.renderOptionsDisplay !== 'undefined' && 
        electronSetup.renderOptionsDisplay.initializeRenderOptions) {
        electronSetup.renderOptionsDisplay.initializeRenderOptions();
    }
});
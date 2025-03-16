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
    videoAssemblyManager.handleRenderSegmentRequest(event.data.segmentSequence);
  }
  // Check if the message is a render scene request
  else if (event.data && event.data.type === 'render-scene') {
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
    const rawTab = document.querySelector('.tab:nth-child(6)');
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
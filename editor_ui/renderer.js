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

// DOM elements
const editorContent = document.getElementById('editor-content');
const tabs = document.querySelectorAll('.tab');
const tab1 = document.querySelector('.tab:nth-child(1)');

// Set up event listeners for Electron if available
if (electronSetup.isElectron && electronSetup.ipcRenderer) {
  // Listen for the 'video-assembly-opened' event from the main process
  electronSetup.ipcRenderer.on('video-assembly-opened', (event, data) => {
    videoAssemblyManager.handleVideoAssemblyData(data);
  });
  
  // Listen for the current file path from the main process
  electronSetup.ipcRenderer.on('current-file-path', (event, filePath) => {
    videoAssemblyManager.setCurrentVideoAssemblyPath(filePath);
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
});

// Expose the saveVideoAssemblyToFile function to the window object
// so it can be accessed from other modules
window.saveVideoAssemblyToFile = videoAssemblyManager.saveVideoAssemblyToFile;

// Expose the handleRenderButtonClick function to the window object
// so it can be accessed from the renderOptionsDisplay module
window.handleRenderButtonClick = renderProcessManager.handleRenderButtonClick;

// Initialize the UI
document.addEventListener('DOMContentLoaded', () => {
  console.log('Renderer process initialized');
  
  // Initialize tabs
  uiManager.initializeTabs();
  
  // Load and display installed plugins
  pluginManager.loadInstalledPlugins();
  
  // Initialize the resize handles
  uiManager.initializeResizeHandle(); // For explorer
  uiManager.initializeTerminalResizeHandle(); // For terminal
  
  // Initialize render options
  if (typeof electronSetup.renderOptionsDisplay !== 'undefined' && 
      electronSetup.renderOptionsDisplay.initializeRenderOptions) {
    electronSetup.renderOptionsDisplay.initializeRenderOptions();
  }
});
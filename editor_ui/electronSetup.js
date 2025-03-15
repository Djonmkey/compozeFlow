/**
 * electronSetup.js
 *
 * Handles environment detection, source map support installation,
 * and module loading for the application.
 */

// Check if we're running in Electron or a browser
const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';

// Initialize variables that would normally come from required modules
let ipcRenderer, fs, child_process, path, generateHtmlFromVideoAssembly, generateOverlayImagesHtml,
    generateMixedAudioHtml, generateGeneralHtml, generateOutputHtml, generateExplorerHtml, initializeExplorer,
    fileTabsDisplay, renderOptionsDisplay, switchExplorerMode;

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
    // Don't require outputDisplay here to avoid circular dependency
    // It will be loaded separately in renderer.js
    
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
    
    // Load the render options display module
    renderOptionsDisplay = require('./renderOptionsDisplay');
  } catch (error) {
    console.error('Error loading modules:', error);
  }
}

// Export the variables and functions
module.exports = {
  isElectron,
  ipcRenderer,
  fs,
  child_process,
  path,
  generateHtmlFromVideoAssembly,
  generateOverlayImagesHtml,
  generateMixedAudioHtml,
  generateGeneralHtml,
  // generateOutputHtml removed to avoid circular dependency
  generateExplorerHtml,
  initializeExplorer,
  switchExplorerMode,
  fileTabsDisplay,
  renderOptionsDisplay
};
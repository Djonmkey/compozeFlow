/**
 * fileTabs/index.js
 *
 * Main entry point for the fileTabs module.
 * Exports all functionality from the various submodules.
 */

// Install source map support for better debugging
try {
  require('source-map-support').install({
    handleUncaughtExceptions: true,
    environment: 'node',
    hookRequire: true
  });
  console.log('Source map support installed in fileTabs module');
} catch (error) {
  console.error('Failed to install source map support in fileTabs module:', error);
}

const fileTabsManager = require('./fileTabsManager');
const fileDetailsDisplay = require('./fileDetailsDisplay');
const fileTypeUtils = require('./fileTypeUtils');
const fileTimelineIntegration = require('./fileTimelineIntegration');
const fileOperationsUI = require('./fileOperationsUI');
const fileTabsStyles = require('./fileTabsStyles');

// Apply styles when the module is loaded
if (typeof window !== 'undefined') {
  fileTabsStyles.applyFileTabsStyles();
  
  // Expose functions to the global scope
  // so they can be accessed from inline onclick handlers
  window.copyToClipboard = fileOperationsUI.copyToClipboard;
  window.openFileInDefaultApp = fileOperationsUI.openFileInDefaultApp;
  window.toggleFileDismissStatus = fileOperationsUI.toggleFileDismissStatus;
}

// Export all functionality
module.exports = {
  // From fileTabsManager
  addFileTab: fileTabsManager.addFileTab,
  getCurrentFile: fileTabsManager.getCurrentFile,
  
  // From fileDetailsDisplay
  updateEditorContent: fileDetailsDisplay.updateEditorContent,
  clearEditorContent: fileDetailsDisplay.clearEditorContent,
  
  // From fileTypeUtils
  determineFileType: fileTypeUtils.determineFileType,
  formatDate: fileTypeUtils.formatDate,
  formatFileSize: fileTypeUtils.formatFileSize,
  
  // From fileTimelineIntegration
  addClipToTimeline: fileTimelineIntegration.addClipToTimeline,
  saveVideoAssemblyData: fileTimelineIntegration.saveVideoAssemblyData,
  switchToTimelineTab: fileTimelineIntegration.switchToTimelineTab,
  setCurrentVideoAssemblyData: fileTimelineIntegration.setCurrentVideoAssemblyData,
  getCurrentVideoAssemblyData: fileTimelineIntegration.getCurrentVideoAssemblyData,
  
  // From fileOperationsUI
  copyToClipboard: fileOperationsUI.copyToClipboard,
  openFileInDefaultApp: fileOperationsUI.openFileInDefaultApp,
  toggleFileDismissStatus: fileOperationsUI.toggleFileDismissStatus
};
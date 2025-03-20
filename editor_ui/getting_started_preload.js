/**
 * getting_started_preload.js
 * 
 * Preload script for the getting started page.
 * Exposes a minimal API to the renderer process.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI',
  {
    newVideoAssembly: () => ipcRenderer.send('getting-started-new-assembly'),
    openVideoAssembly: () => ipcRenderer.send('getting-started-open-assembly'),
    openExternalLink: (url) => ipcRenderer.send('open-external-link', url)
  }
);
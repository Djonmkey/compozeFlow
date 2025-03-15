/**
 * main.js
 * 
 * Entry point for the Electron app. Creates a browser window
 * and sets up the top-level application menu.
 */

const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Install source map support for better debugging
try {
  require('source-map-support').install({
    handleUncaughtExceptions: true,
    environment: 'node',
    hookRequire: true
  });
  console.log('Source map support installed successfully');
} catch (error) {
  console.error('Failed to install source map support:', error);
}

// Determine if we're in development or production mode
const isDev = process.env.NODE_ENV === 'development' || !fs.existsSync(path.join(__dirname, 'dist'));

// Set the base path for loading files
const basePath = isDev ? __dirname : path.join(__dirname, 'dist');

// Load fileOperations from the appropriate location
const fileOps = isDev ? require('./fileOperations') : require(path.join(basePath, 'fileOperations'));

console.log(`Running in ${isDev ? 'development' : 'production'} mode`);
console.log(`Base path: ${basePath}`);

// Store the current file path
let currentFilePath = null;

// Set the name BEFORE any other app code runs
app.name = 'compozeFlow'
// Or you can also use:
app.setName('compozeFlow')

// Keep a global reference of the window object, to prevent
// garbage collection from closing the window automatically.
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "compozeFlow",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Load the main HTML file from the appropriate location
  mainWindow.loadFile(path.join(basePath, 'index.html'));

  // Open DevTools automatically for debugging
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // { role: 'appMenu' } for macOS
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about', label: "About compozeFlow" },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),

    {
      label: 'File',
      submenu: [
        {
          label: 'New Video Assembly',
          click: () => {
            console.log("New Video Assembly Clicked");
          }
        },
        {
          label: 'Open Video Assembly',
          click: async () => {
            const result = await fileOps.openVideoAssembly(mainWindow);
            if (result) {
              currentFilePath = result.filePath;
              // Send the loaded content to the renderer process
              mainWindow.webContents.send('video-assembly-opened', result.content);
              // Also send the file path
              mainWindow.webContents.send('current-file-path', currentFilePath);
              console.log("Video assembly opened:", currentFilePath);
            }
          }
        },
        {
          label: 'Save Video Assembly',
          click: async () => {
            // Get the current content from the renderer process
            // For now, we'll use a placeholder object
            const content = { placeholder: "Video Assembly Data" };
            
            if (currentFilePath) {
              // Use existing path for Save
              await fileOps.saveVideoAssembly(mainWindow, content, currentFilePath);
              console.log("Video assembly saved to:", currentFilePath);
            } else {
              // No current file, behave like Save As
              const filePath = await fileOps.saveVideoAssembly(mainWindow, content);
              if (filePath) {
                currentFilePath = filePath;
                console.log("Video assembly saved to:", currentFilePath);
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Save Video Assembly As',
          click: async () => {
            // Get the current content from the renderer process
            // For now, we'll use a placeholder object
            const content = { placeholder: "Video Assembly Data" };
            
            // Always prompt for location with Save As
            const filePath = await fileOps.saveVideoAssembly(mainWindow, content);
            if (filePath) {
              currentFilePath = filePath;
              console.log("Video assembly saved to:", filePath);
            }
          }
        },
        {
          label: 'Save Video Assembly As Template',
          click: async () => {
            // Get the current content from the renderer process
            // For now, we'll use a placeholder object
            const content = { placeholder: "Video Assembly Data" };
            
            // Save as template
            const filePath = await fileOps.saveVideoAssemblyAsTemplate(mainWindow, content);
            if (filePath) {
              console.log("Video assembly template saved to:", filePath);
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            console.log("Help: Learn More clicked");
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    // On macOS, re-create a window if the dock icon is clicked
    // and no other windows are open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On non-macOS platforms, quit the app once all windows are closed.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Set up IPC handlers
ipcMain.handle('get-current-file-path', () => {
  return currentFilePath;
});

// Handle showing open folder dialog for content sources
ipcMain.handle('show-open-folder-dialog', async (event) => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Add Content Source',
      properties: ['openDirectory']
    });
    
    if (canceled || filePaths.length === 0) {
      console.log('Folder selection was canceled');
      return { canceled: true };
    }
    
    return { canceled: false, folderPath: filePaths[0] };
  } catch (error) {
    console.error('Error showing open folder dialog:', error);
    return { canceled: true, error: error.message };
  }
});

// Handle showing open folder dialog for output paths
ipcMain.handle('show-output-path-dialog', async (event, title = 'Select Output Path') => {
  try {
    console.log('Showing output path dialog with title:', title);
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: title,
      properties: ['openDirectory', 'createDirectory']
    });
    
    if (canceled || filePaths.length === 0) {
      console.log('Output path selection was canceled');
      return { canceled: true };
    }
    
    console.log('Selected output path:', filePaths[0]);
    return { canceled: false, folderPath: filePaths[0] };
  } catch (error) {
    console.error('Error showing output path dialog:', error);
    return { canceled: true, error: error.message };
  }
});

// Handle saving video assembly data
ipcMain.handle('save-video-assembly-data', async (event, videoAssemblyData) => {
  if (!currentFilePath) {
    // If no current file path, prompt for a location
    const filePath = await fileOps.saveVideoAssembly(mainWindow, videoAssemblyData);
    if (filePath) {
      currentFilePath = filePath;
      console.log("Video assembly saved to:", currentFilePath);
      return { success: true, filePath: currentFilePath };
    } else {
      console.log("Save was canceled");
      return { success: false, error: "Save was canceled" };
    }
  } else {
    // Use existing path for Save
    try {
      await fileOps.saveVideoAssembly(mainWindow, videoAssemblyData, currentFilePath);
      console.log("Video assembly saved to:", currentFilePath);
      return { success: true, filePath: currentFilePath };
    } catch (error) {
      console.error("Error saving video assembly:", error);
      return { success: false, error: error.message };
    }
  }
});

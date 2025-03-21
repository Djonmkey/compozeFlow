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

// Keep a global reference of the main window object, to prevent
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

// Store references to menu items that need to be updated
let saveMenuItem;
let saveAsMenuItem;
let saveAsTemplateMenuItem;

// Function to update menu items based on whether there's an active file
function updateMenuItems() {
  const hasActiveFile = currentFilePath !== null;
  
  // Update menu items
  if (saveMenuItem) saveMenuItem.enabled = hasActiveFile;
  if (saveAsMenuItem) saveAsMenuItem.enabled = hasActiveFile;
  if (saveAsTemplateMenuItem) saveAsTemplateMenuItem.enabled = hasActiveFile;
  
  // Notify the renderer process about the file state change
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('file-state-changed', { hasActiveFile });
  }
  
  console.log(`Menu items updated. Active file: ${hasActiveFile ? 'Yes' : 'No'}`);
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
          click: async () => {
            try {
              // Get list of available templates with metadata
              const templates = fileOps.listTemplatesWithMetadata();
              
              if (templates.length === 0) {
                dialog.showMessageBox(mainWindow, {
                  type: 'error',
                  title: 'No Templates Available',
                  message: 'No templates are available. Please create a template first.'
                });
                return;
              }
              
              // Create a new browser window for the template selector
              const templateSelectorWindow = new BrowserWindow({
                parent: mainWindow,
                modal: true,
                width: 500,
                height: 450,
                resizable: false,
                minimizable: false,
                maximizable: false,
                webPreferences: {
                  nodeIntegration: true,
                  contextIsolation: false
                }
              });
              
              // Load the template selector HTML file
              templateSelectorWindow.loadFile(path.join(__dirname, 'template_selector.html'));
              
              // Hide the menu bar
              templateSelectorWindow.setMenuBarVisibility(false);
              
              // Handle template data request
              ipcMain.once('get-templates', (event) => {
                event.sender.send('templates-data', templates);
              });
              
              // Handle cancel button
              ipcMain.once('template-dialog-canceled', () => {
                templateSelectorWindow.close();
              });
              
              // Handle save button
              ipcMain.once('template-dialog-save', async (event, data) => {
                const selectedTemplate = templates[data.templateIndex];
                console.log(`Selected template: ${selectedTemplate.name}`);
                
                // Close the window before async operations but after getting the data we need
                templateSelectorWindow.close();
                
                try {
                  // Read the template file
                  const templateContent = fs.readFileSync(selectedTemplate.path, 'utf-8');
                  const template = JSON.parse(templateContent);
                  
                  // Update the template with the provided metadata
                  if (template.cut) {
                    // Set title to user-defined value, but clear subtitle and description
                    template.cut.title = data.title || template.cut.title || '';
                    template.cut.subtitle = ''; // Always clear
                    template.cut.description = ''; // Always clear
                  } else {
                    // If the template doesn't have a cut property, create a basic structure
                    template.cut = {
                      title: data.title || '',
                      subtitle: '',
                      description: '',
                      segments: []
                    };
                  }
                  
                  // Load the template as the active video assembly but with no file path
                  currentFilePath = null; // Clear the path to prevent editing the template
                  
                  // Send the loaded content to the renderer process
                  mainWindow.webContents.send('video-assembly-opened', template);
                  // Also send the file path (null)
                  mainWindow.webContents.send('current-file-path', currentFilePath);
                  console.log("Template loaded as new video assembly");
                  
                  // Update menu items after setting currentFilePath
                  updateMenuItems();
                  
                  // Programmatically trigger "Save Video Assembly As" from the file menu
                  setTimeout(() => {
                    const fileMenu = Menu.getApplicationMenu().items.find(item => item.label === 'File');
                    if (fileMenu && fileMenu.submenu) {
                      const saveAsMenuItem = fileMenu.submenu.items.find(item => item.label === 'Save Video Assembly As');
                      if (saveAsMenuItem && saveAsMenuItem.click) {
                        saveAsMenuItem.click();
                      }
                    }
                  }, 500); // Small delay to ensure UI is updated
                  
                } catch (error) {
                  console.error("Error creating video assembly from template:", error);
                  dialog.showErrorBox(
                    'Error Creating Video Assembly',
                    `An error occurred: ${error.message}`
                  );
                }
              });
              
            } catch (error) {
              console.error('Error creating new video assembly:', error);
              dialog.showErrorBox(
                'Error Creating Video Assembly',
                `An error occurred: ${error.message}`
              );
            }
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
              // Update menu items after setting currentFilePath
              updateMenuItems();
            }
          }
        },
        {
          label: 'Save Video Assembly',
          enabled: false, // Initially disabled
          click: async () => {
            try {
              // Check if we have a current file path
              if (!currentFilePath) {
                console.log("No file path, redirecting to Save As...");
                
                // Programmatically trigger "Save Video Assembly As" from the file menu
                const fileMenu = Menu.getApplicationMenu().items.find(item => item.label === 'File');
                if (fileMenu && fileMenu.submenu) {
                  const saveAsMenuItem = fileMenu.submenu.items.find(item => item.label === 'Save Video Assembly As');
                  if (saveAsMenuItem && saveAsMenuItem.click) {
                    saveAsMenuItem.click();
                    return;
                  }
                }
                
                // Fallback if menu item not found
                dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: 'Save As Required',
                  message: 'Please save this video assembly with a file name.'
                });
                return;
              }
              
              // Get the current content from the renderer
              mainWindow.webContents.send('request-current-content');
              
              // Set up a one-time listener for the response
              ipcMain.once('current-content-response', async (event, content) => {
                try {
                  // Use existing path for Save
                  await fileOps.saveVideoAssembly(mainWindow, content, currentFilePath);
                  console.log("Video assembly saved to:", currentFilePath);
                } catch (error) {
                  console.error("Error saving file:", error);
                  dialog.showErrorBox(
                    'Error Saving File',
                    `An error occurred: ${error.message}`
                  );
                }
              });
            } catch (error) {
              console.error("Error in Save Video Assembly:", error);
              dialog.showErrorBox(
                'Error Saving File',
                `An error occurred: ${error.message}`
              );
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Save Video Assembly As',
          enabled: false, // Initially disabled
          click: async () => {
            try {
              // Get the current content from the renderer
              mainWindow.webContents.send('request-current-content');
              
              // Set up a one-time listener for the response
              ipcMain.once('current-content-response', async (event, content) => {
                try {
                  if (!content) {
                    dialog.showMessageBox(mainWindow, {
                      type: 'error',
                      title: 'Error',
                      message: 'No video assembly content is available to save.'
                    });
                    return;
                  }
                  
                  // Save with a new name/location
                  const filePath = await fileOps.saveVideoAssembly(mainWindow, content);
                  if (filePath) {
                    currentFilePath = filePath;
                    console.log("Video assembly saved to:", filePath);
                    
                    // Send the current file path to the renderer process
                    mainWindow.webContents.send('current-file-path', currentFilePath);
                    
                    updateMenuItems(); // Update menu items after setting currentFilePath
                  }
                } catch (error) {
                  console.error("Error saving file:", error);
                  dialog.showErrorBox(
                    'Error Saving File',
                    `An error occurred: ${error.message}`
                  );
                }
              });
            } catch (error) {
              console.error("Error in Save Video Assembly As:", error);
              dialog.showErrorBox(
                'Error Saving File',
                `An error occurred: ${error.message}`
              );
            }
          }
        },
        {
          label: 'Save Video Assembly As Template',
          enabled: false, // Initially disabled
          click: async () => {
            try {
              // Get the current content from the renderer
              mainWindow.webContents.send('request-current-content');
              
              // Set up a one-time listener for the response
              ipcMain.once('current-content-response', async (event, content) => {
                try {
                  if (!content) {
                    dialog.showMessageBox(mainWindow, {
                      type: 'error',
                      title: 'Error',
                      message: 'No video assembly content is available to save as template.'
                    });
                    return;
                  }
                  
                  // Save as template
                  const filePath = await fileOps.saveVideoAssemblyAsTemplate(mainWindow, content);
                  if (filePath) {
                    console.log("Video assembly template saved to:", filePath);
                  }
                } catch (error) {
                  console.error("Error saving template:", error);
                  dialog.showErrorBox(
                    'Error Saving Template',
                    `An error occurred: ${error.message}`
                  );
                }
              });
            } catch (error) {
              console.error("Error saving video assembly as template:", error);
              dialog.showErrorBox(
                'Error Saving Template',
                `An error occurred: ${error.message}`
              );
            }
          }
        },
        { type: 'separator' },
        { role: 'quit' }
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
  
  // Store references to menu items that need to be updated
  const fileMenu = menu.items.find(item => item.label === 'File');
  if (fileMenu && fileMenu.submenu) {
    saveMenuItem = fileMenu.submenu.items.find(item => item.label === 'Save Video Assembly');
    saveAsMenuItem = fileMenu.submenu.items.find(item => item.label === 'Save Video Assembly As');
    saveAsTemplateMenuItem = fileMenu.submenu.items.find(item => item.label === 'Save Video Assembly As Template');
    
    // Initialize menu items based on current state
    updateMenuItems();
  }
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

// Handle showing open file dialog for clip selection
ipcMain.handle('show-open-file-dialog', async (event, filters = []) => {
  try {
    console.log('Showing open file dialog for clip selection');
    
    // If no filters provided, use default ones
    if (!filters || filters.length === 0) {
      filters = [
        { name: 'Media Files', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'jpg', 'jpeg', 'png', 'gif'] },
        { name: 'All Files', extensions: ['*'] }
      ];
    }
    
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Media File',
      filters: filters,
      properties: ['openFile']
    });
    
    if (canceled || filePaths.length === 0) {
      console.log('File selection was canceled');
      return { canceled: true };
    }
    
    console.log('Selected file path:', filePaths[0]);
    return { canceled: false, filePath: filePaths[0] };
  } catch (error) {
    console.error('Error showing open file dialog:', error);
    return { canceled: true, error: error.message };
  }
});

// Handle saving video assembly data
ipcMain.handle('save-video-assembly-data', async (event, videoAssemblyData) => {
  try {
    if (!currentFilePath) {
      // If no current file path, prompt for a location
      const filePath = await fileOps.saveVideoAssembly(mainWindow, videoAssemblyData);
      if (filePath) {
        currentFilePath = filePath;
        console.log("Video assembly saved to:", currentFilePath);
        
        // Send the current file path to the renderer process
        mainWindow.webContents.send('current-file-path', currentFilePath);
        
        // Update menu items after setting currentFilePath
        updateMenuItems();
        
        return { success: true, filePath: currentFilePath };
      } else {
        console.log("Save was canceled");
        return { success: false, error: "Save was canceled" };
      }
    } else {
      // Use existing path for Save
      await fileOps.saveVideoAssembly(mainWindow, videoAssemblyData, currentFilePath);
      console.log("Video assembly saved to:", currentFilePath);
      return { success: true, filePath: currentFilePath };
    }
  } catch (error) {
    console.error("Error saving video assembly:", error);
    dialog.showErrorBox(
      'Error Saving File',
      `An error occurred: ${error.message}`
    );
    return { success: false, error: error.message };
  }
});

// Handle menu actions from the renderer process
ipcMain.on('menu-action', (event, action) => {
  const fileMenu = Menu.getApplicationMenu().items.find(item => item.label === 'File');
  if (fileMenu && fileMenu.submenu) {
    if (action === 'new-video-assembly') {
      const newAssemblyItem = fileMenu.submenu.items.find(item => item.label === 'New Video Assembly');
      if (newAssemblyItem && newAssemblyItem.click) {
        newAssemblyItem.click();
      }
    } else if (action === 'open-video-assembly') {
      const openAssemblyItem = fileMenu.submenu.items.find(item => item.label === 'Open Video Assembly');
      if (openAssemblyItem && openAssemblyItem.click) {
        openAssemblyItem.click();
      }
    }
  }
});

// Handle opening external links
ipcMain.on('open-external-link', (event, url) => {
  // Check if the URL is a file path (starts with 'file://')
  if (url.startsWith('file://')) {
    // Extract the file path from the URL
    const filePath = url.replace('file://', '');
    // Open the file with the default application
    require('electron').shell.openPath(filePath).catch(err => {
      console.error('Failed to open file:', err);
    });
  } else {
    // Open external URL in default browser
    require('electron').shell.openExternal(url).catch(err => {
      console.error('Failed to open external link:', err);
    });
  }
});

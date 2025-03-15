/**
 * videoAssemblyManager.js
 *
 * Handles video assembly data management and file operations.
 */

// Import required modules
const electronSetup = require('./electronSetup');
const uiManager = require('./uiManager');

// Store the current video assembly data and file path
let currentVideoAssemblyData = null;
let currentVideoAssemblyPath = null;

/**
 * Function to save video assembly data to a file
 * @param {string} filePath - The path to save the file to
 * @param {Object} data - The video assembly data to save
 * @returns {boolean} - Whether the save was successful
 */
function saveVideoAssemblyToFile(filePath, data) {
  // Only try to save if we're in Electron and have fs
  if (!electronSetup.isElectron || !electronSetup.fs) {
    console.error('Cannot save file in browser mode');
    return false;
  }
  
  try {
    // Convert data to JSON string
    const jsonContent = JSON.stringify(data, null, 4);
    
    // Write to file
    electronSetup.fs.writeFileSync(filePath, jsonContent, 'utf-8');
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Video assembly saved with updated data</p>`;
    
    console.log(`File saved to: ${filePath}`);
    return true;
  } catch (error) {
    console.error('Error saving file:', error);
    
    // Update the terminal with an error message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Error saving file: ${error.message}</p>`;
    return false;
  }
}

/**
 * Function to handle title updates
 * @param {string} newTitle - The new title
 */
function handleTitleUpdate(newTitle) {
  // Update the title in the current data
  if (currentVideoAssemblyData && currentVideoAssemblyData.cut) {
    currentVideoAssemblyData.cut.title = newTitle;
    
    // Update the application title
    document.title = `compozeFlow - ${newTitle}`;
    
    // Only try to save if we're in Electron
    if (electronSetup.isElectron && electronSetup.ipcRenderer) {
      // Get the current file path from the main process
      electronSetup.ipcRenderer.invoke('get-current-file-path').then((filePath) => {
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

/**
 * Function to handle subtitle updates
 * @param {string} newSubtitle - The new subtitle
 */
function handleSubtitleUpdate(newSubtitle) {
  // Update the subtitle in the current data
  if (currentVideoAssemblyData && currentVideoAssemblyData.cut) {
    currentVideoAssemblyData.cut.subtitle = newSubtitle;
    
    // Only try to save if we're in Electron
    if (electronSetup.isElectron && electronSetup.ipcRenderer) {
      // Get the current file path from the main process
      electronSetup.ipcRenderer.invoke('get-current-file-path').then((filePath) => {
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

/**
 * Function to handle render segment requests
 * @param {number} segmentSequence - The sequence number of the segment to render
 */
function handleRenderSegmentRequest(segmentSequence) {
  // Update the video assembly data to render only this segment
  if (currentVideoAssemblyData) {
    // Create this_run_only if it doesn't exist
    if (!currentVideoAssemblyData.this_run_only) {
      currentVideoAssemblyData.this_run_only = {};
    }
    
    // Set render_only to target this specific segment
    currentVideoAssemblyData.this_run_only.render_only = {
      segment_sequence: segmentSequence
    };
    
    // Only try to save if we're in Electron
    if (electronSetup.isElectron && electronSetup.ipcRenderer && currentVideoAssemblyPath) {
      // Save the updated data to the file
      saveVideoAssemblyToFile(currentVideoAssemblyPath, currentVideoAssemblyData);
      
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Set to render only segment with sequence ${segmentSequence}</p>`;
      
      // Trigger the render process
      if (window.handleRenderButtonClick) {
        window.handleRenderButtonClick();
      }
    } else {
      // In browser mode, just log the change
      console.log('Would render segment:', segmentSequence);
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Would render segment with sequence ${segmentSequence} (not available in browser mode)</p>`;
    }
  }
}

/**
 * Function to handle render scene requests
 * @param {number} segmentSequence - The sequence number of the segment containing the scene
 * @param {number} sceneSequence - The sequence number of the scene to render
 */
function handleRenderSceneRequest(segmentSequence, sceneSequence) {
  // Update the video assembly data to render only this scene
  if (currentVideoAssemblyData) {
    // Create this_run_only if it doesn't exist
    if (!currentVideoAssemblyData.this_run_only) {
      currentVideoAssemblyData.this_run_only = {};
    }
    
    // Set render_only to target this specific scene within the segment
    currentVideoAssemblyData.this_run_only.render_only = {
      segment_sequence: segmentSequence,
      scene_sequence: sceneSequence
    };
    
    // Only try to save if we're in Electron
    if (electronSetup.isElectron && electronSetup.ipcRenderer && currentVideoAssemblyPath) {
      // Save the updated data to the file
      saveVideoAssemblyToFile(currentVideoAssemblyPath, currentVideoAssemblyData);
      
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Set to render only scene with sequence ${sceneSequence} in segment ${segmentSequence}</p>`;
      
      // Trigger the render process
      if (window.handleRenderButtonClick) {
        window.handleRenderButtonClick();
      }
    } else {
      // In browser mode, just log the change
      console.log('Would render scene:', sceneSequence, 'in segment:', segmentSequence);
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Would render scene with sequence ${sceneSequence} in segment ${segmentSequence} (not available in browser mode)</p>`;
    }
  }
}

/**
 * Function to handle saving output paths
 * @param {Object} outputPaths - The output paths to save
 */
function handleSaveOutputPaths(outputPaths) {
  // Update the output paths in the current data
  if (currentVideoAssemblyData && currentVideoAssemblyData.cut) {
    // Ensure render_output exists
    if (!currentVideoAssemblyData.cut.render_output) {
      currentVideoAssemblyData.cut.render_output = {};
    }
    
    // Update the output paths
    currentVideoAssemblyData.cut.render_output.output_paths = outputPaths;
    
    // Only try to save if we're in Electron
    if (electronSetup.isElectron && electronSetup.ipcRenderer && currentVideoAssemblyPath) {
      // Save the updated data to the file
      saveVideoAssemblyToFile(currentVideoAssemblyPath, currentVideoAssemblyData);
      
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Output paths updated and saved</p>`;
    } else {
      // In browser mode, just log the change
      console.log('Output paths updated:', outputPaths);
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Output paths updated (changes not saved in browser mode)</p>`;
    }
  }
}

/**
 * Function to handle saving high quality render settings
 * @param {Object} settings - The high quality render settings to save
 */
function handleSaveHighQualitySettings(settings) {
  // Update the high quality render settings in the current data
  if (currentVideoAssemblyData && currentVideoAssemblyData.cut) {
    // Ensure render_output exists
    if (!currentVideoAssemblyData.cut.render_output) {
      currentVideoAssemblyData.cut.render_output = {};
    }
    
    // Update the high quality render settings
    currentVideoAssemblyData.cut.render_output.high_quality_render = settings;
    
    // Only try to save if we're in Electron
    if (electronSetup.isElectron && electronSetup.ipcRenderer && currentVideoAssemblyPath) {
      // Save the updated data to the file
      saveVideoAssemblyToFile(currentVideoAssemblyPath, currentVideoAssemblyData);
      
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>High quality render settings updated and saved</p>`;
    } else {
      // In browser mode, just log the change
      console.log('High quality render settings updated:', settings);
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>High quality render settings updated (changes not saved in browser mode)</p>`;
    }
  }
}

/**
 * Function to handle saving quick render settings
 * @param {Object} settings - The quick render settings to save
 */
function handleSaveQuickRenderSettings(settings) {
  // Update the quick render settings in the current data
  if (currentVideoAssemblyData && currentVideoAssemblyData.cut) {
    // Ensure render_output exists
    if (!currentVideoAssemblyData.cut.render_output) {
      currentVideoAssemblyData.cut.render_output = {};
    }
    
    // Update the quick render settings
    currentVideoAssemblyData.cut.render_output.quick_render = settings;
    
    // Only try to save if we're in Electron
    if (electronSetup.isElectron && electronSetup.ipcRenderer && currentVideoAssemblyPath) {
      // Save the updated data to the file
      saveVideoAssemblyToFile(currentVideoAssemblyPath, currentVideoAssemblyData);
      
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Quick render settings updated and saved</p>`;
    } else {
      // In browser mode, just log the change
      console.log('Quick render settings updated:', settings);
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Quick render settings updated (changes not saved in browser mode)</p>`;
    }
  }
}

/**
 * Function to handle video assembly data received from the main process
 * @param {Object} data - The video assembly data
 */
function handleVideoAssemblyData(data) {
  console.log('Received video assembly data:', data);
  
  // Store the current data
  currentVideoAssemblyData = data;
  
  // Make it available globally
  window.currentVideoAssemblyData = data;
  
  // Update the application title with the video assembly title
  if (data && data.cut && data.cut.title) {
    document.title = `compozeFlow - ${data.cut.title}`;
  } else {
    document.title = 'compozeFlow';
  }
  
  // Set Timeline tab as active
  uiManager.setActiveTab('Timeline');
  
  // Update the editor content based on the active tab
  uiManager.updateEditorContent(data);
  
  // Update the explorer with content sources
  uiManager.updateExplorer(data);
  
  // Update the render options with the video assembly data
  if (electronSetup.isElectron && electronSetup.ipcRenderer) {
    if (typeof electronSetup.renderOptionsDisplay !== 'undefined' && 
        electronSetup.renderOptionsDisplay.updateRenderOptions) {
      // Get the current file path from the main process
      electronSetup.ipcRenderer.invoke('get-current-file-path').then((filePath) => {
        if (filePath) {
          // Store the current file path
          currentVideoAssemblyPath = filePath;
          // Update render options
          electronSetup.renderOptionsDisplay.updateRenderOptions(data, filePath);
        }
      });
    }
  }
  
  // Update the terminal with a message
  const terminal = document.getElementById('terminal');
  terminal.innerHTML += `<p>Video assembly loaded and displayed in Timeline tab</p>`;
}

// Export the functions and variables
module.exports = {
  getCurrentVideoAssemblyData: () => currentVideoAssemblyData,
  getCurrentVideoAssemblyPath: () => currentVideoAssemblyPath,
  setCurrentVideoAssemblyPath: (path) => { currentVideoAssemblyPath = path; },
  saveVideoAssemblyToFile,
  handleTitleUpdate,
  handleSubtitleUpdate,
  handleRenderSegmentRequest,
  handleRenderSceneRequest,
  handleSaveOutputPaths,
  handleSaveHighQualitySettings,
  handleSaveQuickRenderSettings,
  handleVideoAssemblyData
};
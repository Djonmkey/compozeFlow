/**
 * uiManager.js
 *
 * Handles UI tab management, content updating, and resize handle functionality.
 */

// Import required modules
const electronSetup = require('./electronSetup');
const generateOutputHtml = require('./outputDisplay');

// Keep track of the currently active tab
let activeTab = 'Timeline';

/**
 * Function to update the editor content based on the active tab
 * @param {Object} currentVideoAssemblyData - The current video assembly data
 */
function updateEditorContent(currentVideoAssemblyData) {
  if (!currentVideoAssemblyData) return;
  
  const editorContent = document.getElementById('editor-content');
  let htmlContent = '';
  
  if (activeTab === 'Timeline') {
    htmlContent = electronSetup.generateHtmlFromVideoAssembly(currentVideoAssemblyData);
  } else if (activeTab === 'Overlay Images') {
    htmlContent = electronSetup.generateOverlayImagesHtml(currentVideoAssemblyData);
  } else if (activeTab === 'Mixed Audio') {
    htmlContent = electronSetup.generateMixedAudioHtml(currentVideoAssemblyData);
  } else if (activeTab === 'Output') {
    htmlContent = generateOutputHtml(currentVideoAssemblyData);
  } else if (activeTab === 'General') {
    htmlContent = electronSetup.generateGeneralHtml(currentVideoAssemblyData);
  } else if (activeTab === 'Render') {
    // Use the render tab display module
    const renderTabDisplay = require('./renderTabDisplay');
    htmlContent = renderTabDisplay.generateRenderTabHtml();
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

/**
 * Function to initialize tab click handlers
 */
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab styling
      tabs.forEach(t => {
        if (t.textContent === tab.textContent) {
          t.style.backgroundColor = '#ddd';
          t.style.fontWeight = 'bold';
          t.classList.add('active');
        } else {
          t.style.backgroundColor = '';
          t.style.fontWeight = 'normal';
          t.classList.remove('active');
        }
      });
      
      activeTab = tab.textContent;
      updateEditorContent(window.currentVideoAssemblyData);
      
      // If we're clicking on a tab other than File, update the File tab appearance
      if (tab.textContent !== 'File' && tab.className.indexOf('file-tab') === -1) {
        // Check if the fileTabsManager module is available
        try {
          const fileTabsModule = require('./fileTabs');
          if (fileTabsModule && typeof fileTabsModule.setFileTabActive === 'function') {
            fileTabsModule.setFileTabActive(false);
          }
        } catch (error) {
          console.log('File tabs module not available:', error);
        }
      }
    });
  });
}

/**
 * Function to update the explorer with content sources from the video assembly
 * @param {Object} currentVideoAssemblyData - The current video assembly data
 */
function updateExplorer(currentVideoAssemblyData) {
  if (!currentVideoAssemblyData) return;
  
  const explorer = document.getElementById('explorer');
  
  // Only use generateExplorerHtml if it's available (in Electron)
  if (typeof electronSetup.generateExplorerHtml === 'function') {
    // Generate the explorer HTML
    const explorerHtml = electronSetup.generateExplorerHtml(currentVideoAssemblyData);
    
    // Update the explorer content
    explorer.innerHTML = explorerHtml;
    
    // Initialize explorer event handlers
    if (typeof electronSetup.initializeExplorer === 'function') {
      electronSetup.initializeExplorer(currentVideoAssemblyData);
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

/**
 * Function to initialize the resize handle for the explorer section
 * Improved version with better mouse tracking and smoother resizing
 */
function initializeResizeHandle() {
  const resizeHandle = document.getElementById('resize-handle');
  const explorer = document.getElementById('explorer');
  const app = document.getElementById('app');
  
  let isResizing = false;
  
  // Update the resize handle position to match the explorer width
  function updateResizeHandlePosition() {
    // Position the handle at the right edge of the explorer
    // Subtract the width of the handle (8px) to align it with the right edge
    resizeHandle.style.left = `${explorer.offsetWidth + 42}px`;
  }
  
  // Initialize the resize handle position
  updateResizeHandlePosition();
  
  // Calculate max width as 50% of the window width
  function getMaxWidth() {
    return Math.max(500, window.innerWidth * 0.5);
  }
  
  // Start resize function
  function startResize(e) {
    isResizing = true;
    
    // Store initial mouse position and explorer width
    const initialX = e.clientX;
    const initialWidth = explorer.offsetWidth;
    
    // Add a class to the body to indicate resizing is in progress
    document.body.classList.add('resizing');
    
    // Prevent text selection during resize
    e.preventDefault();
    
    // Define the resize function
    function resize(e) {
      if (!isResizing) return;
      
      // Calculate the new width based on mouse movement
      const newWidth = initialWidth + (e.clientX - initialX);
      
      // Apply min and max constraints
      const minWidth = 150;
      const maxWidth = getMaxWidth();
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      // Update the explorer width
      explorer.style.width = `${constrainedWidth}px`;
      
      // Update the resize handle position
      updateResizeHandlePosition();
    }
    
    // Define the stop resize function
    function stopResize() {
      if (!isResizing) return;
      
      // Reset the resizing flag
      isResizing = false;
      
      // Remove the resizing class from the body
      document.body.classList.remove('resizing');
      
      // Remove the event listeners
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
      
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Explorer width adjusted to ${explorer.offsetWidth}px</p>`;
    }
    
    // Add event listeners for resize and stop resize
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    
    // Also add a blur event listener to stop resizing if the window loses focus
    window.addEventListener('blur', stopResize, { once: true });
  }
  
  // Add the mousedown event listener to the resize handle
  resizeHandle.addEventListener('mousedown', startResize);
  
  // Handle window resize to ensure the resize handle stays in the correct position
  window.addEventListener('resize', () => {
    updateResizeHandlePosition();
  });
}

/**
 * Function to initialize the resize handle for the terminal section
 * Improved version with better mouse tracking and smoother resizing
 */
function initializeTerminalResizeHandle() {
  const resizeHandle = document.getElementById('terminal-resize-handle');
  const terminal = document.getElementById('terminal');
  const editorContent = document.getElementById('editor-content');
  
  let isResizing = false;
  
  // Start resize function
  function startResize(e) {
    isResizing = true;
    
    // Store initial mouse position and terminal height
    const initialY = e.clientY;
    const initialHeight = terminal.offsetHeight;
    
    // Add a class to the body to indicate resizing is in progress
    document.body.classList.add('resizing');
    
    // Prevent text selection during resize
    e.preventDefault();
    
    // Define the resize function
    function resize(e) {
      if (!isResizing) return;
      
      // Calculate the new height based on mouse movement (moving up decreases terminal height)
      const newHeight = initialHeight - (e.clientY - initialY);
      
      // Apply min and max constraints
      const minHeight = 50;
      const maxHeight = window.innerHeight * 0.8; // 80% of viewport height
      const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      
      // Update the terminal height
      terminal.style.height = `${constrainedHeight}px`;
    }
    
    // Define the stop resize function
    function stopResize() {
      if (!isResizing) return;
      
      // Reset the resizing flag
      isResizing = false;
      
      // Remove the resizing class from the body
      document.body.classList.remove('resizing');
      
      // Remove the event listeners
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
      
      // Update the terminal with a message
      terminal.innerHTML += `<p>Terminal height adjusted to ${terminal.offsetHeight}px</p>`;
      
      // Auto-scroll to bottom
      terminal.scrollTop = terminal.scrollHeight;
    }
    
    // Add event listeners for resize and stop resize
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    
    // Also add a blur event listener to stop resizing if the window loses focus
    window.addEventListener('blur', stopResize, { once: true });
  }
  
  // Add the mousedown event listener to the resize handle
  resizeHandle.addEventListener('mousedown', startResize);
}

/**
 * Function to set the active tab
 * @param {string} tabName - The name of the tab to set as active
 */
function setActiveTab(tabName) {
  const tabs = document.querySelectorAll('.tab');
  
  tabs.forEach(tab => {
    tab.style.backgroundColor = tab.textContent === tabName ? '#ddd' : '';
    tab.style.fontWeight = tab.textContent === tabName ? 'bold' : 'normal';
  });
  
  activeTab = tabName;
  updateEditorContent(window.currentVideoAssemblyData);
  
  // If we're switching to a tab other than File, update the File tab appearance
  if (tabName !== 'File') {
    // Check if the fileTabsManager module is available
    const fileTabsModule = require('./fileTabs');
    if (fileTabsModule && typeof fileTabsModule.setFileTabActive === 'function') {
      fileTabsModule.setFileTabActive(false);
    }
  }
}

// Export the functions
module.exports = {
  updateEditorContent,
  initializeTabs,
  updateExplorer,
  initializeResizeHandle,
  initializeTerminalResizeHandle,
  setActiveTab,
  getActiveTab: () => activeTab
};
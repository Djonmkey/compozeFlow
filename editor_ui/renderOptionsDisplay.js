/**
 * renderOptionsDisplay.js
 *
 * Handles the display and functionality of render options above the tab bar.
 * Provides controls for render quality, watermarking, and caching options.
 *
 * @sourceMappingURL=renderOptionsDisplay.js.map
 */

const fs = require('fs');

// Install source map support for better debugging
try {
  require('source-map-support').install({
    handleUncaughtExceptions: true,
    environment: 'node',
    hookRequire: true
  });
  console.log('Source map support installed in renderOptionsDisplay');
} catch (error) {
  console.error('Failed to install source map support in renderOptionsDisplay:', error);
}

// Store the current video assembly data
let currentVideoAssemblyData = null;
let currentVideoAssemblyPath = null;

/**
 * Initializes the render options display
 * Creates the UI elements and sets up event handlers
 */
function initializeRenderOptions() {
  // Create the render options container if it doesn't exist
  if (!document.getElementById('render-options-container')) {
    createRenderOptionsUI();
  }
  
  // Hide the render options initially until a video assembly is loaded
  const renderOptionsContainer = document.getElementById('render-options-container');
  renderOptionsContainer.style.display = 'none';
}

/**
 * Creates the render options UI elements
 */
function createRenderOptionsUI() {
  // Create the container for render options
  const renderOptionsContainer = document.createElement('div');
  renderOptionsContainer.id = 'render-options-container';
  
  // Create the render options content
  renderOptionsContainer.innerHTML = `
    <div class="render-options-header">
      <h3>Render Options</h3>
    </div>
    <div class="render-options-content">
      <div class="render-option">
        <label class="render-quality-label">Render Quality:</label>
        <div class="toggle-switch">
          <input type="checkbox" id="render-quality-toggle" class="toggle-input">
          <label for="render-quality-toggle" class="toggle-label">
            <span class="toggle-inner" data-on="High Quality" data-off="Quick Render"></span>
            <span class="toggle-switch-handle"></span>
          </label>
        </div>
      </div>
      
      <div class="render-option">
        <input type="checkbox" id="watermark-checkbox" class="render-checkbox">
        <label for="watermark-checkbox">Include Source File Watermark</label>
      </div>
      
      <div class="render-option">
        <input type="checkbox" id="individual-clips-checkbox" class="render-checkbox">
        <label for="individual-clips-checkbox">Render Each Clip Individually (Slow)</label>
      </div>
      
      <div class="render-option">
        <input type="checkbox" id="caching-checkbox" class="render-checkbox" checked>
        <label for="caching-checkbox">Enable Render Caching</label>
      </div>
    </div>
  `;
  
  // Insert the render options container before the tabs container
  const tabsContainer = document.getElementById('tabs-container');
  tabsContainer.parentNode.insertBefore(renderOptionsContainer, tabsContainer);
  
  // Add event listeners for the render options
  addRenderOptionsEventListeners();
  
  // Add CSS for render options
  addRenderOptionsStyles();
}

/**
 * Adds event listeners to the render options UI elements
 */
function addRenderOptionsEventListeners() {
  // Quality toggle (High Quality / Quick Render)
  const qualityToggle = document.getElementById('render-quality-toggle');
  qualityToggle.addEventListener('change', () => {
    if (!currentVideoAssemblyData) return;
    
    // Update the quick_and_dirty flag (true = Quick Render, false = High Quality)
    // The toggle is reversed: checked = High Quality (quick_and_dirty = false)
    const isHighQuality = qualityToggle.checked;
    
    // Ensure the settings object exists
    ensureSettingsExist();
    
    // Update the flag
    currentVideoAssemblyData['composeflow.org'].settings.quick_and_dirty = !isHighQuality;
    
    // Save the changes
    saveVideoAssemblyData();
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Render quality set to ${isHighQuality ? 'High Quality' : 'Quick Render'}</p>`;
  });
  
  // Watermark checkbox
  const watermarkCheckbox = document.getElementById('watermark-checkbox');
  watermarkCheckbox.addEventListener('change', () => {
    if (!currentVideoAssemblyData) return;
    
    // Ensure the settings object exists
    ensureSettingsExist();
    
    // Update the source_file_watermark flag
    currentVideoAssemblyData['composeflow.org'].settings.source_file_watermark = watermarkCheckbox.checked;
    
    // Save the changes
    saveVideoAssemblyData();
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Source file watermark ${watermarkCheckbox.checked ? 'enabled' : 'disabled'}</p>`;
  });
  
  // Individual clips checkbox
  const individualClipsCheckbox = document.getElementById('individual-clips-checkbox');
  individualClipsCheckbox.addEventListener('change', () => {
    if (!currentVideoAssemblyData) return;
    
    // Ensure the settings object exists
    ensureSettingsExist();
    
    // Update the render_individual_clips flag
    currentVideoAssemblyData['composeflow.org'].settings.render_individual_clips = individualClipsCheckbox.checked;
    
    // Save the changes
    saveVideoAssemblyData();
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Render each clip individually ${individualClipsCheckbox.checked ? 'enabled' : 'disabled'}</p>`;
  });
  
  // Caching checkbox
  const cachingCheckbox = document.getElementById('caching-checkbox');
  cachingCheckbox.addEventListener('change', () => {
    if (!currentVideoAssemblyData) return;
    
    // Ensure the settings object exists
    ensureSettingsExist();
    
    // Update the enable_render_caching flag
    currentVideoAssemblyData['composeflow.org'].settings.enable_render_caching = cachingCheckbox.checked;
    
    // Save the changes
    saveVideoAssemblyData();
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Render caching ${cachingCheckbox.checked ? 'enabled' : 'disabled'}</p>`;
  });
}

/**
 * Ensures that the settings object exists in the video assembly data
 */
function ensureSettingsExist() {
  if (!currentVideoAssemblyData['composeflow.org']) {
    currentVideoAssemblyData['composeflow.org'] = {};
  }
  
  if (!currentVideoAssemblyData['composeflow.org'].settings) {
    currentVideoAssemblyData['composeflow.org'].settings = {};
  }
}

/**
 * Updates the render options UI based on the current video assembly data
 * @param {Object} videoAssemblyData - The video assembly data
 * @param {string} filePath - The path to the video assembly file
 */
function updateRenderOptions(videoAssemblyData, filePath) {
  // Store the current data
  currentVideoAssemblyData = videoAssemblyData;
  currentVideoAssemblyPath = filePath;
  
  // Show the render options
  const renderOptionsContainer = document.getElementById('render-options-container');
  renderOptionsContainer.style.display = 'block';
  
  // Get the settings from the video assembly data
  const settings = videoAssemblyData['composeflow.org'] && 
                  videoAssemblyData['composeflow.org'].settings ? 
                  videoAssemblyData['composeflow.org'].settings : {};
  
  // Update the quality toggle (true = Quick Render, false = High Quality)
  // The toggle is reversed: checked = High Quality (quick_and_dirty = false)
  const qualityToggle = document.getElementById('render-quality-toggle');
  qualityToggle.checked = settings.quick_and_dirty === undefined ? true : !settings.quick_and_dirty;
  
  // Update the watermark checkbox
  const watermarkCheckbox = document.getElementById('watermark-checkbox');
  watermarkCheckbox.checked = settings.source_file_watermark === true;
  
  // Update the individual clips checkbox
  const individualClipsCheckbox = document.getElementById('individual-clips-checkbox');
  individualClipsCheckbox.checked = settings.render_individual_clips === true;
  
  // Update the caching checkbox (default to true if not specified)
  const cachingCheckbox = document.getElementById('caching-checkbox');
  cachingCheckbox.checked = settings.enable_render_caching === undefined ? true : settings.enable_render_caching;
}

/**
 * Saves the current video assembly data to the file
 */
function saveVideoAssemblyData() {
  // Check if we're running in Electron
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    try {
      // Check if we have a current video assembly path
      if (!currentVideoAssemblyPath) {
        console.error('No video assembly path available for saving');
        return;
      }
      
      // Use the saveVideoAssemblyToFile function from renderer.js if available
      if (typeof window.saveVideoAssemblyToFile === 'function') {
        window.saveVideoAssemblyToFile(currentVideoAssemblyPath, currentVideoAssemblyData);
      } else {
        // Fallback to direct file writing
        const jsonContent = JSON.stringify(currentVideoAssemblyData, null, 4);
        fs.writeFileSync(currentVideoAssemblyPath, jsonContent, 'utf-8');
        console.log(`Video assembly saved to: ${currentVideoAssemblyPath}`);
      }
    } catch (error) {
      console.error('Error saving video assembly data:', error);
    }
  } else {
    console.log('Not running in Electron, cannot save video assembly data');
  }
}

/**
 * Adds CSS styles for the render options
 */
function addRenderOptionsStyles() {
  const renderOptionsStyle = document.createElement('style');
  renderOptionsStyle.textContent = `
    /* Render options container */
    #render-options-container {
      background-color: #f5f5f5;
      border-bottom: 1px solid #ddd;
      padding: 10px 15px;
    }
    
    .render-options-header {
      margin-bottom: 10px;
    }
    
    .render-options-header h3 {
      margin: 0;
      font-size: 14px;
      color: #333;
    }
    
    .render-options-content {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      align-items: center;
    }
    
    .render-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    /* Toggle switch for render quality */
    .render-quality-label {
      margin-right: 5px;
    }
    
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 140px;
      height: 24px;
    }
    
    .toggle-input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .toggle-label {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 24px;
      transition: .4s;
    }
    
    .toggle-inner {
      display: flex;
      width: 100%;
      height: 100%;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: bold;
      transition: .4s;
    }
    
    .toggle-inner:before {
      content: attr(data-on);
      padding-left: 10px;
      color: #4a86e8;
    }
    
    .toggle-inner:after {
      content: attr(data-off);
      padding-right: 10px;
      color: #888;
      text-align: right;
    }
    
    .toggle-switch-handle {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 2px;
      background-color: white;
      border-radius: 50%;
      transition: .4s;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    .toggle-input:checked + .toggle-label {
      background-color: #e6f0ff;
      border-color: #4a86e8;
    }
    
    .toggle-input:checked + .toggle-label .toggle-switch-handle {
      transform: translateX(116px);
      background-color: #4a86e8;
    }
    
    /* Checkboxes */
    .render-checkbox {
      margin-right: 5px;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .render-options-content {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `;
  document.head.appendChild(renderOptionsStyle);
}

// Export the functions
module.exports = {
  initializeRenderOptions,
  updateRenderOptions
};
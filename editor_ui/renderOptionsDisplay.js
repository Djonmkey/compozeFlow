/**
 * renderOptionsDisplay.js
 *
 * Handles the display and functionality of render options above the tab bar.
 * Provides controls for render quality, watermarking, and caching options.
 *
 * @sourceMappingURL=renderOptionsDisplay.js.map
 */

const fs = require('fs');
const { ICONS } = require('./uiConstants');

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

// Function to update the toggle visuals
function updateToggleVisuals(isHighQuality) {
  const qualityKnob = document.querySelector('.quality-toggle-knob');
  
  if (!qualityKnob) return;
  
  // Only move the knob, don't change text colors
  if (isHighQuality) {
    qualityKnob.style.transform = 'translateX(77px)';
  } else {
    qualityKnob.style.transform = 'translateX(0)';
  }
}

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

    <div class="render-options-content">
    <button id="render-button" class="render-button render-button-common" title="Export/Render Video">${ICONS.RENDER} Render</button>
      <div class="render-option">
        <label class="render-quality-label">Render Quality:</label>
        <div class="quality-toggle-container">
          <div class="quality-toggle-wrapper">
            <input type="checkbox" id="render-quality-toggle" class="quality-toggle-input">
            <div class="quality-toggle-slider">
              <div class="quality-toggle-option quality-toggle-quick">Quick</div>
              <div class="quality-toggle-option quality-toggle-high">High</div>
              <div class="quality-toggle-knob"></div>
            </div>
          </div>
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
  // Render button
  const renderButton = document.getElementById('render-button');
  if (renderButton) {
    renderButton.addEventListener('click', () => {
      // Check if we're running in Electron
      if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        // Call the handleRenderButtonClick function from renderer.js if available
        if (typeof window.handleRenderButtonClick === 'function') {
          window.handleRenderButtonClick();
        } else {
          console.error('handleRenderButtonClick function not available');
          // Update the terminal with a message
          const terminal = document.getElementById('terminal');
          terminal.innerHTML += `<p>Render button clicked, but render functionality is not available</p>`;
        }
      } else {
        console.log('Not running in Electron, cannot render video');
        // Update the terminal with a message
        const terminal = document.getElementById('terminal');
        terminal.innerHTML += `<p>Render button clicked, but not running in Electron environment</p>`;
      }
    });
  }
  
  // Quality toggle (High Quality / Quick Render)
  const qualityToggle = document.getElementById('render-quality-toggle');
  const qualitySlider = document.querySelector('.quality-toggle-slider');
  
  // Add click event to the entire slider area
  qualitySlider.addEventListener('click', () => {
    // Toggle the checkbox state
    qualityToggle.checked = !qualityToggle.checked;
    
    // Update visuals immediately
    updateToggleVisuals(qualityToggle.checked);
    
    const watermarkCheckbox = document.getElementById('watermark-checkbox');
    const cachingCheckbox = document.getElementById('caching-checkbox');
    
    // Update the checkboxes based on the quality toggle
    if (qualityToggle.checked) {
      // High Quality selected
      watermarkCheckbox.checked = false;
      cachingCheckbox.checked = false;
    } else {
      // Quick Render selected
      watermarkCheckbox.checked = true;
      cachingCheckbox.checked = true;
    }
    
    // Handle the data changes
    if (currentVideoAssemblyData) {
      // Ensure the settings object exists
      ensureSettingsExist();
      
      // Update the flag
      currentVideoAssemblyData['composeflow.org'].settings.quick_and_dirty = !qualityToggle.checked;
      
      // Save the changes
      saveVideoAssemblyData();
      
      // Update the terminal with a message
      const terminal = document.getElementById('terminal');
      terminal.innerHTML += `<p>Render quality set to ${qualityToggle.checked ? 'High Quality' : 'Quick Render'}</p>`;
    }
  });
  
  // Keep the original change event for compatibility
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
  
  // Update the toggle appearance based on the checked state
  updateToggleVisuals(qualityToggle.checked);
  
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
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .render-options-header h3 {
      margin: 0;
      font-size: 14px;
      color: #333;
    }
    
    /* Use the common render button styling from styles.css */
    /* Just add specific size and font adjustments */
    .render-button {
      width: 30px;
      height: 30px;
      font-size: 16px;
    }
    
    /* Use the common styles for states from styles.css */
    /* No need to redefine these here */
    
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
    
    /* Modern toggle switch for render quality */
    .render-quality-label {
      margin-right: 12px;
      font-weight: 500;
      color: #444;
    }
    
    .quality-toggle-container {
      display: inline-flex;
      align-items: center;
    }
    
    .quality-toggle-wrapper {
      position: relative;
      width: 160px;
      height: 34px;
    }
    
    .quality-toggle-input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
    }
    
    .quality-toggle-slider {
      position: relative;
      width: 100%;
      height: 100%;
      background: #f0f0f0;
      border-radius: 17px;
      display: flex;
      align-items: center;
      cursor: pointer;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      overflow: hidden;
    }
    
    .quality-toggle-option {
      flex: 1;
      text-align: center;
      z-index: 1;
      font-size: 13px;
      font-weight: 600;
      transition: color 0.3s ease;
      user-select: none;
    }
    
    .quality-toggle-quick,
    .quality-toggle-high {
      color: white;
      text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    }
    
    .quality-toggle-knob {
      position: absolute;
      width: 50%;
      height: 28px;
      border-radius: 14px;
      background: linear-gradient(135deg, #4a86e8, #3a76d8);
      left: 3px;
      top: 3px;
      transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    .quality-toggle-input:checked + .quality-toggle-slider {
      background: #e6f0ff;
    }
    
    .quality-toggle-input:checked + .quality-toggle-slider .quality-toggle-knob {
      transform: translateX(77px);
    }
    
    /* No need to change text colors as they're always white */
    
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
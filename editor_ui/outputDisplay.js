/**
 * outputDisplay.js
 *
 * Handles the display and editing of render output settings in the Output tab.
 * Provides UI for editing output paths and render settings.
 *
 * @sourceMappingURL=outputDisplay.js.map
 */

// Import required modules
const electronSetup = require('./electronSetup');

// Install source map support for better debugging
try {
  require('source-map-support').install({
    handleUncaughtExceptions: true,
    environment: 'node',
    hookRequire: true
  });
  console.log('Source map support installed in outputDisplay');
} catch (error) {
  console.error('Failed to install source map support in outputDisplay:', error);
}

/**
 * Generates HTML for the Output tab based on the video assembly data
 * @param {Object} videoAssemblyData - The video assembly data
 * @returns {string} - The HTML content for the Output tab
 */
function generateOutputHtml(videoAssemblyData) {
  if (!videoAssemblyData || !videoAssemblyData.cut || !videoAssemblyData.cut.render_output) {
    return `
      <div class="output-container">
        <h2>Render Output Settings</h2>
        <p>No render output settings found in the video assembly data.</p>
      </div>
    `;
  }

  const renderOutput = videoAssemblyData.cut.render_output;
  const outputPaths = renderOutput.output_paths || {};
  const highQualityRender = renderOutput.high_quality_render || {};
  const quickRender = renderOutput.quick_render || {};

  // Generate HTML for the output paths section
  const outputPathsHtml = `
    <div class="output-section">
      <h3>Output Paths</h3>
      <div class="output-form-group">
        <label for="output-path-cut">Video Output Path:</label>
        <div class="output-path-input-container">
          <input type="text" id="output-path-cut" class="output-form-control" value="${outputPaths.cut || ''}">
          <button id="browse-output-path-cut" class="output-path-browse-btn">Browse...</button>
        </div>
      </div>
      <div class="output-form-group">
        <label for="output-path-segment-scene">Segment / Scene Output Path:</label>
        <div class="output-path-input-container">
          <input type="text" id="output-path-segment-scene" class="output-form-control" value="${outputPaths.segment_scene || ''}">
          <button id="browse-output-path-segment-scene" class="output-path-browse-btn">Browse...</button>
        </div>
      </div>
      <div class="output-form-group">
        <label for="output-path-clip">Clip Output Path:</label>
        <div class="output-path-input-container">
          <input type="text" id="output-path-clip" class="output-form-control" value="${outputPaths.clip || ''}">
          <button id="browse-output-path-clip" class="output-path-browse-btn">Browse...</button>
        </div>
        <div class="output-path-note">Note: This path is only used if the "Render Each Clip Individually" is chosen.</div>
      </div>
      <button id="save-output-paths" class="output-btn output-btn-primary">Save Output Paths</button>
    </div>
  `;

  // Generate HTML for the high quality render settings section
  const highQualityRenderHtml = `
    <div class="output-section">
      <h3>High Quality Render Settings</h3>
      <div class="output-form-group">
        <label for="hq-aspect-ratio">Aspect Ratio:</label>
        <input type="text" id="hq-aspect-ratio" class="output-form-control" value="${highQualityRender.aspect_ratio || '16:9'}">
      </div>
      <div class="output-form-row">
        <div class="output-form-group half-width">
          <label for="hq-fps">FPS:</label>
          <input type="number" id="hq-fps" class="output-form-control" value="${highQualityRender.fps || ''}" placeholder="Auto">
        </div>
        <div class="output-form-group half-width">
          <label for="hq-width">Width:</label>
          <input type="number" id="hq-width" class="output-form-control" value="${highQualityRender.width || ''}" placeholder="Auto">
        </div>
      </div>
      <div class="output-form-group">
        <label for="hq-height">Height:</label>
        <input type="number" id="hq-height" class="output-form-control" value="${highQualityRender.height || ''}" placeholder="Auto">
      </div>
      
      <h4>Render Settings</h4>
      <div class="output-form-group">
        <label for="hq-codec">Video Codec:</label>
        <input type="text" id="hq-codec" class="output-form-control" value="${highQualityRender.render_settings?.codec || 'h264_videotoolbox'}">
      </div>
      <div class="output-form-group">
        <label for="hq-quality-preset">Quality Preset:</label>
        <select id="hq-quality-preset" class="output-form-control">
          <option value="ultrafast" ${highQualityRender.render_settings?.quality_preset === 'ultrafast' ? 'selected' : ''}>ultrafast</option>
          <option value="superfast" ${highQualityRender.render_settings?.quality_preset === 'superfast' ? 'selected' : ''}>superfast</option>
          <option value="veryfast" ${highQualityRender.render_settings?.quality_preset === 'veryfast' ? 'selected' : ''}>veryfast</option>
          <option value="faster" ${highQualityRender.render_settings?.quality_preset === 'faster' ? 'selected' : ''}>faster</option>
          <option value="fast" ${highQualityRender.render_settings?.quality_preset === 'fast' ? 'selected' : ''}>fast</option>
          <option value="medium" ${highQualityRender.render_settings?.quality_preset === 'medium' ? 'selected' : ''}>medium</option>
          <option value="slow" ${highQualityRender.render_settings?.quality_preset === 'slow' ? 'selected' : ''}>slow</option>
          <option value="slower" ${highQualityRender.render_settings?.quality_preset === 'slower' ? 'selected' : ''}>slower</option>
          <option value="veryslow" ${highQualityRender.render_settings?.quality_preset === 'veryslow' ? 'selected' : ''}>veryslow</option>
        </select>
      </div>
      <div class="output-form-group">
        <label for="hq-threads">Threads:</label>
        <input type="number" id="hq-threads" class="output-form-control" value="${highQualityRender.render_settings?.threads || ''}" placeholder="Auto">
      </div>
      <div class="output-form-group">
        <label for="hq-audio-codec">Audio Codec:</label>
        <input type="text" id="hq-audio-codec" class="output-form-control" value="${highQualityRender.render_settings?.audio?.codec || 'aac'}">
      </div>
      <button id="save-hq-settings" class="output-btn output-btn-primary">Save High Quality Settings</button>
    </div>
  `;

  // Generate HTML for the quick render settings section
  const quickRenderHtml = `
    <div class="output-section">
      <h3>Quick Render Settings</h3>
      <div class="output-form-group">
        <label for="qr-aspect-ratio">Aspect Ratio:</label>
        <input type="text" id="qr-aspect-ratio" class="output-form-control" value="${quickRender.aspect_ratio || '16:9'}">
      </div>
      <div class="output-form-row">
        <div class="output-form-group half-width">
          <label for="qr-fps">FPS:</label>
          <input type="number" id="qr-fps" class="output-form-control" value="${quickRender.fps || '10'}">
        </div>
        <div class="output-form-group half-width">
          <label for="qr-width">Width:</label>
          <input type="number" id="qr-width" class="output-form-control" value="${quickRender.width || '1920'}">
        </div>
      </div>
      <div class="output-form-group">
        <label for="qr-height">Height:</label>
        <input type="number" id="qr-height" class="output-form-control" value="${quickRender.height || ''}" placeholder="Auto">
      </div>
      
      <h4>Render Settings</h4>
      <div class="output-form-group">
        <label for="qr-codec">Video Codec:</label>
        <input type="text" id="qr-codec" class="output-form-control" value="${quickRender.render_settings?.codec || 'h264_videotoolbox'}">
      </div>
      <div class="output-form-group">
        <label for="qr-quality-preset">Quality Preset:</label>
        <select id="qr-quality-preset" class="output-form-control">
          <option value="ultrafast" ${quickRender.render_settings?.quality_preset === 'ultrafast' ? 'selected' : ''}>ultrafast</option>
          <option value="superfast" ${quickRender.render_settings?.quality_preset === 'superfast' ? 'selected' : ''}>superfast</option>
          <option value="veryfast" ${quickRender.render_settings?.quality_preset === 'veryfast' ? 'selected' : ''}>veryfast</option>
          <option value="faster" ${quickRender.render_settings?.quality_preset === 'faster' ? 'selected' : ''}>faster</option>
          <option value="fast" ${quickRender.render_settings?.quality_preset === 'fast' ? 'selected' : ''}>fast</option>
          <option value="medium" ${quickRender.render_settings?.quality_preset === 'medium' ? 'selected' : ''}>medium</option>
          <option value="slow" ${quickRender.render_settings?.quality_preset === 'slow' ? 'selected' : ''}>slow</option>
          <option value="slower" ${quickRender.render_settings?.quality_preset === 'slower' ? 'selected' : ''}>slower</option>
          <option value="veryslow" ${quickRender.render_settings?.quality_preset === 'veryslow' ? 'selected' : ''}>veryslow</option>
        </select>
      </div>
      <div class="output-form-group">
        <label for="qr-threads">Threads:</label>
        <input type="number" id="qr-threads" class="output-form-control" value="${quickRender.render_settings?.threads || ''}" placeholder="Auto">
      </div>
      <div class="output-form-group">
        <label for="qr-audio-codec">Audio Codec:</label>
        <input type="text" id="qr-audio-codec" class="output-form-control" value="${quickRender.render_settings?.audio?.codec || 'aac'}">
      </div>
      <button id="save-qr-settings" class="output-btn output-btn-primary">Save Quick Render Settings</button>
    </div>
  `;

  // Combine all sections
  const html = `
    <div class="output-container">
      <h2>Render Output Settings</h2>

      ${outputPathsHtml}
      
      ${highQualityRenderHtml}
      
      ${quickRenderHtml}
    </div>
    
    <style>
      .output-container {
        padding: 20px;
        font-family: Arial, sans-serif;
      }
      
      .output-section {
        margin-bottom: 30px;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f9f9f9;
      }
      
      .output-form-group {
        margin-bottom: 15px;
      }
      
      .output-form-row {
        display: flex;
        gap: 15px;
      }
      
      .half-width {
        width: 50%;
      }
      
      .output-path-input-container {
        display: flex;
        gap: 8px;
      }
      
      .output-form-control {
        flex: 1;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .output-path-browse-btn {
        padding: 8px 12px;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      
      .output-path-browse-btn:hover {
        background-color: #e0e0e0;
      }
      
      .output-path-note {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
      }
      
      .output-btn {
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        border: none;
        margin-top: 10px;
      }
      
      .output-btn-primary {
        background-color: #4a86e8;
        color: white;
      }
      
      .output-btn-primary:hover {
        background-color: #3a76d8;
      }
      
      .output-btn-success {
        background-color: #28a745;
        color: white;
        padding: 10px 20px;
        font-size: 16px;
      }
      
      .output-btn-success:hover {
        background-color: #218838;
      }
      
      h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #333;
      }
      
      h4 {
        margin-top: 20px;
        margin-bottom: 10px;
        color: #555;
      }
    </style>
    
    <script>
      // Function to save output paths
      function saveOutputPaths() {
        const cutPath = document.getElementById('output-path-cut').value;
        const segmentScenePath = document.getElementById('output-path-segment-scene').value;
        const clipPath = document.getElementById('output-path-clip').value;
        
        // Send message to parent window
        window.parent.postMessage({
          type: 'save-output-paths',
          data: {
            cut: cutPath,
            segment_scene: segmentScenePath,
            clip: clipPath
          }
        }, '*');
        
        // Show success message
        const terminal = window.parent.document.getElementById('terminal');
        if (terminal) {
          terminal.innerHTML += '<p>Output paths saved successfully</p>';
          terminal.scrollTop = terminal.scrollHeight;
        }
      }
      
      // Function to save high quality render settings
      function saveHighQualitySettings() {
        const aspectRatio = document.getElementById('hq-aspect-ratio').value;
        const fps = document.getElementById('hq-fps').value;
        const width = document.getElementById('hq-width').value;
        const height = document.getElementById('hq-height').value;
        const codec = document.getElementById('hq-codec').value;
        const qualityPreset = document.getElementById('hq-quality-preset').value;
        const threads = document.getElementById('hq-threads').value;
        const audioCodec = document.getElementById('hq-audio-codec').value;
        
        // Send message to parent window
        window.parent.postMessage({
          type: 'save-high-quality-settings',
          data: {
            aspect_ratio: aspectRatio,
            fps: fps ? parseInt(fps) : null,
            width: width ? parseInt(width) : null,
            height: height ? parseInt(height) : null,
            render_settings: {
              codec: codec,
              quality_preset: qualityPreset,
              threads: threads ? parseInt(threads) : null,
              audio: {
                codec: audioCodec
              }
            }
          }
        }, '*');
        
        // Show success message
        const terminal = window.parent.document.getElementById('terminal');
        if (terminal) {
          terminal.innerHTML += '<p>High quality render settings saved successfully</p>';
          terminal.scrollTop = terminal.scrollHeight;
        }
      }
      
      // Function to save quick render settings
      function saveQuickRenderSettings() {
        const aspectRatio = document.getElementById('qr-aspect-ratio').value;
        const fps = document.getElementById('qr-fps').value;
        const width = document.getElementById('qr-width').value;
        const height = document.getElementById('qr-height').value;
        const codec = document.getElementById('qr-codec').value;
        const qualityPreset = document.getElementById('qr-quality-preset').value;
        const threads = document.getElementById('qr-threads').value;
        const audioCodec = document.getElementById('qr-audio-codec').value;
        
        // Send message to parent window
        window.parent.postMessage({
          type: 'save-quick-render-settings',
          data: {
            aspect_ratio: aspectRatio,
            fps: fps ? parseInt(fps) : null,
            width: width ? parseInt(width) : null,
            height: height ? parseInt(height) : null,
            render_settings: {
              codec: codec,
              quality_preset: qualityPreset,
              threads: threads ? parseInt(threads) : null,
              audio: {
                codec: audioCodec
              }
            }
          }
        }, '*');
        
        // Show success message
        const terminal = window.parent.document.getElementById('terminal');
        if (terminal) {
          terminal.innerHTML += '<p>Quick render settings saved successfully</p>';
          terminal.scrollTop = terminal.scrollHeight;
        }
      }
      
      // Function to save all settings
      function saveAllSettings() {
        saveOutputPaths();
        saveHighQualitySettings();
        saveQuickRenderSettings();
        
        // Show success message
        const terminal = window.parent.document.getElementById('terminal');
        if (terminal) {
          terminal.innerHTML += '<p>All output settings saved successfully</p>';
          terminal.scrollTop = terminal.scrollHeight;
        }
      }
      
      // Function to browse for a directory
      async function browseForDirectory(inputId) {
        try {
          console.log('Browse button clicked for:', inputId);
          
          // Check if we're running in Electron
          if (electronSetup.isElectron && electronSetup.ipcRenderer) {
            console.log('Running in Electron with ipcRenderer available');
            
            // Use IPC to request the main process to show the open folder dialog
            const pathType = inputId.replace('output-path-', '').replace('-', ' ');
            const dialogTitle = 'Select ' + pathType + ' Output Path';
            console.log('Requesting folder dialog with title:', dialogTitle);
            
            try {
              const result = await electronSetup.ipcRenderer.invoke('show-output-path-dialog', dialogTitle);
              console.log('Dialog result:', result);
              
              if (result.canceled) {
                console.log('Folder selection was canceled');
                return;
              }
              
              const folderPath = result.folderPath;
              console.log('Selected folder for ' + inputId + ': ' + folderPath);
              
              // Update the input field with the selected path
              const inputField = document.getElementById(inputId);
              if (inputField) {
                inputField.value = folderPath;
                console.log('Input field updated with path:', folderPath);
              } else {
                console.error('Input field not found:', inputId);
              }
            } catch (ipcError) {
              console.error('IPC error when showing folder dialog:', ipcError);
              
              // Show error in terminal
              const terminal = window.parent.document.getElementById('terminal');
              if (terminal) {
                terminal.innerHTML += '<p>Error showing folder dialog: ' + ipcError.message + '</p>';
                terminal.scrollTop = terminal.scrollHeight;
              }
            }
          } else {
            console.log('Not running in Electron or ipcRenderer not available');
            console.log('electronSetup.isElectron:', electronSetup.isElectron);
            console.log('electronSetup.ipcRenderer:', electronSetup.ipcRenderer);
          }
        } catch (error) {
          console.error('Error browsing for directory:', error);
          
          // Show error in terminal
          const terminal = window.parent.document.getElementById('terminal');
          if (terminal) {
            terminal.innerHTML += '<p>Error browsing for directory: ' + error.message + '</p>';
            terminal.scrollTop = terminal.scrollHeight;
          }
        }
      }
      
      // Add event listeners when the document is loaded
      document.addEventListener('DOMContentLoaded', () => {
        // Output paths save button
        const saveOutputPathsBtn = document.getElementById('save-output-paths');
        if (saveOutputPathsBtn) {
          saveOutputPathsBtn.addEventListener('click', saveOutputPaths);
        }
        
        // Browse buttons for output paths
        const browseCutBtn = document.getElementById('browse-output-path-cut');
        if (browseCutBtn) {
          console.log('Adding click event listener to browse-output-path-cut button');
          browseCutBtn.addEventListener('click', function(event) {
            console.log('browse-output-path-cut button clicked');
            event.preventDefault();
            browseForDirectory('output-path-cut');
          });
        } else {
          console.error('browse-output-path-cut button not found');
        }
        
        const browseSegmentSceneBtn = document.getElementById('browse-output-path-segment-scene');
        if (browseSegmentSceneBtn) {
          console.log('Adding click event listener to browse-output-path-segment-scene button');
          browseSegmentSceneBtn.addEventListener('click', function(event) {
            console.log('browse-output-path-segment-scene button clicked');
            event.preventDefault();
            browseForDirectory('output-path-segment-scene');
          });
        } else {
          console.error('browse-output-path-segment-scene button not found');
        }
        
        const browseClipBtn = document.getElementById('browse-output-path-clip');
        if (browseClipBtn) {
          console.log('Adding click event listener to browse-output-path-clip button');
          browseClipBtn.addEventListener('click', function(event) {
            console.log('browse-output-path-clip button clicked');
            event.preventDefault();
            browseForDirectory('output-path-clip');
          });
        } else {
          console.error('browse-output-path-clip button not found');
        }
        
        // High quality settings save button
        const saveHqSettingsBtn = document.getElementById('save-hq-settings');
        if (saveHqSettingsBtn) {
          saveHqSettingsBtn.addEventListener('click', saveHighQualitySettings);
        }
        
        // Quick render settings save button
        const saveQrSettingsBtn = document.getElementById('save-qr-settings');
        if (saveQrSettingsBtn) {
          saveQrSettingsBtn.addEventListener('click', saveQuickRenderSettings);
        }
        
        // Save all settings button
        const saveAllSettingsBtn = document.getElementById('save-all-output-settings');
        if (saveAllSettingsBtn) {
          saveAllSettingsBtn.addEventListener('click', saveAllSettings);
        }
      });
    </script>
  `;

  return html;
}

// Export the function
module.exports = generateOutputHtml;
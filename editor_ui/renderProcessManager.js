/**
 * renderProcessManager.js
 *
 * Handles the render process control for video assembly rendering.
 */

// Import required modules
const electronSetup = require('./electronSetup');
const videoAssemblyManager = require('./videoAssemblyManager');
const { ICONS } = require('./uiConstants');

// Variables for render process
let renderProcess = null;
let isRendering = false;

/**
 * Function to handle the render button click
 */
function handleRenderButtonClick() {
  const renderButton = document.getElementById('render-button');
  const terminal = document.getElementById('terminal');
  
  if (!isRendering) {
    // Switch to the Render tab before starting the render
    if (window.uiManager) {
      window.uiManager.setActiveTab('Render');
    }
    
    // Start rendering
    startRender(renderButton, terminal);
  } else {
    // Stop rendering
    stopRender(renderButton, terminal);
  }
}

/**
 * Function to start the render process
 * @param {HTMLElement} renderButton - The render button element
 * @param {HTMLElement} terminal - The terminal element
 */
function startRender(renderButton, terminal) {
  if (isRendering) return;
  
  isRendering = true;
  
  // Update button appearance
  renderButton.innerHTML = '■ Stop'; // Square for stop and text
  renderButton.classList.add('running');
  renderButton.title = 'Stop Render';
  
  // Clear terminal
  terminal.innerHTML = '<p>Starting render process...</p>';
  
  // Path to the Python script (using relative path since both are in the same base path)
  const pythonScriptPath = '../render_engine/main.py';
  
  // Path to the Python virtual environment
  const pythonVenvPath = process.platform === 'win32'
    ? '../render_engine/venv/Scripts/python.exe'  // Windows path
    : '../render_engine/venv/bin/python';         // macOS/Linux path
  
  try {
    // Check if we have a current video assembly path
    const currentVideoAssemblyPath = videoAssemblyManager.getCurrentVideoAssemblyPath();
    if (!currentVideoAssemblyPath) {
      terminal.innerHTML += `<p style="color: #ff6666;">Error: No video assembly file is currently loaded.</p>`;
      isRendering = false;
      renderButton.classList.remove('running');
      renderButton.classList.add('failed');
      renderButton.innerHTML = `${ICONS.RENDER} Render`;
      renderButton.title = 'Render failed - no file loaded';
      return;
    }
    
    // Check if the virtual environment exists
    const venvExists = electronSetup.fs.existsSync(electronSetup.path.resolve(__dirname, pythonVenvPath));
    
    // Use the virtual environment Python if it exists, otherwise fall back to system Python
    const pythonExecutable = venvExists ? pythonVenvPath : 'python';
    
    // Display the command being executed
    const command = `${pythonExecutable} ${pythonScriptPath} ${currentVideoAssemblyPath}`;
    terminal.innerHTML += `<p style="color: #88ccff;">Executing: ${command}</p>`;
    terminal.innerHTML += venvExists
      ? `<p>Using Python from virtual environment: ${pythonVenvPath}</p>`
      : `<p style="color: #ffcc66;">Warning: Virtual environment not found, falling back to system Python</p>`;
    
    // Spawn the Python process with the current video assembly file path as argument
    // Use shell option to ensure proper path handling
    renderProcess = electronSetup.child_process.spawn(pythonExecutable, [pythonScriptPath, currentVideoAssemblyPath], {
      shell: process.platform === 'win32', // Use shell on Windows for better path handling
      env: process.env, // Pass environment variables
      cwd: electronSetup.path.resolve(__dirname) // Set current working directory to ensure relative paths work
    });
    
    // Handle stdout data
    renderProcess.stdout.on('data', (data) => {
      // Process the output to handle line breaks properly
      const output = data.toString().trim();
      const lines = output.split('\n');
      
      // Add each line as a separate paragraph for better readability
      lines.forEach(line => {
        if (line.trim()) {
          terminal.innerHTML += `<p>${line}</p>`;
        }
      });
      
      // Auto-scroll to bottom
      terminal.scrollTop = terminal.scrollHeight;
    });
    
    // Handle stderr data
    renderProcess.stderr.on('data', (data) => {
      // Process the output to handle line breaks properly
      const output = data.toString().trim();
      const lines = output.split('\n');
      
      // Add each line as a separate paragraph with error styling
      lines.forEach(line => {
        if (line.trim()) {
          terminal.innerHTML += `<p style="color: #ff6666;">${line}</p>`;
        }
      });
      
      // Auto-scroll to bottom
      terminal.scrollTop = terminal.scrollHeight;
    });
    
    // Handle process completion
    renderProcess.on('close', (code) => {
      isRendering = false;
      renderProcess = null;
      
      if (code === 0) {
        // Success
        terminal.innerHTML += '<p style="color: #88ff88;">Render completed successfully.</p>';
        renderButton.classList.remove('running');
        renderButton.classList.remove('failed');
        renderButton.innerHTML = `${ICONS.RENDER} Render`;
        renderButton.title = 'Render Video';
      } else if (code === -2) {
        // Process was terminated by a signal (likely SIGINT)
        terminal.innerHTML += `<p style="color: #ffcc66;">Render process was terminated (code ${code}). This typically happens when the process is interrupted.</p>`;
        terminal.innerHTML += `<p>Check that Python is installed correctly and the script path is valid.</p>`;
        renderButton.classList.remove('running');
        renderButton.classList.add('failed');
        renderButton.innerHTML = `${ICONS.RENDER} Render`;
        renderButton.title = 'Last render was interrupted';
      } else {
        // Other failure
        terminal.innerHTML += `<p style="color: #ff6666;">Render process exited with code ${code}</p>`;
        terminal.innerHTML += `<p>This may indicate an error in the Python script or missing dependencies.</p>`;
        renderButton.classList.remove('running');
        renderButton.classList.add('failed');
        renderButton.innerHTML = `${ICONS.RENDER} Render`;
        renderButton.title = 'Last render failed';
      }
      
      // Auto-scroll to bottom
      terminal.scrollTop = terminal.scrollHeight;
      
      // If the Render tab is active, refresh its content
      if (window.uiManager && window.uiManager.getActiveTab() === 'Render') {
        // Get the render tab display module
        const renderTabDisplay = require('./renderTabDisplay');
        
        // Update the editor content with fresh render tab HTML
        const editorContent = document.getElementById('editor-content');
        if (editorContent) {
          const htmlContent = renderTabDisplay.generateRenderTabHtml();
          editorContent.innerHTML = `
            <iframe
              id="video-assembly-frame"
              style="width: 100%; height: 100%; border: none;"
              srcdoc="${htmlContent.replace(/"/g, '&quot;')}"
            ></iframe>
          `;
        }
      }
    });
    
    // Handle process error
    renderProcess.on('error', (err) => {
      isRendering = false;
      renderProcess = null;
      
      // Display detailed error information
      terminal.innerHTML += `<p style="color: #ff6666;">Error starting render process: ${err.message}</p>`;
      
      // Add more helpful information based on the error
      if (err.code === 'ENOENT') {
        terminal.innerHTML += `<p>Python executable not found. Please ensure Python is installed and in your PATH.</p>`;
        terminal.innerHTML += `<p>Command attempted: python ${pythonScriptPath}</p>`;
      } else if (err.code === 'EACCES') {
        terminal.innerHTML += `<p>Permission denied. Check that you have execute permissions for the Python script.</p>`;
      } else {
        terminal.innerHTML += `<p>Error code: ${err.code || 'unknown'}</p>`;
      }
      
      // Suggest checking the script path
      terminal.innerHTML += `<p>Verify that the script exists at: ${pythonScriptPath}</p>`;
      
      renderButton.classList.remove('running');
      renderButton.classList.add('failed');
      renderButton.innerHTML = `${ICONS.RENDER} Render`;
      renderButton.title = 'Last render failed';
      
      // Auto-scroll to bottom
      terminal.scrollTop = terminal.scrollHeight;
    });
    
  } catch (error) {
    isRendering = false;
    terminal.innerHTML += `<p style="color: #ff6666;">Error: ${error.message}</p>`;
    renderButton.classList.remove('running');
    renderButton.classList.add('failed');
    renderButton.innerHTML = `${ICONS.RENDER} Render`;
    renderButton.title = 'Last render failed';
  }
}

/**
 * Function to stop the render process
 * @param {HTMLElement} renderButton - The render button element
 * @param {HTMLElement} terminal - The terminal element
 */
function stopRender(renderButton, terminal) {
  if (!isRendering || !renderProcess) return;
  
  try {
    // Kill the process
    if (process.platform === 'win32') {
      // On Windows, we need to use taskkill to kill the process tree
      electronSetup.child_process.exec(`taskkill /pid ${renderProcess.pid} /t /f`);
    } else {
      // On Unix-like systems, we can kill the process group
      process.kill(-renderProcess.pid, 'SIGTERM');
    }
    
    terminal.innerHTML += '<p>Render process stopped by user.</p>';
    
    // Update button state
    renderButton.classList.remove('running');
    renderButton.innerHTML = `${ICONS.RENDER} Render`;
    renderButton.title = 'Render Video';
    
    isRendering = false;
    renderProcess = null;
    
  } catch (error) {
    terminal.innerHTML += `<p style="color: #ff6666;">Error stopping render process: ${error.message}</p>`;
  }
}

/**
 * Function to check if rendering is in progress
 * @returns {boolean} - Whether rendering is in progress
 */
function isRenderingInProgress() {
  return isRendering;
}

// Export the functions
module.exports = {
  handleRenderButtonClick,
  startRender,
  stopRender,
  isRenderingInProgress
};
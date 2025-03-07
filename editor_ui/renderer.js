/**
 * renderer.js
 *
 * Handles communication between the main process and the renderer process,
 * and updates the UI accordingly.
 */

const { ipcRenderer } = require('electron');
const fs = require('fs');
const generateHtmlFromVideoAssembly = require('./timelineDisplay');

// DOM elements
const editorContent = document.getElementById('editor-content');
const tabs = document.querySelectorAll('.tab');
const tab1 = document.querySelector('.tab:nth-child(1)');

// Keep track of the currently active tab
let activeTab = 'Timeline';

// Store the current video assembly data and file path
let currentVideoAssemblyData = null;
let currentVideoAssemblyPath = null;

// Initialize tab click handlers
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    activeTab = tab.textContent;
    // Handle tab switching logic here if needed
  });
});

// Listen for the 'video-assembly-opened' event from the main process
ipcRenderer.on('video-assembly-opened', (event, data) => {
  console.log('Received video assembly data:', data);
  
  // Store the current data
  currentVideoAssemblyData = data;
  
  // Generate HTML from the video assembly data
  const htmlContent = generateHtmlFromVideoAssembly(data);
  
  // Update the editor content with the generated HTML
  // We'll use an iframe to properly render the HTML content
  editorContent.innerHTML = `
    <iframe
      id="video-assembly-frame"
      style="width: 100%; height: 100%; border: none;"
      srcdoc="${htmlContent.replace(/"/g, '&quot;')}"
    ></iframe>
  `;
  
  // Make sure Timeline tab is active
  tabs.forEach(tab => {
    tab.style.backgroundColor = tab.textContent === 'Timeline' ? '#ddd' : '';
    tab.style.fontWeight = tab.textContent === 'Timeline' ? 'bold' : 'normal';
  });
  
  activeTab = 'Timeline';
  
  // Update the terminal with a message
  const terminal = document.getElementById('terminal');
  terminal.innerHTML += `<p>Video assembly loaded and displayed in Timeline tab</p>`;
});

// Listen for messages from the iframe
window.addEventListener('message', (event) => {
  // Check if the message is a title update
  if (event.data && event.data.type === 'title-updated') {
    const newTitle = event.data.newTitle;
    
    // Update the title in the current data
    if (currentVideoAssemblyData && currentVideoAssemblyData.cut) {
      currentVideoAssemblyData.cut.title = newTitle;
      
      // Get the current file path from the main process
      ipcRenderer.invoke('get-current-file-path').then((filePath) => {
        if (filePath) {
          // Save the updated data to the file
          saveVideoAssemblyToFile(filePath, currentVideoAssemblyData);
        } else {
          console.error('No file path available for saving');
        }
      });
    }
  }
  // Check if the message is a subtitle update
  else if (event.data && event.data.type === 'subtitle-updated') {
    const newSubtitle = event.data.newSubtitle;
    
    // Update the subtitle in the current data
    if (currentVideoAssemblyData && currentVideoAssemblyData.cut) {
      currentVideoAssemblyData.cut.subtitle = newSubtitle;
      
      // Get the current file path from the main process
      ipcRenderer.invoke('get-current-file-path').then((filePath) => {
        if (filePath) {
          // Save the updated data to the file
          saveVideoAssemblyToFile(filePath, currentVideoAssemblyData);
        } else {
          console.error('No file path available for saving');
        }
      });
    }
  }
});

// Function to save video assembly data to a file
function saveVideoAssemblyToFile(filePath, data) {
  try {
    // Convert data to JSON string
    const jsonContent = JSON.stringify(data, null, 4);
    
    // Write to file
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
    
    // Update the terminal with a message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Video assembly saved with updated title</p>`;
    
    console.log(`File saved to: ${filePath}`);
  } catch (error) {
    console.error('Error saving file:', error);
    
    // Update the terminal with an error message
    const terminal = document.getElementById('terminal');
    terminal.innerHTML += `<p>Error saving file: ${error.message}</p>`;
  }
}

// Initialize the UI
document.addEventListener('DOMContentLoaded', () => {
  console.log('Renderer process initialized');
});

// Listen for the current file path from the main process
ipcRenderer.on('current-file-path', (event, filePath) => {
  currentVideoAssemblyPath = filePath;
});
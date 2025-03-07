/**
 * renderer.js
 * 
 * Handles communication between the main process and the renderer process,
 * and updates the UI accordingly.
 */

const { ipcRenderer } = require('electron');
const generateHtmlFromVideoAssembly = require('./timelineDisplay');

// DOM elements
const editorContent = document.getElementById('editor-content');
const tabs = document.querySelectorAll('.tab');
const tab1 = document.querySelector('.tab:nth-child(1)');

// Keep track of the currently active tab
let activeTab = 'Timeline';

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

// Initialize the UI
document.addEventListener('DOMContentLoaded', () => {
  console.log('Renderer process initialized');
});
/**
 * fileOperations.js
 * 
 * Handles file operations for the compozeFlow application,
 * such as opening and saving video assembly files.
 */

const { dialog, app } = require('electron');
const fs = require('fs');
const path = require('path');

/**
 * Opens a file dialog to select a JSON file
 * @param {BrowserWindow} window - The parent window for the dialog
 * @returns {Promise<Object|null>} The parsed JSON content or null if canceled
 */
async function openVideoAssembly(window) {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      title: 'Open Video Assembly',
      filters: [
        { name: 'Video Assembly Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (canceled || filePaths.length === 0) {
      console.log('File selection was canceled');
      return null;
    }

    const filePath = filePaths[0];
    console.log(`Selected file: ${filePath}`);
    
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    try {
      // Parse the JSON content
      const jsonContent = JSON.parse(fileContent);
      return {
        filePath,
        content: jsonContent
      };
    } catch (error) {
      console.error('Error parsing JSON file:', error);
      dialog.showErrorBox(
        'Invalid File Format',
        'The selected file is not a valid JSON file.'
      );
      return null;
    }
  } catch (error) {
    console.error('Error opening file:', error);
    dialog.showErrorBox(
      'Error Opening File',
      `An error occurred while opening the file: ${error.message}`
    );
    return null;
  }
}

/**
 * Saves a video assembly to a JSON file
 * @param {BrowserWindow} window - The parent window for the dialog
 * @param {Object} content - The content to save
 * @param {string} [filePath] - Optional file path (for Save). If not provided, will prompt for location (for Save As)
 * @returns {Promise<string|null>} The file path where the content was saved, or null if canceled
 */
async function saveVideoAssembly(window, content, filePath = null) {
  try {
    // If no file path is provided (Save As), show a save dialog
    if (!filePath) {
      const { canceled, filePath: selectedPath } = await dialog.showSaveDialog(window, {
        title: 'Save Video Assembly',
        filters: [
          { name: 'Video Assembly Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['createDirectory', 'showOverwriteConfirmation']
      });

      if (canceled || !selectedPath) {
        console.log('Save was canceled');
        return null;
      }

      filePath = selectedPath;
    }

    // Ensure the file has a .json extension
    if (!filePath.toLowerCase().endsWith('.json')) {
      filePath += '.json';
    }

    // Convert content to JSON string
    const jsonContent = JSON.stringify(content, null, 2);
    
    // Write to file
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
    console.log(`File saved to: ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error('Error saving file:', error);
    dialog.showErrorBox(
      'Error Saving File',
      `An error occurred while saving the file: ${error.message}`
    );
    return null;
  }
}

/**
 * Saves a video assembly as a template
 * @param {BrowserWindow} window - The parent window for the dialog
 * @param {Object} content - The content to save
 * @returns {Promise<string|null>} The file path where the template was saved, or null if canceled
 */
async function saveVideoAssemblyAsTemplate(window, content) {
  try {
    // Create templates directory if it doesn't exist
    const templatesDir = path.join(__dirname, 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Show save dialog with templates directory as default path
    const { canceled, filePath: selectedPath } = await dialog.showSaveDialog(window, {
      title: 'Save Video Assembly As Template',
      defaultPath: path.join(templatesDir, 'template.json'),
      filters: [
        { name: 'Template Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['createDirectory', 'showOverwriteConfirmation']
    });

    if (canceled || !selectedPath) {
      console.log('Save template was canceled');
      return null;
    }

    let filePath = selectedPath;
    
    // Ensure the file has a .json extension
    if (!filePath.toLowerCase().endsWith('.json')) {
      filePath += '.json';
    }

    // Convert content to JSON string
    const jsonContent = JSON.stringify(content, null, 2);
    
    // Write to file
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
    console.log(`Template saved to: ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error('Error saving template:', error);
    dialog.showErrorBox(
      'Error Saving Template',
      `An error occurred while saving the template: ${error.message}`
    );
    return null;
  }
}

/**
 * Lists available templates in the templates directory
 * @returns {Promise<Array<{name: string, path: string}>>} Array of template objects with name and path
 */
function listTemplates() {
  try {
    const templatesDir = path.join(__dirname, 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(templatesDir);
    const templates = files
      .filter(file => file.toLowerCase().endsWith('.json'))
      .map(file => ({
        name: path.basename(file, '.json'),
        path: path.join(templatesDir, file)
      }));
    
    return templates;
  } catch (error) {
    console.error('Error listing templates:', error);
    return [];
  }
}

/**
 * Creates a new video assembly from a template
 * @param {BrowserWindow} window - The parent window for the dialog
 * @param {string} templatePath - Path to the template file
 * @param {Object} metadata - Metadata for the new assembly (title, subtitle)
 * @returns {Promise<{filePath: string, content: Object}|null>} The new file path and content, or null if canceled
 */
async function createVideoAssemblyFromTemplate(window, templatePath, metadata) {
  try {
    // Read the template file
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = JSON.parse(templateContent);
    
    // Update the template with the provided metadata
    if (template.cut) {
      template.cut.title = metadata.title || template.cut.title || '';
      template.cut.subtitle = metadata.subtitle || template.cut.subtitle || '';
    } else {
      // If the template doesn't have a cut property, create a basic structure
      template.cut = {
        title: metadata.title || '',
        subtitle: metadata.subtitle || '',
        segments: []
      };
    }
    
    // Prompt for save location
    const { canceled, filePath: selectedPath } = await dialog.showSaveDialog(window, {
      title: 'Save New Video Assembly',
      defaultPath: path.join(app.getPath('documents'), `${metadata.title || 'new_video_assembly'}.json`),
      filters: [
        { name: 'Video Assembly Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['createDirectory', 'showOverwriteConfirmation']
    });

    if (canceled || !selectedPath) {
      console.log('Save was canceled');
      return null;
    }

    let filePath = selectedPath;
    
    // Ensure the file has a .json extension
    if (!filePath.toLowerCase().endsWith('.json')) {
      filePath += '.json';
    }

    // Convert content to JSON string
    const jsonContent = JSON.stringify(template, null, 2);
    
    // Write to file
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
    console.log(`New video assembly saved to: ${filePath}`);
    
    return {
      filePath,
      content: template
    };
  } catch (error) {
    console.error('Error creating video assembly from template:', error);
    dialog.showErrorBox(
      'Error Creating Video Assembly',
      `An error occurred while creating the video assembly: ${error.message}`
    );
    return null;
  }
}

module.exports = {
  openVideoAssembly,
  saveVideoAssembly,
  saveVideoAssemblyAsTemplate,
  listTemplates,
  createVideoAssemblyFromTemplate
};
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
 * Generic function to save a JSON file with dialog
 * @param {BrowserWindow} window - The parent window for the dialog
 * @param {Object} content - The content to save
 * @param {Object} options - Options for saving
 * @param {string} [options.filePath] - Optional file path (for Save). If not provided, will prompt for location (for Save As)
 * @param {string} [options.defaultDir] - Default directory to save to
 * @param {string} [options.defaultFilename] - Default filename
 * @param {string} [options.dialogTitle] - Title for the save dialog
 * @returns {Promise<string|null>} The file path where the content was saved, or null if canceled
 */
async function saveJsonFileWithDialog(window, content, options = {}) {
  try {
    const {
      filePath = null,
      defaultDir = path.join(__dirname, 'video_assemblies'),
      defaultFilename = 'video_assembly.json',
      dialogTitle = 'Save Video Assembly'
    } = options;

    let finalFilePath = filePath;

    // If no file path is provided (Save As), show a save dialog
    if (!finalFilePath) {
      // Create the directory if it doesn't exist
      if (!fs.existsSync(defaultDir)) {
        fs.mkdirSync(defaultDir, { recursive: true });
      }
      
      // Get a default filename based on title if available
      let filename = defaultFilename;
      if (content.cut && content.cut.title) {
        filename = `${content.cut.title}.json`;
      }
      
      const { canceled, filePath: selectedPath } = await dialog.showSaveDialog(window, {
        title: dialogTitle,
        defaultPath: path.join(defaultDir, filename),
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

      finalFilePath = selectedPath;
    }

    // Ensure the file has a .json extension
    if (!finalFilePath.toLowerCase().endsWith('.json')) {
      finalFilePath += '.json';
    }

    // Convert content to JSON string
    const jsonContent = JSON.stringify(content, null, 2);
    
    // Write to file
    fs.writeFileSync(finalFilePath, jsonContent, 'utf-8');
    console.log(`File saved to: ${finalFilePath}`);
    
    return finalFilePath;
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
 * Saves a video assembly to a JSON file
 * @param {BrowserWindow} window - The parent window for the dialog
 * @param {Object} content - The content to save
 * @param {string} [filePath] - Optional file path (for Save). If not provided, will prompt for location (for Save As)
 * @returns {Promise<string|null>} The file path where the content was saved, or null if canceled
 */
async function saveVideoAssembly(window, content, filePath = null) {
  return saveJsonFileWithDialog(window, content, {
    filePath,
    defaultDir: path.join(__dirname, 'video_assemblies'),
    defaultFilename: 'video_assembly.json',
    dialogTitle: 'Save Video Assembly'
  });
}

/**
 * Saves a video assembly as a template
 * @param {BrowserWindow} window - The parent window for the dialog
 * @param {Object} content - The content to save
 * @returns {Promise<string|null>} The file path where the template was saved, or null if canceled
 */
async function saveVideoAssemblyAsTemplate(window, content) {
  return saveJsonFileWithDialog(window, content, {
    defaultDir: path.join(__dirname, 'templates'),
    defaultFilename: 'template.json',
    dialogTitle: 'Save Video Assembly As Template'
  });
}

/**
 * Lists available templates in the templates directory with their metadata
 * @returns {Promise<Array<{name: string, path: string, title: string, subtitle: string}>>} Array of template objects with name, path, and metadata
 */
function listTemplatesWithMetadata() {
  try {
    const templatesDir = path.join(__dirname, 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(templatesDir);
    const templates = files
      .filter(file => file.toLowerCase().endsWith('.json'))
      .map(file => {
        const templatePath = path.join(templatesDir, file);
        const templateName = path.basename(file, '.json');
        
        // Try to read title and subtitle from the template
        let title = '';
        let subtitle = '';
        let description = '';
        
        try {
          const content = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
          if (content.cut) {
            title = content.cut.title || '';
            subtitle = content.cut.subtitle || '';
            description = content.cut.description || '';
          }
        } catch (err) {
          console.error(`Error reading template metadata for ${templateName}:`, err);
        }
        
        return {
          name: templateName,
          path: templatePath,
          title,
          subtitle,
          description
        };
      });
    
    return templates;
  } catch (error) {
    console.error('Error listing templates:', error);
    return [];
  }
}

/**
 * Lists available templates in the templates directory
 * @returns {Array<{name: string, path: string}>} Array of template objects with name and path
 */
function listTemplates() {
  const templates = listTemplatesWithMetadata();
  return templates.map(({ name, path }) => ({ name, path }));
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
      // Set title to user-defined value, but set subtitle and description to blank
      template.cut.title = metadata.title || template.cut.title || '';
      template.cut.subtitle = ''; // Always set to blank
      template.cut.description = ''; // Always set to blank
    } else {
      // If the template doesn't have a cut property, create a basic structure
      template.cut = {
        title: metadata.title || '',
        subtitle: '', // Always blank
        description: '', // Always blank
        segments: []
      };
    }
    
    // Save the file using our generic function
    const filePath = await saveJsonFileWithDialog(window, template, {
      defaultDir: path.join(__dirname, 'video_assemblies'),
      defaultFilename: `${metadata.title || 'new_video_assembly'}.json`,
      dialogTitle: 'Save New Video Assembly'
    });
    
    if (!filePath) {
      return null;
    }
    
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
  listTemplatesWithMetadata,
  createVideoAssemblyFromTemplate
};
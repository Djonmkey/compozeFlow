const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Generate a UUID
exports.generateUUID = () => {
  return crypto.randomUUID();
};

// Helper to check if a file exists
exports.fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

// Helper to clean up test files
exports.cleanupTestFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Helper to get the path to the video_assemblies directory
exports.getVideoAssembliesDir = () => {
  // Check if video_assemblies directory exists in the project root
  const rootDir = path.join(__dirname, '..');
  const videoAssembliesDir = path.join(rootDir, 'video_assemblies');
  
  // Create the directory if it doesn't exist
  if (!fs.existsSync(videoAssembliesDir)) {
    fs.mkdirSync(videoAssembliesDir, { recursive: true });
  }
  
  return videoAssembliesDir;
};

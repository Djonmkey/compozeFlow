/**
 * preload-sourcemap.js
 * 
 * This preload script enables sourcemap support for the Electron renderer process.
 * It installs the source-map-support module which provides sourcemap support for stack traces.
 */

// Install source map support
process.once('loaded', () => {
  try {
    // Try to find the source-map-support module in various locations
    let sourceMapSupport;
    try {
      // Try to require from the app's node_modules
      sourceMapSupport = require('source-map-support');
    } catch (e) {
      try {
        // Try to require from the absolute path
        sourceMapSupport = require(require('path').join(process.cwd(), 'node_modules', 'source-map-support'));
      } catch (e2) {
        console.error('Could not find source-map-support module:', e2);
        return;
      }
    }
    
    // Install source map support
    sourceMapSupport.install({
      handleUncaughtExceptions: true,
      environment: 'node',
      hookRequire: true
    });
    
    // Make it available globally
    global.sourceMapSupport = sourceMapSupport;
    
    console.log('Source map support installed successfully');
  } catch (error) {
    console.error('Failed to install source map support:', error);
  }
});
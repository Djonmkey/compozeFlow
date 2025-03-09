/**
 * build.js
 * 
 * Build script for the compozeFlow Electron application.
 * This script processes JavaScript files and generates sourcemaps.
 */

const { glob } = require('glob');
const { minify } = require('terser');
const fs = require('fs-extra');
const path = require('path');

// Configuration
const config = {
  // Files to process (all JS files except node_modules and dist)
  sourceGlob: './**/*.js',
  // Files to exclude
  excludePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    'build.js'
  ],
  // Output directory for processed files
  outputDir: './dist',
  // Terser options
  terserOptions: {
    compress: false,
    mangle: false,
    format: {
      beautify: true,
      comments: true
    },
    sourceMap: {
      filename: 'file.js',
      url: 'file.js.map'
    }
  }
};

// Ensure the output directory exists
fs.ensureDirSync(config.outputDir);

// Copy package.json to dist
fs.copySync('package.json', path.join(config.outputDir, 'package.json'));

// Copy HTML, CSS, and other non-JS files
async function copyNonJsFiles() {
  const nonJsFiles = await glob(['**/*.html', '**/*.css', '**/*.json', '**/*.png', '**/*.jpg', '**/*.svg'], {
    ignore: config.excludePatterns
  });

  for (const file of nonJsFiles) {
    const destPath = path.join(config.outputDir, file);
    fs.ensureDirSync(path.dirname(destPath));
    fs.copySync(file, destPath);
    console.log(`Copied: ${file} -> ${destPath}`);
  }
}

// Process JS files and generate sourcemaps
async function processJsFiles() {
  const jsFiles = await glob(config.sourceGlob, {
    ignore: config.excludePatterns
  });

  for (const file of jsFiles) {
    try {
      const code = fs.readFileSync(file, 'utf8');
      const destPath = path.join(config.outputDir, file);
      const destDir = path.dirname(destPath);
      
      // Ensure the destination directory exists
      fs.ensureDirSync(destDir);
      
      // Configure sourcemap options for this file
      const sourceMapOptions = {
        ...config.terserOptions,
        sourceMap: {
          filename: path.basename(file),
          url: `${path.basename(file)}.map`
        }
      };
      
      // Process the file with Terser
      const result = await minify(code, sourceMapOptions);
      
      // Write the processed JS file
      fs.writeFileSync(destPath, result.code);
      
      // Write the sourcemap file
      if (result.map) {
        fs.writeFileSync(`${destPath}.map`, result.map);
      }
      
      console.log(`Processed: ${file} -> ${destPath}`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
}

// Main build function
async function build() {
  console.log('Starting build process...');
  
  try {
    // Clean the output directory
    fs.emptyDirSync(config.outputDir);
    console.log(`Cleaned output directory: ${config.outputDir}`);
    
    // Copy non-JS files
    await copyNonJsFiles();
    
    // Process JS files
    await processJsFiles();
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Run the build
build();
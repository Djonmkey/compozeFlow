/**
 * searchDisplay.js
 *
 * Handles the display of the search functionality in the explorer area.
 */

const fs = require('fs');
const path = require('path');
const fileOccurrenceCounter = require('./fileOccurrenceCounter');

/**
 * Generates HTML for the search mode in the explorer area
 * @returns {string} HTML content for the search explorer
 */
function generateSearchHtml() {
    let html = '<div class="explorer-container search-mode">';
    
    // Add search header
    html += `
        <div class="explorer-search-header">
            <h3>Search</h3>
            <div class="explorer-global-search">
                <div class="explorer-search-bar">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="global-search-input" class="explorer-search-input" placeholder="Search across all content sources" />
                </div>
            </div>
        </div>
    `;
    
    // No search options - simplified version
    
    // Add search results container
    html += `
        <div class="search-results-container">
            <div class="search-results-placeholder">
                <p>Enter a search term to find files across all content sources.</p>
            </div>
            <div class="search-results" style="display: none;">
                <!-- Search results will be populated here -->
            </div>
        </div>
    `;
    
    html += '</div>';
    return html;
}

/**
 * Initializes the search mode with event handlers
 * @param {Object} videoAssemblyData - The video assembly data
 */
function initializeSearch(videoAssemblyData) {
    // Get the search input element
    const searchInput = document.getElementById('global-search-input');
    if (!searchInput) return;
    
    // Add input event listener for search
    searchInput.addEventListener('input', (event) => {
        const searchText = event.target.value.trim();
        if (searchText.length < 2) {
            // Hide results if search text is too short
            document.querySelector('.search-results-placeholder').style.display = '';
            document.querySelector('.search-results').style.display = 'none';
            return;
        }
        
        // Perform the search with default options
        performSearch(videoAssemblyData, searchText, {
            caseSensitive: false,
            wholeWord: false,
            useRegex: false,
            includeUnsupported: true
        });
    });
}

/**
 * Performs a search across all content sources
 * @param {Object} videoAssemblyData - The video assembly data
 * @param {string} searchText - The text to search for
 * @param {Object} options - Search options
 */
function performSearch(videoAssemblyData, searchText, options) {
    if (!videoAssemblyData || !videoAssemblyData.cut || !videoAssemblyData.cut.content_sources) {
        return;
    }
    
    // Get content sources
    const contentSources = videoAssemblyData.cut.content_sources;
    
    // Get supported file extensions
    const supportedExtensions = [];
    if (videoAssemblyData['composeflow.org']) {
        const cfData = videoAssemblyData['composeflow.org'];
        
        if (cfData.supported_video_file_extensions) {
            supportedExtensions.push(...cfData.supported_video_file_extensions);
        }
        
        if (cfData.supported_audio_file_extensions) {
            supportedExtensions.push(...cfData.supported_audio_file_extensions);
        }
        
        if (cfData.supported_image_file_extensions) {
            supportedExtensions.push(...cfData.supported_image_file_extensions);
        }
    }
    
    // Create a search pattern based on options
    let searchPattern;
    try {
        if (options.useRegex) {
            searchPattern = new RegExp(searchText, options.caseSensitive ? 'g' : 'gi');
        } else {
            let pattern = searchText;
            // Escape special regex characters
            pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            if (options.wholeWord) {
                pattern = `\\b${pattern}\\b`;
            }
            
            searchPattern = new RegExp(pattern, options.caseSensitive ? 'g' : 'gi');
        }
    } catch (error) {
        console.error('Invalid search pattern:', error);
        return;
    }
    
    // Show the search results container and hide the placeholder
    document.querySelector('.search-results-placeholder').style.display = 'none';
    const searchResultsContainer = document.querySelector('.search-results');
    searchResultsContainer.style.display = '';
    
    // Clear previous results
    searchResultsContainer.innerHTML = '<div class="search-status">Searching...</div>';
    
    // Start the search
    setTimeout(() => {
        let results = [];
        
        // Search in each content source
        contentSources.forEach(source => {
            const sourcePath = source.path;
            const includeSubpaths = source.include_subpaths;
            
            // Search in this content source
            const sourceResults = searchInDirectory(
                sourcePath,
                includeSubpaths,
                searchPattern,
                supportedExtensions,
                options.includeUnsupported
            );
            
            results = results.concat(sourceResults);
        });
        
        // Display the results
        displaySearchResults(searchResultsContainer, results, searchText, videoAssemblyData);
    }, 100); // Small delay to allow the UI to update
}

/**
 * Searches for files matching the pattern in a directory
 * @param {string} dirPath - The directory path to search in
 * @param {boolean} includeSubpaths - Whether to include subdirectories
 * @param {RegExp} searchPattern - The search pattern
 * @param {string[]} supportedExtensions - List of supported file extensions
 * @param {boolean} includeUnsupported - Whether to include unsupported files
 * @returns {Array} Array of search results
 */
function searchInDirectory(dirPath, includeSubpaths, searchPattern, supportedExtensions, includeUnsupported) {
    const results = [];
    
    try {
        if (!fs.existsSync(dirPath)) {
            return results;
        }
        
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        
        // Process files
        files.forEach(file => {
            const fullPath = path.join(dirPath, file.name);
            
            if (file.isDirectory() && includeSubpaths) {
                // Recursively search in subdirectories
                const subResults = searchInDirectory(
                    fullPath,
                    includeSubpaths,
                    searchPattern,
                    supportedExtensions,
                    includeUnsupported
                );
                
                results.push(...subResults);
            } else if (!file.isDirectory()) {
                // Check if file is supported
                const extension = path.extname(file.name).toLowerCase();
                const isSupported = supportedExtensions.includes(extension);
                
                if (isSupported || includeUnsupported) {
                    // Check if file name matches
                    const fileName = file.name.toLowerCase();
                    if (fileName.match(searchPattern)) {
                        results.push({
                            type: 'file',
                            path: fullPath,
                            name: file.name,
                            matches: [{
                                type: 'filename',
                                text: file.name
                            }],
                            isSupported
                        });
                    }
                    
                    // For text-based files, search in content
                    if (isTextFile(extension)) {
                        try {
                            const content = fs.readFileSync(fullPath, 'utf-8');
                            const contentMatches = findMatches(content, searchPattern);
                            
                            if (contentMatches.length > 0) {
                                // Check if we already have this file in results
                                const existingResult = results.find(r => r.path === fullPath);
                                
                                if (existingResult) {
                                    // Add content matches to existing result
                                    existingResult.matches.push(...contentMatches.map(match => ({
                                        type: 'content',
                                        text: match.text,
                                        line: match.line,
                                        column: match.column
                                    })));
                                } else {
                                    // Add new result
                                    results.push({
                                        type: 'file',
                                        path: fullPath,
                                        name: file.name,
                                        matches: contentMatches.map(match => ({
                                            type: 'content',
                                            text: match.text,
                                            line: match.line,
                                            column: match.column
                                        })),
                                        isSupported
                                    });
                                }
                            }
                        } catch (error) {
                            console.error(`Error reading file ${fullPath}:`, error);
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error(`Error searching in directory ${dirPath}:`, error);
    }
    
    return results;
}

/**
 * Checks if a file is a text file based on its extension
 * @param {string} extension - The file extension
 * @returns {boolean} True if the file is a text file
 */
function isTextFile(extension) {
    const textExtensions = [
        '.txt', '.json', '.xml', '.html', '.htm', '.css', '.js', '.ts',
        '.md', '.markdown', '.csv', '.log', '.yml', '.yaml', '.ini'
    ];
    
    return textExtensions.includes(extension);
}

/**
 * Finds matches of a pattern in text content
 * @param {string} content - The text content
 * @param {RegExp} pattern - The search pattern
 * @returns {Array} Array of matches with context
 */
function findMatches(content, pattern) {
    const matches = [];
    const lines = content.split('\n');
    
    lines.forEach((line, lineIndex) => {
        // Create a new RegExp with the same pattern and flags to reset lastIndex
        const regex = new RegExp(pattern.source, pattern.flags);
        let match;
        
        while ((match = regex.exec(line)) !== null) {
            const column = match.index;
            const matchText = match[0];
            
            // Get context (up to 50 chars before and after)
            const start = Math.max(0, column - 50);
            const end = Math.min(line.length, column + matchText.length + 50);
            let context = line.substring(start, end);
            
            // Add ellipsis if we truncated the line
            if (start > 0) context = '...' + context;
            if (end < line.length) context += '...';
            
            matches.push({
                text: context,
                line: lineIndex + 1,
                column: column + 1
            });
            
            // If the regex is not global, break to avoid infinite loop
            if (!regex.global) break;
        }
    });
    
    return matches;
}

/**
 * Displays search results in the container
 * @param {Element} container - The container element
 * @param {Array} results - The search results
 * @param {string} searchText - The search text
 * @param {Object} videoAssemblyData - The video assembly data for file type detection
 */
function displaySearchResults(container, results, searchText, videoAssemblyData) {
    // Get dismissed files
    const dismissedFiles = videoAssemblyData.cut && videoAssemblyData.cut.dismissed_files ?
        videoAssemblyData.cut.dismissed_files : [];
        
    // Get file occurrence counts
    const occurrenceCounts = fileOccurrenceCounter.countFileOccurrences(videoAssemblyData);
    if (results.length === 0) {
        container.innerHTML = `<div class="search-status">No results found for "${searchText}"</div>`;
        return;
    }
    
    // Sort results by path
    results.sort((a, b) => a.path.localeCompare(b.path));
    
    // Group results by directory
    const groupedResults = {};
    results.forEach(result => {
        const dirPath = path.dirname(result.path);
        if (!groupedResults[dirPath]) {
            groupedResults[dirPath] = [];
        }
        groupedResults[dirPath].push(result);
    });
    
    // Build HTML for results
    let html = `<div class="search-status">${results.length} results found for "${searchText}"</div>`;
    
    // Add results by directory
    Object.keys(groupedResults).forEach(dirPath => {
        const dirResults = groupedResults[dirPath];
        const dirName = path.basename(dirPath);
        
        html += `
            <div class="search-result-group">
                <div class="search-result-group-header">
                    <span class="explorer-icon">📁</span>
                    <span class="explorer-name">${dirName}</span>
                    <span class="search-result-count">(${dirResults.length})</span>
                </div>
                <ul class="search-result-list">
        `;
        
        // Add each file in this directory
        dirResults.forEach(result => {
            const fileIcon = getFileIcon(result.name);
            const supportedClass = result.isSupported ? 'supported-file' : 'unsupported-file';
            
            // Check if the file is in the dismissed files list
            const isDismissed = dismissedFiles.some(dismissedFile => dismissedFile.path === result.path);
            const dismissedClass = isDismissed ? 'dismissed' : '';
            
            // Check if the file has occurrences in the video assembly
            const occurrenceCount = occurrenceCounts[result.path] || 0;
            const occurrenceDisplay = occurrenceCount > 0 ? `<span class="occurrence-count">(${occurrenceCount})</span>` : '';
            
            html += `
                <li class="search-result-item ${supportedClass} ${dismissedClass}" data-path="${result.path}">
                    <div class="search-result-file">
                        <span class="explorer-icon">${fileIcon}</span>
                        <span class="explorer-name">${result.name}</span>
                        ${occurrenceDisplay}
                    </div>
            `;
            
            // Add matches
            if (result.matches.length > 0) {
                html += '<ul class="search-match-list">';
                
                result.matches.forEach(match => {
                    if (match.type === 'filename') {
                        html += `
                            <li class="search-match">
                                <span class="search-match-type">File name match</span>
                            </li>
                        `;
                    } else {
                        html += `
                            <li class="search-match">
                                <span class="search-match-location">Line ${match.line}:</span>
                                <span class="search-match-text">${escapeHtml(match.text)}</span>
                            </li>
                        `;
                    }
                });
                
                html += '</ul>';
            }
            
            html += '</li>';
        });
        
        html += `
                </ul>
            </div>
        `;
    });
    
    // Update the container
    container.innerHTML = html;
    
    // Add click event listeners for search results
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const filePath = item.getAttribute('data-path');
            console.log(`Search result clicked: ${filePath}`);
            
            // Import the fileTabsDisplay module
            const fileTabsDisplay = require('./fileTabsDisplay');
            
            // Add a tab for the selected file
            fileTabsDisplay.addFileTab(filePath, videoAssemblyData);
            
            // Update the terminal with a message
            const terminal = document.getElementById('terminal');
            terminal.innerHTML += `<p>File selected from search: ${filePath}</p>`;
        });
    });
}

/**
 * Gets an icon for a file based on its extension
 * @param {string} fileName - The file name
 * @returns {string} The icon character
 */
function getFileIcon(fileName) {
    const extension = path.extname(fileName).toLowerCase();
    
    if (['.mp4', '.mov', '.avi', '.mkv'].includes(extension)) {
        return '🎬'; // Video files
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
        return '🖼️'; // Image files
    } else if (['.mp3', '.wav', '.aac', '.flac'].includes(extension)) {
        return '🔊'; // Audio files
    } else if (['.json', '.xml', '.yaml'].includes(extension)) {
        return '📋'; // Data files
    }
    
    return '📄'; // Default file icon
}

/**
 * Escapes HTML special characters
 * @param {string} text - The text to escape
 * @returns {string} The escaped text
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Add CSS for search mode
const searchStyle = document.createElement('style');
searchStyle.textContent = `
    .search-mode {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    
    .explorer-search-header {
        padding: 10px;
        border-bottom: 1px solid #ddd;
    }
    
    .explorer-search-header h3 {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #555;
    }
    
    .explorer-global-search {
        margin-bottom: 10px;
    }
    
    .search-results-container {
        flex: 1;
        overflow: auto;
        padding: 10px;
    }
    
    .search-results-placeholder {
        color: #888;
        font-style: italic;
        text-align: center;
        margin-top: 20px;
    }
    
    .search-status {
        font-size: 12px;
        color: #555;
        margin-bottom: 10px;
        padding: 5px;
        background-color: #f5f5f5;
        border-radius: 4px;
    }
    
    .search-result-group {
        margin-bottom: 15px;
    }
    
    .search-result-group-header {
        display: flex;
        align-items: center;
        padding: 5px;
        background-color: #e0e0e0;
        border-radius: 4px 4px 0 0;
    }
    
    .search-result-count {
        margin-left: 5px;
        font-size: 12px;
        color: #666;
    }
    
    .search-result-list {
        list-style-type: none;
        padding: 0;
        margin: 0;
        border: 1px solid #e0e0e0;
        border-top: none;
        border-radius: 0 0 4px 4px;
    }
    
    .search-result-item {
        padding: 5px;
        border-bottom: 1px solid #eee;
    }
    
    .search-result-item:last-child {
        border-bottom: none;
    }
    
    .search-result-file {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 2px 0;
    }
    
    .search-result-file:hover {
        background-color: #f0f0f0;
    }
    
    .search-match-list {
        list-style-type: none;
        padding: 0;
        margin: 5px 0 0 20px;
        font-size: 12px;
        border-left: 2px solid #ddd;
        padding-left: 10px;
    }
    
    .search-match {
        margin: 5px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .search-match-location {
        color: #666;
        margin-right: 5px;
    }
    
    .search-match-text {
        font-family: monospace;
    }
    
    .search-match-type {
        font-style: italic;
        color: #666;
    }
    
    /* Dismissed files styling */
    .search-result-item.dismissed .explorer-name {
        text-decoration: line-through;
        color: #888;
    }
    
    /* Occurrence count styling */
    .occurrence-count {
        font-size: 12px;
        color: #0066cc;
        margin-left: 5px;
        font-weight: bold;
    }
`;
document.head.appendChild(searchStyle);

module.exports = {
    generateSearchHtml,
    initializeSearch
};
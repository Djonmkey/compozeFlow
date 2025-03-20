/**
 * contentSources/fileFilters.js
 * 
 * Functions for filtering and searching files in the content sources display.
 */

/**
 * Filters files in the explorer based on search text
 * @param {Element} section - The explorer section element
 * @param {string} searchText - The text to search for (lowercase)
 */
function filterFilesBySearch(section, searchText) {
    // Get all file and directory elements in this section
    const fileItems = section.querySelectorAll('.explorer-file');
    const dirItems = section.querySelectorAll('.explorer-directory');
    
    // If search is empty, show all items
    if (!searchText) {
        fileItems.forEach(item => item.style.display = '');
        dirItems.forEach(item => item.style.display = '');
        return;
    }
    
    // Track which directories contain matching files
    const dirsWithMatches = new Set();
    
    // Check each file
    fileItems.forEach(item => {
        const nameElement = item.querySelector('.explorer-name');
        const fileName = nameElement.textContent.toLowerCase();
        
        if (fileName.includes(searchText)) {
            item.style.display = ''; // Show matching file
            
            // Find all parent directories and mark them as containing matches
            let parent = item.parentElement;
            while (parent && !parent.classList.contains('explorer-section-content')) {
                if (parent.parentElement && parent.parentElement.classList.contains('explorer-directory')) {
                    dirsWithMatches.add(parent.parentElement);
                }
                parent = parent.parentElement;
            }
        } else {
            item.style.display = 'none'; // Hide non-matching file
        }
    });
    
    // Process directories
    dirItems.forEach(dir => {
        const nameElement = dir.querySelector('.explorer-name');
        const dirName = nameElement.textContent.toLowerCase();
        
        if (dirName.includes(searchText) || dirsWithMatches.has(dir)) {
            dir.style.display = ''; // Show directory if it matches or contains matching files
            
            // If directory name matches, show all its children
            if (dirName.includes(searchText)) {
                dir.querySelectorAll('.explorer-file, .explorer-directory').forEach(child => {
                    child.style.display = '';
                });
            }
            
            // Expand directories with matches
            if (dirsWithMatches.has(dir) && !dir.classList.contains('expanded')) {
                dir.classList.add('expanded');
            }
            
            // Find all parent directories and mark them as containing matches
            let parent = dir.parentElement;
            while (parent && !parent.classList.contains('explorer-section-content')) {
                if (parent.parentElement && parent.parentElement.classList.contains('explorer-directory')) {
                    dirsWithMatches.add(parent.parentElement);
                    parent.parentElement.classList.add('expanded');
                }
                parent = parent.parentElement;
            }
        } else {
            dir.style.display = 'none'; // Hide non-matching directory
        }
    });
}

module.exports = {
    filterFilesBySearch
};
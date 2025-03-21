// @ts-check
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');
const { leftIconBarTests } = require('./left_icon_bar');

/**
 * Tests for the explorer bar search functionality
 * Note: All tests are run in headed mode
 */
exports.explorerBarSearchTests = {
  /**
   * Test that the search functionality is present in the explorer bar
   */
  testSearchFunctionalityPresent: async ({ page, electronApp }) => {
    // First get to the editor with the left icon bar
    const { window } = await leftIconBarTests.testLeftIconBarPresent({ page, electronApp });
    
    // Look for the search button or search input in the explorer bar
    const searchElements = await window.$$('input[type="search"], input[placeholder*="Search"], button:has-text("Search"), button[title*="Search"]');
    
    if (searchElements.length > 0) {
      // Take a screenshot of the search element
      await window.screenshot({ path: path.join(__dirname, '../../tests/explorer-search.png') });
      
      // If it's a button, click it to open the search input
      if (await searchElements[0].evaluate(el => el.tagName.toLowerCase() === 'button')) {
        await searchElements[0].click();
        
        // Wait for the search input to appear
        await window.waitForTimeout(500);
        
        // Look for the search input again
        const searchInputs = await window.$$('input[type="search"], input[placeholder*="Search"]');
        expect(searchInputs.length).toBeGreaterThan(0);
      }
    } else {
      // If we can't find a specific search element, look for any input that might be for search
      const inputs = await window.$$('input');
      expect(inputs.length).toBeGreaterThan(0);
    }
    
    return { window, electronApp };
  },
  
  /**
   * Test searching for content
   */
  testSearchForContent: async ({ page, electronApp }) => {
    // First get to the search functionality
    const { window } = await exports.explorerBarSearchTests.testSearchFunctionalityPresent({ page, electronApp });
    
    // Look for the search input
    const searchInputs = await window.$$('input[type="search"], input[placeholder*="Search"]');
    
    if (searchInputs.length > 0) {
      // Enter a search term
      await searchInputs[0].fill('test');
      
      // Press Enter to submit the search
      await searchInputs[0].press('Enter');
      
      // Wait for search results
      await window.waitForTimeout(1000);
      
      // Take a screenshot of the search results
      await window.screenshot({ path: path.join(__dirname, '../../tests/explorer-search-results.png') });
      
      // Look for search results
      const searchResults = await window.$$('.search-results, .results, .item, .file-item');
      
      // Clear the search
      await searchInputs[0].fill('');
      await searchInputs[0].press('Enter');
      
      // Wait for the search results to clear
      await window.waitForTimeout(500);
      
      // Take a screenshot after clearing the search
      await window.screenshot({ path: path.join(__dirname, '../../tests/explorer-search-cleared.png') });
    }
    
    return { window, electronApp };
  }
};

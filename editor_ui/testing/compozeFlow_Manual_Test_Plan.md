# compozeFlow Manual Test Plan

## Overview
This test plan outlines all actions that can be performed by an end-user in the compozeFlow application. The plan is organized by functional areas and provides step-by-step instructions for testing each feature.

## Application Launch and Setup

### 1. Application Launch
- [ ] Launch the compozeFlow application
- [ ] Verify the application window opens with the correct dimensions (1200x800)
- [ ] Verify the application title is "compozeFlow"
- [ ] Verify the UI elements are displayed correctly:
  - Left icon bar
  - Explorer panel
  - Main section with tabs
  - Terminal section at the bottom

## File Operations

### 2. Create New Video Assembly
- [ ] Click on "File" menu
- [ ] Select "New Video Assembly"
- [ ] Verify the template selector dialog appears
- [ ] Select a template from the dropdown
- [ ] Verify template information (title, subtitle) is displayed
- [ ] Enter a custom title
- [ ] Enter a custom subtitle
- [ ] Click "Save As" button
- [ ] Verify the save dialog appears
- [ ] Select a location and enter a filename
- [ ] Click "Save"
- [ ] Verify the new video assembly is created and loaded in the editor
- [ ] Verify the application title updates to include the video assembly title

### 3. Open Video Assembly
- [ ] Click on "File" menu
- [ ] Select "Open Video Assembly"
- [ ] Verify the file open dialog appears
- [ ] Navigate to a video assembly file (.json)
- [ ] Select the file and click "Open"
- [ ] Verify the video assembly loads correctly
- [ ] Verify the Timeline tab is active and displays the video assembly content
- [ ] Verify the explorer panel updates to show content sources

### 4. Save Video Assembly
- [ ] Make changes to the video assembly (e.g., update title, add/modify clips)
- [ ] Click on "File" menu
- [ ] Select "Save Video Assembly"
- [ ] Verify the file is saved without prompting for location (if previously saved)
- [ ] Verify a success message appears in the terminal

### 5. Save Video Assembly As
- [ ] Click on "File" menu
- [ ] Select "Save Video Assembly As"
- [ ] Verify the save dialog appears
- [ ] Select a new location and/or filename
- [ ] Click "Save"
- [ ] Verify the file is saved to the new location
- [ ] Verify the application now references the new file path
- [ ] Verify a success message appears in the terminal

### 6. Save Video Assembly As Template
- [ ] Open an existing video assembly
- [ ] Click on "File" menu
- [ ] Select "Save Video Assembly As Template"
- [ ] Verify the save dialog appears with the templates directory as the default location
- [ ] Enter a template name
- [ ] Click "Save"
- [ ] Verify the template is saved
- [ ] Verify a success message appears in the terminal

## UI Navigation and Interaction

### 7. Explorer Panel
- [ ] Verify the explorer panel shows content sources from the loaded video assembly
- [ ] Test the resize handle between the explorer and main section:
  - Drag left to decrease explorer width
  - Drag right to increase explorer width
  - Verify minimum width constraint (150px)
  - Verify maximum width constraint (500px)
- [ ] Click on files in the explorer
- [ ] Verify appropriate actions occur based on file type

### 8. Tab Navigation
- [ ] Click on each tab in the tabs container:
  - Timeline
  - Overlay Images
  - Mixed Audio
  - Output
  - General
  - Raw
- [ ] Verify the correct content is displayed for each tab
- [ ] Verify the active tab is visually highlighted

### 9. Terminal Section
- [ ] Test the resize handle between the editor content and terminal:
  - Drag up to increase terminal height
  - Drag down to decrease terminal height
  - Verify minimum height constraint (50px)
  - Verify maximum height constraint (80% of viewport)
- [ ] Verify terminal displays application messages and operation results

## Timeline Tab Operations

### 10. Timeline View
- [ ] Verify the Timeline tab displays segments and scenes from the video assembly
- [ ] Verify each segment shows:
  - Segment title
  - Render button
  - List of scenes
- [ ] Verify each scene shows:
  - Scene title (if available)
  - Render button
  - Table of clips with details (order, file, trim start, trim end, duration)

### 11. Segment Rendering
- [ ] Click on a segment's render button
- [ ] Verify the application updates the video assembly data to render only that segment
- [ ] Verify the render process starts automatically
- [ ] Verify terminal output shows render progress
- [ ] Verify render completes successfully

### 12. Scene Rendering
- [ ] Click on a scene's render button
- [ ] Verify the application updates the video assembly data to render only that scene
- [ ] Verify the render process starts automatically
- [ ] Verify terminal output shows render progress
- [ ] Verify render completes successfully

## Overlay Images Tab Operations

### 13. Overlay Images View
- [ ] Click on the "Overlay Images" tab
- [ ] Verify the tab displays overlay images for each segment
- [ ] Verify each overlay image shows:
  - Image preview (if available)
  - File path
  - Controls for editing overlay properties

### 14. Overlay Image Editing
- [ ] Test adding a new overlay image
- [ ] Test removing an existing overlay image
- [ ] Test modifying overlay image properties
- [ ] Verify changes are saved when clicking save buttons

## Mixed Audio Tab Operations

### 15. Mixed Audio View
- [ ] Click on the "Mixed Audio" tab
- [ ] Verify the tab displays audio clips for each segment/scene
- [ ] Verify each audio entry shows:
  - Audio file path
  - Volume control
  - Other audio properties

### 16. Audio Editing
- [ ] Test adjusting volume for audio clips
- [ ] Test adding new audio clips
- [ ] Test removing existing audio clips
- [ ] Verify changes are saved when clicking save buttons

## Output Tab Operations

### 17. Output Settings View
- [ ] Click on the "Output" tab
- [ ] Verify the tab displays three sections:
  - Output Paths
  - High Quality Render Settings
  - Quick Render Settings

### 18. Output Paths
- [ ] Verify the output paths section shows:
  - Video Output Path field
  - Segment/Scene Output Path field
  - Clip Output Path field
  - Browse buttons for each path
  - Save Output Paths button
- [ ] Test the Browse button for Video Output Path:
  - Click "Browse..."
  - Select a directory
  - Verify the path updates in the field
- [ ] Test the Browse button for Segment/Scene Output Path
- [ ] Test the Browse button for Clip Output Path
- [ ] Click "Save Output Paths" button
- [ ] Verify paths are saved and a confirmation message appears in the terminal

### 19. High Quality Render Settings
- [ ] Verify the high quality render settings section shows:
  - Aspect Ratio field
  - FPS field
  - Width field
  - Height field
  - Video Codec field
  - Quality Preset dropdown
  - Threads field
  - Audio Codec field
  - Save High Quality Settings button
- [ ] Test modifying each setting
- [ ] Click "Save High Quality Settings" button
- [ ] Verify settings are saved and a confirmation message appears in the terminal

### 20. Quick Render Settings
- [ ] Verify the quick render settings section shows:
  - Aspect Ratio field
  - FPS field
  - Width field
  - Height field
  - Video Codec field
  - Quality Preset dropdown
  - Threads field
  - Audio Codec field
  - Save Quick Render Settings button
- [ ] Test modifying each setting
- [ ] Click "Save Quick Render Settings" button
- [ ] Verify settings are saved and a confirmation message appears in the terminal

## General Tab Operations

### 21. General Settings View
- [ ] Click on the "General" tab
- [ ] Verify the tab displays general video assembly properties:
  - Title
  - Subtitle
  - Description
  - Other metadata
- [ ] Test editing the title
- [ ] Test editing the subtitle
- [ ] Test editing other fields
- [ ] Verify changes are saved when clicking save buttons

## Raw Tab Operations

### 22. Raw JSON View
- [ ] Click on the "Raw" tab
- [ ] Verify the tab displays the raw JSON content of the video assembly
- [ ] Verify the JSON is properly formatted and readable

## Render Operations

### 23. Render Button
- [ ] Locate the render button above the tabs
- [ ] Click the render button
- [ ] Verify the render process starts
- [ ] Verify the render button changes to a stop button
- [ ] Verify terminal output shows render progress
- [ ] Verify render completes successfully
- [ ] Verify the render button returns to its original state

### 24. Stop Render
- [ ] Start a render process
- [ ] Click the stop button (changed render button)
- [ ] Verify the render process stops
- [ ] Verify a message appears in the terminal
- [ ] Verify the button returns to its original state

### 25. Render Quality Toggle
- [ ] Locate the render quality toggle (Quick/High)
- [ ] Click to switch between Quick and High quality
- [ ] Verify the toggle visually updates
- [ ] Verify related checkboxes update accordingly:
  - When High Quality is selected: watermark and caching are unchecked
  - When Quick Render is selected: watermark and caching are checked
- [ ] Verify changes are saved to the video assembly

### 26. Render Option Checkboxes
- [ ] Test the "Include Source File Watermark" checkbox:
  - Toggle on and off
  - Verify changes are saved
- [ ] Test the "Render Each Clip Individually" checkbox:
  - Toggle on and off
  - Verify changes are saved
- [ ] Test the "Enable Render Caching" checkbox:
  - Toggle on and off
  - Verify changes are saved

## Icon Bar Operations

### 27. Explorer Icon
- [ ] Click on the explorer icon (📁)
- [ ] Verify appropriate action occurs

### 28. Search Icon
- [ ] Click on the search icon (🔍)
- [ ] Verify appropriate action occurs

### 29. Plugins Icon
- [ ] Click on the plugins icon (🧩)
- [ ] Verify plugins interface appears
- [ ] Test plugin management operations:
  - View available plugins
  - Install plugins
  - Uninstall plugins
  - Configure plugins

### 30. Account Icon
- [ ] Click on the account icon (👤)
- [ ] Verify account interface appears
- [ ] Test account operations (if implemented)

### 31. Settings Icon
- [ ] Click on the settings icon (⚙)
- [ ] Verify settings interface appears
- [ ] Test modifying application settings

## Error Handling

### 32. Invalid File Operations
- [ ] Attempt to open a non-JSON file
- [ ] Verify appropriate error message appears
- [ ] Attempt to open an invalid JSON file (not a video assembly)
- [ ] Verify appropriate error message appears

### 33. Render Errors
- [ ] Create conditions for render failure (e.g., invalid paths)
- [ ] Start render process
- [ ] Verify appropriate error messages appear in the terminal
- [ ] Verify the render button indicates failure state

### 34. Path Validation
- [ ] Enter invalid paths in output path fields
- [ ] Verify appropriate validation or error messages appear

## Performance and Stability

### 35. Large File Handling
- [ ] Open a large video assembly file with many segments and clips
- [ ] Verify the application remains responsive
- [ ] Verify all content loads correctly

### 36. Long Render Process
- [ ] Start a render process for a large video assembly
- [ ] Verify the application remains responsive during rendering
- [ ] Verify terminal updates with progress information
- [ ] Verify successful completion of the render

## Application Exit

### 37. Application Close
- [ ] Click the close button on the application window
- [ ] Verify the application closes properly
- [ ] If there are unsaved changes, verify a prompt appears asking to save

## Notes
- This test plan should be executed on all supported platforms (Windows, macOS)
- Document any unexpected behavior or issues encountered during testing
- For each test case, record the actual result and whether it passed or failed
# CompozeFlow Playwright Tests

This directory contains automated tests for the CompozeFlow application using Playwright.

## Test Structure

The tests are organized into two main groups:

1. **Smoke Tests**: Basic tests that verify core functionality is working.
2. **Regression Tests**: Comprehensive tests that verify all aspects of the application.

The tests are further organized by feature area:

- `welcome_screen`: Tests for the welcome screen
- `create_new_video_assembly_dialog`: Tests for the new video assembly dialog
- `left_icon_bar`: Tests for the left icon bar
- `explorer_bar_content_sources`: Tests for the content sources panel
- `explorer_bar_search`: Tests for the search functionality
- `file_menu`: Tests for the file menu
- `render_bar`: Tests for the render bar
- `tab_timeline`: Tests for the timeline tab
- `tab_file`: Tests for the file tab
- `tab_render`: Tests for the render tab
- `tab_overlay_images`: Tests for the overlay images tab
- `tab_mixed_audio`: Tests for the mixed audio tab
- `tab_output`: Tests for the output tab
- `tab_general`: Tests for the general tab
- `tab_raw`: Tests for the raw tab
- `integration_render_engine`: Tests for the integration with the render engine

## Directory Structure

```
tests/
├── modules/                  # Test modules for each feature area
│   ├── welcome_screen.js
│   ├── create_new_video_assembly_dialog.js
│   ├── left_icon_bar.js
│   ├── ...
├── smoke.spec.js             # Smoke test suite
├── regression.spec.js        # Regression test suite
├── README.md                 # This file
```

## Running Tests

All tests are configured to run in headed mode by default.

### Running Smoke Tests

To run the smoke tests:

```bash
npx playwright smoke --headed
```

This will run a subset of tests that verify core functionality.

### Running Regression Tests

To run the full regression test suite:

```bash
npx playwright regression --headed
```

This will run all tests to verify all aspects of the application.

## Test Implementation Details

Each test module exports a set of test functions that can be used by the smoke and regression test suites. This modular approach allows for:

1. **Reusability**: Test functions can be reused across different test suites.
2. **Maintainability**: Tests for each feature area are isolated in their own module.
3. **Flexibility**: Smoke tests can use a subset of the test functions, while regression tests can use all of them.

All tests include screenshots at key points to help with debugging and verification.

/**
 * featureFlags.js
 *
 * Contains feature flags for enabling/disabling various features in the application.
 * This allows for temporary disabling of features or gradual rollout of new functionality.
 */

// Feature flags
const FEATURE_FLAGS = {
  // Set to false to disable plugin functionality
  ENABLE_PLUGINS: false
};

// Export the feature flags
module.exports = {
  FEATURE_FLAGS
};
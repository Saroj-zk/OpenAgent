const { TrustEngine } = require('../trust-engine');

// Create a single instance to be used across the application
const trustEngine = new TrustEngine();

module.exports = trustEngine;

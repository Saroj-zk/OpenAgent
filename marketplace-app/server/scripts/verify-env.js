require('../config/loadEnv');
const { validateEnvironment } = require('../config/env');

try {
    const warnings = validateEnvironment();
    console.log('Environment validation passed.');
    warnings.forEach((warning) => console.warn(`Warning: ${warning}`));
} catch (error) {
    console.error(`Environment validation failed: ${error.message}`);
    process.exit(1);
}

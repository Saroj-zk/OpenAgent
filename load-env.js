const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

const rootDir = __dirname;
const localEnvPath = path.join(rootDir, '.env.local');
const envPath = path.join(rootDir, '.env');

if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
} else {
    dotenv.config({ path: envPath });
}

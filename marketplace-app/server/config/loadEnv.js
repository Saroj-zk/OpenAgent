const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

const serverRoot = path.join(__dirname, '..');
const localEnvPath = path.join(serverRoot, '.env.local');
const envPath = path.join(serverRoot, '.env');

if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
} else {
    dotenv.config({ path: envPath });
}

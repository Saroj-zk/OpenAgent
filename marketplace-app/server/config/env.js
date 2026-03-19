function getRequiredEnv(name) {
    const value = process.env[name];

    if (!value || !value.toString().trim()) {
        throw new Error(`${name} environment variable is required`);
    }

    return value.toString().trim();
}

function getOptionalEnv(name, fallback = '') {
    const value = process.env[name];
    return value && value.toString().trim() ? value.toString().trim() : fallback;
}

function getNumberEnv(name, fallback) {
    const value = process.env[name];
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function getBooleanEnv(name, fallback = false) {
    const value = process.env[name];
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    return ['1', 'true', 'yes', 'on'].includes(value.toString().trim().toLowerCase());
}

function looksLikePlaceholder(value) {
    const normalized = (value || '').toString().trim().toLowerCase();
    return (
        normalized.includes('replace-with') ||
        normalized.includes('your-') ||
        normalized.includes('<user>') ||
        normalized.includes('<password>') ||
        normalized.includes('<cluster>') ||
        normalized.includes('example.com')
    );
}

function isValidHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function isValidWsUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'ws:' || url.protocol === 'wss:';
    } catch {
        return false;
    }
}

function isValidMongoUri(value) {
    return /^mongodb(\+srv)?:\/\//i.test((value || '').toString().trim());
}

function isValidAddress(value) {
    return /^0x[a-fA-F0-9]{40}$/.test((value || '').toString().trim());
}

function validateEnvironment() {
    const isProduction = (process.env.NODE_ENV || '').toLowerCase() === 'production';
    const missing = ['JWT_SECRET'].filter((name) => !process.env[name] || !process.env[name].toString().trim());

    if (isProduction) {
        ['MONGO_URI', 'CONTRACT_ADDRESS', 'BASE_SEPOLIA_RPC', 'CORS_ORIGINS'].forEach((name) => {
            if (!process.env[name] || !process.env[name].toString().trim()) {
                missing.push(name);
            }
        });
    }

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    if (isProduction) {
        const invalid = [];

        if (!isValidMongoUri(process.env.MONGO_URI) || looksLikePlaceholder(process.env.MONGO_URI)) {
            invalid.push('MONGO_URI');
        }

        if (!isValidHttpUrl(process.env.BASE_URL) || looksLikePlaceholder(process.env.BASE_URL)) {
            invalid.push('BASE_URL');
        }

        if (!isValidHttpUrl(process.env.BASE_SEPOLIA_RPC) || looksLikePlaceholder(process.env.BASE_SEPOLIA_RPC)) {
            invalid.push('BASE_SEPOLIA_RPC');
        }

        if (!isValidAddress(process.env.CONTRACT_ADDRESS) || looksLikePlaceholder(process.env.CONTRACT_ADDRESS)) {
            invalid.push('CONTRACT_ADDRESS');
        }

        if (process.env.SUBSCRIPTIONS_ADDRESS && (!isValidAddress(process.env.SUBSCRIPTIONS_ADDRESS) || looksLikePlaceholder(process.env.SUBSCRIPTIONS_ADDRESS))) {
            invalid.push('SUBSCRIPTIONS_ADDRESS');
        }

        if (process.env.WSS_URL && (!isValidWsUrl(process.env.WSS_URL) || looksLikePlaceholder(process.env.WSS_URL))) {
            invalid.push('WSS_URL');
        }

        if (looksLikePlaceholder(process.env.JWT_SECRET)) {
            invalid.push('JWT_SECRET');
        }

        const origins = (process.env.CORS_ORIGINS || '')
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean);
        if (origins.length === 0 || origins.some((origin) => !isValidHttpUrl(origin) || looksLikePlaceholder(origin))) {
            invalid.push('CORS_ORIGINS');
        }

        if (process.env.S3_PUBLIC_URL && (!isValidHttpUrl(process.env.S3_PUBLIC_URL) || looksLikePlaceholder(process.env.S3_PUBLIC_URL))) {
            invalid.push('S3_PUBLIC_URL');
        }

        if (invalid.length > 0) {
            throw new Error(`Invalid production environment values: ${invalid.join(', ')}`);
        }
    }

    const storageVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME'];
    const configuredStorageVars = storageVars.filter((name) => Boolean(process.env[name]));
    if (configuredStorageVars.length > 0 && configuredStorageVars.length < storageVars.length) {
        throw new Error(`Incomplete S3 configuration. Set all of: ${storageVars.join(', ')}`);
    }

    const warnings = [];
    if (!process.env.WSS_URL) {
        warnings.push('WSS_URL is not set; realtime indexing will use HTTP polling only.');
    }
    if (!process.env.ADMIN_PRIVATE_KEY) {
        warnings.push('ADMIN_PRIVATE_KEY is not set; on-chain trust sync and admin actions will be limited.');
    }
    if (configuredStorageVars.length === 0) {
        warnings.push('S3 storage is not configured; production uploads will be rejected.');
    }

    return warnings;
}

module.exports = {
    getRequiredEnv,
    getOptionalEnv,
    getNumberEnv,
    getBooleanEnv,
    validateEnvironment
};

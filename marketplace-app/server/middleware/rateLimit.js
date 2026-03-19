function createRateLimiter({ windowMs, max, message }) {
    const hits = new Map();

    const cleanupInterval = Math.max(windowMs, 60_000);
    setInterval(() => {
        const cutoff = Date.now() - windowMs;
        for (const [key, timestamps] of hits.entries()) {
            const recentHits = timestamps.filter((timestamp) => timestamp > cutoff);
            if (recentHits.length === 0) {
                hits.delete(key);
            } else {
                hits.set(key, recentHits);
            }
        }
    }, cleanupInterval).unref();

    return function rateLimit(req, res, next) {
        const now = Date.now();
        const key = `${req.ip || 'unknown'}:${req.baseUrl || ''}:${req.path || ''}`;
        const windowStart = now - windowMs;
        const timestamps = hits.get(key) || [];
        const recentHits = timestamps.filter((timestamp) => timestamp > windowStart);

        if (recentHits.length >= max) {
            const retryAfterSeconds = Math.max(1, Math.ceil((recentHits[0] + windowMs - now) / 1000));
            res.setHeader('Retry-After', retryAfterSeconds.toString());
            return res.status(429).json({ error: message });
        }

        recentHits.push(now);
        hits.set(key, recentHits);
        next();
    };
}

module.exports = { createRateLimiter };

const http = require('http');

const port = process.env.PORT || 3001;
const path = process.env.HEALTHCHECK_PATH || '/readyz';

const request = http.get(
    {
        hostname: '127.0.0.1',
        port,
        path,
        timeout: 4000
    },
    (response) => {
        response.resume();
        response.on('end', () => {
            process.exit(response.statusCode === 200 ? 0 : 1);
        });
    }
);

request.on('timeout', () => {
    request.destroy(new Error('Healthcheck timed out'));
});

request.on('error', (error) => {
    console.error(`Healthcheck failed: ${error.message}`);
    process.exit(1);
});

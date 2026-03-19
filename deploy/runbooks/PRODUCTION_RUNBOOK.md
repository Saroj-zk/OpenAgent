# Production Runbook

## Pre-Deploy

1. Complete the checklist in [SECRET_ROTATION_CHECKLIST.md](/C:/Users/Admin/Downloads/Code%20Works/SAW/deploy/runbooks/SECRET_ROTATION_CHECKLIST.md).
2. Populate deployment secrets using:
   - [marketplace-app/server/.env.example](/C:/Users/Admin/Downloads/Code%20Works/SAW/marketplace-app/server/.env.example)
   - [marketplace-app/.env.example](/C:/Users/Admin/Downloads/Code%20Works/SAW/marketplace-app/.env.example)
   - [admin-portal/.env.example](/C:/Users/Admin/Downloads/Code%20Works/SAW/admin-portal/.env.example)
3. Keep machine-local developer values in ignored `.env.local` files only.
4. Verify DNS is ready for the app domain and admin portal domain.
5. Install Docker, Docker Compose, and Nginx on the target host.

## First-Time Server Setup

1. Copy the repo to `/opt/saw`.
2. Install the reverse-proxy config from [deploy/nginx/saw.conf](/C:/Users/Admin/Downloads/Code%20Works/SAW/deploy/nginx/saw.conf).
3. Adjust domain names and certificate paths in that config.
4. Reload Nginx.
5. Optionally install the systemd unit from [deploy/systemd/saw-app.service](/C:/Users/Admin/Downloads/Code%20Works/SAW/deploy/systemd/saw-app.service).

## Deploy

1. Export production secrets into the shell or your `.env` file used by Docker Compose.
2. Run `docker compose -f docker-compose.production.yml up -d --build`.
3. Wait for the container healthcheck to report healthy.

## Smoke Tests

1. `GET /health` returns `200`.
2. `GET /readyz` returns `200`.
3. Marketplace loads from the public domain.
4. Admin portal loads from `/portal`.
5. Web3 login nonce route works.
6. A test purchase and dispute sync both record in MongoDB.

## Rollback

1. Deploy the previous known-good image tag.
2. Restart the stack with `docker compose -f docker-compose.production.yml up -d`.
3. Re-run smoke tests.

## Post-Deploy Monitoring

Watch for:

- repeated `429` bursts in auth routes
- Mongo connection failures
- indexer startup warnings
- missing S3 configuration warnings
- dispute sync failures

# SAW Deployment Guide

## Immediate Security Action

This repository currently contains committed secret-bearing `.env` files. Before any public deployment:

1. Rotate every exposed secret and private key.
2. Remove secrets from tracked Git history outside this patch.
3. Use the new `.env.example` files as templates instead of committing real values.
4. For local development, keep real values in ignored `.env.local` files instead of tracked `.env` files.

## Recommended Production Path

Use the root Docker build in [Dockerfile.production](/C:/Users/Admin/Downloads/Code%20Works/SAW/Dockerfile.production) with [docker-compose.production.yml](/C:/Users/Admin/Downloads/Code%20Works/SAW/docker-compose.production.yml).

Reverse proxy and host service templates are available in:

- [deploy/nginx/saw.conf](/C:/Users/Admin/Downloads/Code%20Works/SAW/deploy/nginx/saw.conf)
- [deploy/systemd/saw-app.service](/C:/Users/Admin/Downloads/Code%20Works/SAW/deploy/systemd/saw-app.service)

Operational runbooks are available in:

- [deploy/runbooks/SECRET_ROTATION_CHECKLIST.md](/C:/Users/Admin/Downloads/Code%20Works/SAW/deploy/runbooks/SECRET_ROTATION_CHECKLIST.md)
- [deploy/runbooks/PRODUCTION_RUNBOOK.md](/C:/Users/Admin/Downloads/Code%20Works/SAW/deploy/runbooks/PRODUCTION_RUNBOOK.md)
- [deploy/runbooks/GIT_HISTORY_CLEANUP.md](/C:/Users/Admin/Downloads/Code%20Works/SAW/deploy/runbooks/GIT_HISTORY_CLEANUP.md)

## Required Environment Variables

Application/runtime:

- `NODE_ENV=production`
- `PORT`
- `BASE_URL`
- `CORS_ORIGINS`
- `MONGO_URI`
- `JWT_SECRET`

Blockchain:

- `BASE_SEPOLIA_RPC`
- `CONTRACT_ADDRESS`
- `SUBSCRIPTIONS_ADDRESS`
- `WSS_URL` recommended
- `ADMIN_PRIVATE_KEY` recommended for trust sync and admin on-chain actions

Uploads/storage:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `AWS_REGION`
- `S3_PUBLIC_URL` optional
- `S3_ENDPOINT` optional for S3-compatible providers

## Build And Run

1. Copy values from [marketplace-app/server/.env.example](/C:/Users/Admin/Downloads/Code%20Works/SAW/marketplace-app/server/.env.example) and [marketplace-app/.env.example](/C:/Users/Admin/Downloads/Code%20Works/SAW/marketplace-app/.env.example) into your deployment secret store.
2. Export the required variables in your shell or CI/CD environment.
3. Run `docker compose -f docker-compose.production.yml up --build -d`.
4. Confirm `GET /health` and `GET /readyz` both succeed.

## Runtime Protections Added

- Env validation at startup
- API and auth rate limiting
- Security response headers
- Readiness and health endpoints
- Docker healthcheck support
- Production upload guard that rejects missing S3 config

## Notes

- The frontend now supports `VITE_API_URL` so it can point at a dedicated API domain when needed.
- The server image builds and includes both the marketplace app and the admin portal bundles.
- If `WSS_URL` is missing, the indexer still works, but it falls back to HTTP polling.

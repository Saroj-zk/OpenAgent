# Security Policy

## Reporting

Do not open public issues for security vulnerabilities or exposed secrets.

Report privately to the project maintainers using your internal security contact path or private repository security reporting.

## Secret Handling Rules

- Never commit real `.env` values.
- Use tracked `*.env.example` files for templates only.
- Keep real developer values in ignored `.env.local` files.
- Rotate any secret immediately if it appears in Git history, logs, or screenshots.

## Deployment Security Requirements

- `JWT_SECRET` must be unique and at least 32 characters.
- Production secrets must come from your host or CI secret store.
- MongoDB credentials must be unique to this environment.
- Blockchain admin keys must be dedicated to the environment and rotated if exposed.
- Enable the secret scanning workflow before merging release changes.

## Pre-Launch Checklist

- Secret rotation completed
- Git history cleaned
- CI secret scanning enabled
- Production smoke tests passed
- Monitoring and alerts configured

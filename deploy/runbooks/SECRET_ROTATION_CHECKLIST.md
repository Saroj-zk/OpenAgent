# Secret Rotation Checklist

## Scope

The repository has contained committed secret-bearing files. Treat the following as exposed until rotated:

- Root deployer private key from tracked `.env`
- Server admin private key from tracked server `.env`
- JWT secret from tracked server `.env`
- Database credentials from tracked server `.env`
- Any cloud storage credentials in tracked or shared env files

## Rotate First

1. Replace MongoDB user password and update `MONGO_URI`.
2. Generate a new `JWT_SECRET` with at least 32 random characters.
3. Replace `ADMIN_PRIVATE_KEY`.
4. Replace the root contract deployer `PRIVATE_KEY`.
5. Rotate S3 or object-storage credentials if they were ever added locally or remotely.

## After Key Rotation

1. Invalidate all active sessions by redeploying with the new `JWT_SECRET`.
2. Update deployment secrets in your hosting platform or CI system.
3. Confirm the new secrets are not stored in repo-tracked files.
4. Store any developer-local values in ignored `.env.local` files only.

## Remove Secrets From Git History

Recommended tools:

- `git filter-repo`
- BFG Repo-Cleaner

Minimum files to purge from history:

- `.env`
- `marketplace-app/.env`
- `marketplace-app/server/.env`

## Verification Steps

1. Run `git log -- .env marketplace-app/.env marketplace-app/server/.env`.
2. Run a secret scanner on the repo history.
3. Confirm only `.env.example` files remain tracked.
4. Redeploy using environment-managed secrets only.

## Production Completion Criteria

- All exposed secrets rotated
- Git history cleaned
- CI/CD secrets updated
- Fresh deploy completed successfully

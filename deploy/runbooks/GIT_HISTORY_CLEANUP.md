# Git History Cleanup Runbook

## Warning

This process rewrites Git history and requires a force push. Coordinate with everyone using the repository before running it.

## Files To Purge

- `.env`
- `marketplace-app/.env`
- `marketplace-app/server/.env`

## Recommended Tool

Use `git filter-repo`.

## Example Flow

1. Create a full backup clone of the repository.
2. Ensure all real secrets have already been rotated.
3. Install `git-filter-repo`.
4. Run a history purge for the three env files.
5. Force-push the rewritten branches and tags.
6. Ask all collaborators to reclone or hard-reset to the rewritten history.

## Example Commands

```bash
git filter-repo --path .env --path marketplace-app/.env --path marketplace-app/server/.env --invert-paths
git push --force --all
git push --force --tags
```

## After The Rewrite

1. Re-run secret scanning.
2. Verify only sanitized tracked env files remain.
3. Reconfirm deployments use `.env.local` or hosted secret stores only.

# Vercel Deployment Fix - pnpm Lockfile Issue

## Problem
Vercel deployment failed with:
```
ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json
```

This occurs because new dependencies were added to `package.json` but the `pnpm-lock.yaml` file wasn't updated.

## Solution

### Option 1: Automatic Fix (via vercel.json configuration)
We have added `vercel.json` with a custom install command that will:
```json
{
  "buildCommand": "pnpm install --no-frozen-lockfile && next build",
  "installCommand": "pnpm install --no-frozen-lockfile"
}
```

**Action Required**: Push this file to your repository and redeploy.

### Option 2: Manual Fix (Recommended)
Follow these steps on your local machine:

#### Step 1: Update pnpm lockfile
```bash
cd your-project-directory
pnpm install
```

This will update `pnpm-lock.yaml` with all the new dependencies.

#### Step 2: Commit and push
```bash
git add pnpm-lock.yaml package.json
git commit -m "Update pnpm lockfile with new dependencies"
git push
```

#### Step 3: Redeploy on Vercel
- Go to your Vercel dashboard
- Trigger a new deployment or wait for automatic deployment on push

## What Changed
New dependencies were added to support the WISP Management System:
- `@prisma/client@^5.22.0` - Database ORM client
- `@prisma/cli@^5.22.0` - Prisma CLI tools
- `@auth/prisma-adapter@^2.4.0` - NextAuth Prisma adapter
- `next-auth@^5.0.0` - Authentication library
- `bcrypt@^5.1.1` - Password hashing
- `node-cron@^3.0.3` - Scheduled jobs
- `stripe@^15.0.0` - Payment processing
- `axios@^1.7.4` - HTTP client

## Configuration Files Added
- `vercel.json` - Custom build and install commands
- `.npmrc` - pnpm configuration settings

## Troubleshooting

### If Option 1 Still Fails
1. Ensure `vercel.json` is in the project root
2. Check that all files were pushed to Git
3. Try clearing Vercel cache: Settings → Git → Disconnect and reconnect

### If Option 2 Doesn't Work
```bash
# Clean install (removes node_modules)
rm -rf node_modules
pnpm install

# Or use pnpm store prune
pnpm store prune

# Then commit and push
```

## Next Steps After Fix
Once deployment succeeds:
1. Database migrations will run automatically
2. Create first admin user via: `POST /api/setup/create-admin`
3. Login at `/auth/signin`

---

**Last Updated**: 2024
**Related Files**: README.md, DEPLOYMENT.md, WISP_SYSTEM_GUIDE.md

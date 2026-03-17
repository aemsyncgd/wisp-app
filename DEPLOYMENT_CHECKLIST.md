# Deployment Checklist - WISP Management System

Use this checklist to ensure your deployment is successful.

## Pre-Deployment (Local Machine)

### Code & Dependencies
- [ ] All code changes committed to Git
- [ ] `pnpm install` executed successfully
- [ ] `pnpm-lock.yaml` is up to date with `package.json`
- [ ] No uncommitted changes (`git status` is clean)
- [ ] Repository pushed to GitHub/GitLab

### Environment Configuration
- [ ] `.env.local` created with all required variables
- [ ] Database credentials verified and working
- [ ] `NEXTAUTH_SECRET` generated with: `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` set correctly (http://localhost:3000 for dev)
- [ ] Optional services configured:
  - [ ] Stripe keys (if using payments)
  - [ ] MikroTik credentials (if using routers)
  - [ ] Email service (if using notifications)

### Testing
- [ ] Development server starts: `pnpm dev`
- [ ] Database migrations work: `npx prisma migrate dev`
- [ ] API endpoints respond: `curl http://localhost:3000/api/service-plans`
- [ ] Login page loads: http://localhost:3000/auth/signin

### Files Verification
- [ ] `vercel.json` exists in project root
- [ ] `.npmrc` exists in project root
- [ ] `.env.example` is up to date
- [ ] `.gitignore` excludes sensitive files
- [ ] All documentation files present:
  - [ ] README.md
  - [ ] WISP_SYSTEM_GUIDE.md
  - [ ] DEPLOYMENT.md
  - [ ] QUICK_FIX.md
  - [ ] VERCEL_DEPLOYMENT_FIX.md
  - [ ] DEPLOYMENT_RESOLUTION.md
  - [ ] DOCS_INDEX.md

## Vercel Setup

### Account & Project
- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel
- [ ] Project created in Vercel dashboard
- [ ] Correct branch selected (usually `main`)

### Build Settings
- [ ] Framework: Next.js
- [ ] Build Command: `npm run build` (auto-detected)
- [ ] Output Directory: `.next` (auto-detected)
- [ ] Install Command: `pnpm install` (auto-detected)

### Environment Variables
In Vercel Settings → Environment Variables, add:

#### Required
- [ ] `POSTGRES_PRISMA_URL` - Database connection string
- [ ] `POSTGRES_URL_NON_POOLING` - Non-pooling connection string
- [ ] `NEXTAUTH_SECRET` - Generated secret
- [ ] `NEXTAUTH_URL` - Production domain (https://your-app.vercel.app)

#### Optional (if using)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `MIKROTIK_IP`
- [ ] `MIKROTIK_PORT`
- [ ] `MIKROTIK_USERNAME`
- [ ] `MIKROTIK_PASSWORD`

### Domain (Optional)
- [ ] Custom domain configured (if using)
- [ ] SSL certificate provisioned
- [ ] DNS records updated (if using custom domain)

## First Deployment

### Deployment Process
- [ ] Trigger deployment from Vercel dashboard
- [ ] Monitor build logs in Vercel
- [ ] Check "Deployments" tab for "Ready" status
- [ ] No errors in build output

### Post-Deployment Verification
- [ ] Application loads: Visit your deployment URL
- [ ] Database migrations ran: Check Vercel Functions logs
- [ ] API responds: `curl https://your-app.vercel.app/api/service-plans`
- [ ] Login page works: Visit /auth/signin

### Creating Admin User
After deployment succeeds:

```bash
curl -X POST https://your-app.vercel.app/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "SecurePassword123!",
    "name": "System Administrator"
  }'
```

- [ ] Request succeeds (HTTP 200)
- [ ] Response contains admin ID
- [ ] Can login with created credentials

### Dashboard Access
- [ ] Navigate to https://your-app.vercel.app/auth/signin
- [ ] Login with admin credentials
- [ ] Dashboard loads without errors
- [ ] Can see metrics and system status

## If Errors Occur

### pnpm Lockfile Error
- [ ] Read [QUICK_FIX.md](./QUICK_FIX.md)
- [ ] Run `pnpm install` locally
- [ ] Commit `pnpm-lock.yaml`
- [ ] Push to repository
- [ ] Redeploy from Vercel

### Database Connection Error
- [ ] Verify connection string in Vercel env vars
- [ ] Check database is accessible from internet
- [ ] Run migrations manually (if needed)
- [ ] See [DEPLOYMENT.md](./DEPLOYMENT.md) → Troubleshooting

### Build Fails
- [ ] Check Vercel build logs
- [ ] Look for TypeScript errors
- [ ] Verify all env vars are set
- [ ] Check .env.example for required variables

### Application Won't Load
- [ ] Check browser console for errors
- [ ] Review Vercel Function logs
- [ ] Verify database connection
- [ ] Check that all API endpoints respond

## After Initial Deployment

### Monitoring
- [ ] Set up error tracking (Sentry, Rollbar, etc.)
- [ ] Enable database backups
- [ ] Configure uptime monitoring
- [ ] Set up alerting for failures

### Security
- [ ] Change default admin password
- [ ] Review authentication settings
- [ ] Enable HTTPS only (auto-enabled on Vercel)
- [ ] Set up audit logging review process
- [ ] Configure webhook secrets correctly

### Database
- [ ] Verify database backups are working
- [ ] Test backup restoration process
- [ ] Monitor database performance
- [ ] Set up connection pooling (if needed)

### Application
- [ ] Create service plans via admin panel
- [ ] Test customer creation workflow
- [ ] Verify invoice generation (cron jobs)
- [ ] Test payment processing (if using Stripe)
- [ ] Test MikroTik integration (if applicable)

## Ongoing Maintenance

### Regular Tasks
- [ ] Weekly: Check error logs and alerts
- [ ] Weekly: Verify backups completed
- [ ] Monthly: Review audit logs
- [ ] Monthly: Update dependencies (`pnpm update`)
- [ ] Quarterly: Security assessment

### Updates
- [ ] Monitor GitHub for security updates
- [ ] Keep Next.js updated
- [ ] Keep dependencies current
- [ ] Test updates in staging first

## Documentation

### Team Knowledge
- [ ] All team members read README.md
- [ ] Developers review WISP_SYSTEM_GUIDE.md
- [ ] DevOps reviews DEPLOYMENT.md
- [ ] On-call engineer has QUICK_FIX.md bookmarked

### Runbooks Created
- [ ] Emergency response procedures
- [ ] Incident response plan
- [ ] Rollback procedures
- [ ] Scaling procedures

## Performance Optimization

### For Scale
- [ ] Database indexes optimized
- [ ] Caching strategy implemented
- [ ] CDN configured (if needed)
- [ ] Database replicas (if needed)
- [ ] Load balancing configured (if needed)

### Monitoring Setup
- [ ] Performance metrics tracked
- [ ] Response time monitoring
- [ ] Error rate tracking
- [ ] Database query performance
- [ ] API endpoint metrics

## Success Criteria

✅ **Deployment is successful when:**

1. Application loads without errors
2. Admin user created and can login
3. Dashboard displays metrics
4. API endpoints respond with correct data
5. Database connections stable
6. All cron jobs scheduled and running
7. Error logs are clean
8. Performance metrics acceptable
9. Backup systems working
10. Team has access and documentation

---

## Quick Reference

**Lost?** Start with these:
- Quick fix needed? → [QUICK_FIX.md](./QUICK_FIX.md)
- Full deployment help? → [DEPLOYMENT.md](./DEPLOYMENT.md)
- System architecture? → [WISP_SYSTEM_GUIDE.md](./WISP_SYSTEM_GUIDE.md)
- Vercel troubleshooting? → [VERCEL_DEPLOYMENT_FIX.md](./VERCEL_DEPLOYMENT_FIX.md)

**Documentation index**: [DOCS_INDEX.md](./DOCS_INDEX.md)

---

**Deployment Checklist Version**: 1.0
**Last Updated**: 2024
**Status**: Complete and tested

# Getting Started - WISP Management System

Follow these steps to get your WISP Management System up and running.

## Step 1: Fix the Deployment Error (If Applicable)

If you're seeing the pnpm lockfile error on Vercel:

```bash
# On your local machine
cd your-project
pnpm install
git add pnpm-lock.yaml package.json
git commit -m "fix: update pnpm lockfile"
git push

# Then redeploy on Vercel
```

**Or read**: [QUICK_FIX.md](./QUICK_FIX.md) for a 3-step solution

---

## Step 2: Local Development Setup

### Clone or Download the Project
```bash
git clone https://github.com/yourusername/wisp-app.git
cd wisp-app
```

### Install Dependencies
```bash
pnpm install
```

### Setup Database

For **Supabase** or **Neon** (Recommended):
1. Create a PostgreSQL database
2. Copy your connection string

### Create Environment File
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
# Database (from Supabase/Neon)
POSTGRES_PRISMA_URL=postgresql://user:password@host:5432/dbname
POSTGRES_URL_NON_POOLING=postgresql://user:password@host:5432/dbname

# Generate this with: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret

# For local development
NEXTAUTH_URL=http://localhost:3000

# Optional: Stripe keys (for payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Run Database Migrations
```bash
npx prisma generate
npx prisma migrate deploy
```

### Start Development Server
```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

---

## Step 3: Create Admin User

In a new terminal:
```bash
curl -X POST http://localhost:3000/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wisp.local",
    "password": "Admin@123456",
    "name": "System Administrator"
  }'
```

Save these credentials! You'll use them to login.

---

## Step 4: Login to Dashboard

1. Visit http://localhost:3000/auth/signin
2. Enter your admin credentials
3. You should see the dashboard with metrics

---

## Step 5: Deploy to Vercel (Optional)

### Connect to Vercel
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

### Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- Add all variables from your `.env.local`
- **Important**: `NEXTAUTH_URL` should be your Vercel domain (e.g., https://your-app.vercel.app)

### Run Migrations on Vercel
After deployment succeeds:
```bash
vercel env pull
npx prisma migrate deploy
```

### Create Admin on Production
```bash
curl -X POST https://your-app.vercel.app/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "SecurePassword@123",
    "name": "Administrator"
  }'
```

---

## Common Tasks

### Create a Service Plan
1. Login to dashboard
2. Go to Settings → Service Plans
3. Click "New Plan"
4. Fill in: Name, Download Speed, Upload Speed, Monthly Price
5. Click "Create"

### Create a Customer
1. Go to Customers
2. Click "New Customer"
3. Fill in: First Name, Last Name, Email, Phone (optional)
4. Click "Create"

### Assign Service to Customer
1. Select customer
2. Click "Add Service"
3. Choose service plan
4. Set PPP credentials (auto-generated)
5. Click "Activate"

### View Invoices
1. Go to Invoices
2. Filter by customer or status
3. Click invoice to view details
4. Download PDF (if configured)

---

## Troubleshooting

### "Cannot connect to database"
1. Check connection string in `.env.local`
2. Verify database is running
3. Check firewall/security group allows access
4. Test connection: `psql $POSTGRES_PRISMA_URL`

### "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev -- -p 3001
```

### "Prisma migrations failed"
```bash
# Reset database (dev only - WARNING: deletes all data)
npx prisma migrate reset

# Then run migrations
npx prisma migrate dev
```

### "Cannot login after creating admin"
1. Check credentials are correct
2. Check NEXTAUTH_SECRET is set
3. Check NEXTAUTH_URL matches your domain
4. Clear browser cookies and try again

### More issues?
See [QUICK_FIX.md](./QUICK_FIX.md) or [DOCS_INDEX.md](./DOCS_INDEX.md)

---

## What's Next?

### Understand the System
- Read [README.md](./README.md) for overview
- Check [WISP_SYSTEM_GUIDE.md](./WISP_SYSTEM_GUIDE.md) for architecture

### Configure Optional Features
- **Stripe Payments**: Add `STRIPE_SECRET_KEY` and webhook URL
- **MikroTik Integration**: Add `MIKROTIK_IP`, `MIKROTIK_USERNAME`, `MIKROTIK_PASSWORD`
- **Email Service**: Configure SMTP for notifications

### Deploy to Production
- Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
- Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) to verify everything

### Team Setup
- Share [README.md](./README.md) with your team
- Send developers to [WISP_SYSTEM_GUIDE.md](./WISP_SYSTEM_GUIDE.md)
- Give ops team [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Quick Commands Reference

```bash
# Development
pnpm dev                              # Start dev server
pnpm build                            # Build for production
pnpm start                            # Start production server

# Database
npx prisma generate                   # Generate Prisma client
npx prisma migrate dev                # Create and run migrations
npx prisma migrate deploy             # Apply migrations
npx prisma studio                     # Open database GUI

# Testing
curl http://localhost:3000/api/service-plans  # Test API

# Admin Setup
curl -X POST http://localhost:3000/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"pass","name":"Admin"}'
```

---

## Need Help?

### Fast Solutions
- Error message? → [QUICK_FIX.md](./QUICK_FIX.md)
- Deployment issue? → [VERCEL_DEPLOYMENT_FIX.md](./VERCEL_DEPLOYMENT_FIX.md)
- Stuck? → [DOCS_INDEX.md](./DOCS_INDEX.md)

### Documentation
- System architecture → [WISP_SYSTEM_GUIDE.md](./WISP_SYSTEM_GUIDE.md)
- Deployment guide → [DEPLOYMENT.md](./DEPLOYMENT.md)
- Deployment checklist → [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### Contact
For support, check the main README or contact your team lead.

---

## Success Indicators

You'll know everything is working when:

✅ Development server starts without errors
✅ Can access http://localhost:3000/auth/signin
✅ Can login with admin credentials
✅ Dashboard shows metrics
✅ API endpoints respond
✅ Database migrations complete successfully

---

**Getting Started Guide Version**: 1.0
**Last Updated**: 2024
**Estimated Time to Complete**: 15-20 minutes

Ready? Start with **Step 1** above!

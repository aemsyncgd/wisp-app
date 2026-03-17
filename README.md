# WISP Management System

A comprehensive Wireless Internet Service Provider (WISP) management platform built with Next.js 15, PostgreSQL, and MikroTik integration.

> **✅ Latest Fix Applied**: Dependencies updated for Vercel compatibility  
> See [VERCEL_FIX_APPLIED.md](./VERCEL_FIX_APPLIED.md) for details on what was fixed

## Features

### Admin Dashboard
- **Real-time Metrics**: Customer count, active services, revenue, pending invoices
- **System Health**: Router status, API health, database status
- **Quick Actions**: Create customers, generate invoices, view reports
- **Audit Logging**: Complete activity tracking and change history

### Customer Management
- CRUD operations for customers
- Service plan assignment
- Account status tracking (ACTIVE, SUSPENDED, INACTIVE)
- Contact information management

### Service Management
- Automatic service activation on MikroTik
- Bandwidth limiting via queue rules
- Service suspension/reactivation
- PPP secret management
- Address list management (ACTIVE/SUSPENDED)

### Billing & Invoicing
- Automatic monthly invoice generation via cron
- Overdue invoice detection and suspension
- Payment tracking and reconciliation
- Invoice status management

### Payment Processing
- Stripe integration with webhooks
- Payment intent creation
- Transaction tracking
- Automatic invoice status updates
- Multiple payment methods (extensible)

### MikroTik Integration
- Automatic PPP user creation/deletion
- Address list management
- Queue/bandwidth rule creation
- Router health monitoring
- Real-time service provisioning

## Tech Stack

- **Framework**: Next.js 15
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js 5 (Credentials Provider)
- **Payment**: Stripe API
- **Router**: MikroTik RouterOS REST API
- **UI**: shadcn/ui with TailwindCSS
- **Scheduling**: node-cron for automated jobs
- **Password Hashing**: bcrypt

## Quick Start

**For step-by-step instructions**, see [GETTING_STARTED.md](./GETTING_STARTED.md)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Or for development (with reset option):
npx prisma migrate dev
```

### 3. Set Environment Variables
Create `.env.local` in your project root:

```env
# Database (Supabase or Neon PostgreSQL)
POSTGRES_PRISMA_URL=postgresql://user:password@host:5432/dbname
POSTGRES_URL_NON_POOLING=postgresql://user:password@host:5432/dbname

# Authentication
NEXTAUTH_SECRET=generate-with-$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# Stripe (optional but recommended)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# MikroTik Router (optional)
MIKROTIK_IP=192.168.1.1
MIKROTIK_PORT=8728
MIKROTIK_USERNAME=admin
MIKROTIK_PASSWORD=password
```

### 4. Create First Admin User
```bash
curl -X POST http://localhost:3000/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wisp.local",
    "password": "SecurePassword123!",
    "name": "System Administrator"
  }'
```

### 5. Start Development Server
```bash
pnpm dev
```

Visit `http://localhost:3000/auth/signin` to log in with your admin credentials.

## Project Structure

```
├── app/
│   ├── admin/                          # Admin dashboard
│   │   ├── dashboard/                  # Main dashboard
│   │   ├── customers/                  # Customer management
│   │   ├── services/                   # Service management
│   │   ├── invoices/                   # Invoice management
│   │   ├── payments/                   # Payment management
│   │   ├── settings/                   # System settings
│   │   └── layout.tsx                  # Admin layout
│   ├── api/                            # API routes
│   │   ├── auth/                       # NextAuth endpoints
│   │   ├── customers/                  # Customer CRUD
│   │   ├── customer-services/          # Service management
│   │   ├── invoices/                   # Invoice management
│   │   ├── payments/                   # Payment processing
│   │   ├── service-plans/              # Service plans
│   │   ├── setup/                      # Initial setup
│   │   └── webhooks/stripe/            # Stripe webhooks
│   ├── auth/signin/                    # Login page
│   ├── components/                     # Admin UI components
│   │   ├── AdminSidebar.tsx
│   │   └── AdminHeader.tsx
│   └── layout.tsx                      # Root layout
├── lib/
│   ├── auth.ts                         # NextAuth config
│   ├── prisma.ts                       # Prisma client
│   ├── mikrotik.ts                     # MikroTik API
│   ├── stripe.ts                       # Stripe integration
│   └── billing-automation.ts           # Cron jobs
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── migrations/                     # Database migrations
├── middleware.ts                       # Auth middleware
└── WISP_SYSTEM_GUIDE.md               # Comprehensive documentation
```

## Core API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `POST /api/setup/create-admin` - Create first admin (one-time)

### Customers
- `GET /api/customers` - List customers (paginated)
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer details
- `PATCH /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Services
- `POST /api/customer-services` - Activate service
- `GET /api/customer-services` - List services
- `POST /api/customer-services/[id]/suspend` - Suspend service
- `POST /api/customer-services/[id]/activate` - Reactivate service

### Invoices
- `GET /api/invoices` - List invoices (paginated)
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice
- `PATCH /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Cancel invoice

### Payments
- `GET /api/payments` - List payments (paginated)
- `POST /api/payments` - Record payment
- `POST /api/payments/create-intent` - Create Stripe intent

### Service Plans
- `GET /api/service-plans` - List plans
- `POST /api/service-plans` - Create plan (admin)

## Automated Cron Jobs

The system runs automated tasks using node-cron:

| Job | Schedule (UTC) | Description |
|-----|---|-------------|
| Invoice Generation | 2:00 AM | Creates invoices for services with 30+ days since last billing |
| Overdue Processing | 3:00 AM | Marks overdue invoices and suspends services |
| Payment Reminders | 9:00 AM | Checks invoices due in next 3 days (for email integration) |

Initialize cron jobs automatically on server start or call `initializeBillingCrons()` from `lib/billing-automation.ts`.

## MikroTik Integration

The system provides REST API integration with MikroTik RouterOS for automatic service provisioning.

### Prerequisites
- MikroTik RouterOS v6.0+
- REST API enabled (port 8728 default)
- Admin credentials configured

### Service Lifecycle

**Activation** → Creates PPP secret, adds to ACTIVE list, creates queue rule
**Suspension** → Disables PPP user, moves to SUSPENDED list
**Reactivation** → Re-enables PPP user, removes from SUSPENDED list

See `lib/mikrotik.ts` for full API implementation.

## Security

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Session-based authentication (NextAuth.js)
- ✅ HTTP-only secure cookies
- ✅ Protected API routes with middleware
- ✅ Webhook signature verification (Stripe)
- ✅ Comprehensive audit logging
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CSRF protection via NextAuth.js

## Deployment

### Vercel
```bash
# Deploy
vercel deploy

# Set environment variables in Vercel dashboard
# Run migrations
npx prisma migrate deploy
```

### Self-Hosted
```bash
npm run build
npm start
```

## Troubleshooting

### Database Migrations
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

### MikroTik Connection
- Verify IP and port in environment variables
- Ensure REST API is enabled on router
- Confirm username/password credentials
- Test: `curl http://<router-ip>:8728/rest/system/identity`

### Payment Processing
- Verify Stripe API keys
- Check webhook URL is publicly accessible
- Confirm webhook signature secret is set

## Documentation

Comprehensive documentation available in [WISP_SYSTEM_GUIDE.md](./WISP_SYSTEM_GUIDE.md)

## License

Proprietary - WISP Management System

---

**Version**: 1.0.0
**Built with**: Next.js 15 • PostgreSQL • Prisma • NextAuth.js • Stripe

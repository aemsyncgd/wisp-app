# WISP Management System - Implementation Guide

## Overview

The WISP (Wireless Internet Service Provider) Management System is a comprehensive Next.js 15 + PostgreSQL + Prisma application for managing internet service operations. It integrates with MikroTik RouterOS for service provisioning and includes automated billing, payment processing, and customer management.

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript, React 19, TailwindCSS
- **Backend**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Credentials Provider
- **Payments**: Stripe API integration
- **Router Management**: MikroTik RouterOS REST API
- **Scheduling**: node-cron for automated tasks
- **UI Components**: shadcn/ui with Radix UI

## Project Structure

```
/app
├── /admin              # Admin dashboard & management pages
│   ├── /dashboard      # Main dashboard page
│   ├── /customers      # Customer management
│   ├── /services       # Service management
│   ├── /invoices       # Invoice management
│   ├── /payments       # Payment management
│   └── /settings       # System settings
├── /api                # API routes
│   ├── /auth           # Authentication endpoints
│   ├── /customers      # Customer CRUD
│   ├── /customer-services  # Service management
│   ├── /invoices       # Invoice management
│   ├── /payments       # Payment processing
│   ├── /service-plans  # Service plan management
│   ├── /setup          # Initial setup endpoint
│   └── /webhooks       # Webhook handlers
├── /auth               # Authentication pages
│   └── /signin         # Login page
└── /components         # Reusable React components
    ├── AdminHeader.tsx
    └── AdminSidebar.tsx

/lib
├── auth.ts             # NextAuth configuration
├── prisma.ts           # Prisma client
├── mikrotik.ts         # MikroTik API integration
├── stripe.ts           # Stripe integration
└── billing-automation.ts  # Automated billing jobs

/prisma
├── schema.prisma       # Database schema
└── migrations/         # Database migrations

/middleware.ts          # Authentication middleware
```

## Database Schema

### Core Tables

1. **admins** - System administrators
   - Roles: SUPER_ADMIN, ADMIN, MANAGER
   - Password-based authentication

2. **customers** - Internet service customers
   - Personal & business information
   - Account status tracking
   - Contact details

3. **service_plans** - Available service tiers
   - Download/upload speeds
   - Monthly pricing
   - Contract terms
   - Data limits (optional)

4. **customer_services** - Active services per customer
   - Links customers to plans
   - PPP credentials (MikroTik)
   - Service status (ACTIVE, SUSPENDED, INACTIVE)
   - Bandwidth tracking
   - Renewal dates

5. **addresses** - Customer service locations
   - Physical address information
   - GPS coordinates (geolocation)
   - Router assignment
   - MikroTik address list association

6. **routers** - MikroTik router devices
   - Connection details (IP, port, credentials)
   - Hardware information
   - Health status

### Billing Tables

7. **invoices** - Customer billing documents
   - Invoice numbering
   - Amount tracking
   - Payment status
   - Due date management

8. **payments** - Payment records
   - Payment method tracking
   - Transaction IDs (Stripe)
   - Status monitoring
   - Multiple payment statuses

9. **bandwidth_logs** - Usage tracking
   - Daily bandwidth consumption
   - Download/upload metrics
   - Historical data for analytics

### Audit & Logging

10. **audit_logs** - System activity tracking
    - Admin action logging
    - Customer-related changes
    - Entity modification history
    - IP & user agent capture

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth core endpoints
- `POST /api/setup/create-admin` - First admin creation (one-time)

### Customers
- `GET /api/customers` - List customers (paginated)
- `POST /api/customers` - Create new customer
- `GET /api/customers/[id]` - Get specific customer
- `PATCH /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Services
- `POST /api/customer-services` - Activate new service
- `GET /api/customer-services` - List services
- `POST /api/customer-services/[id]/suspend` - Suspend service
- `POST /api/customer-services/[id]/activate` - Reactivate service

### Invoices
- `GET /api/invoices` - List invoices (paginated)
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get specific invoice
- `PATCH /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Cancel invoice

### Payments
- `GET /api/payments` - List payments (paginated)
- `POST /api/payments` - Record payment
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/webhooks/stripe` - Stripe webhook handler

### Service Plans
- `GET /api/service-plans` - List available plans
- `POST /api/service-plans` - Create new plan (admin only)

## Key Features

### 1. MikroTik Integration
- Automatic PPP user creation/deletion
- Service suspension via queue disabling
- Address list management (ACTIVE/SUSPENDED)
- Queue rule creation for bandwidth limiting
- Real-time router health monitoring

### 2. Automated Billing
- Daily invoice generation for active services
- Automatic service suspension on overdue payment
- Payment reminder system (configurable)
- Cron job scheduling:
  - 2 AM: Generate invoices
  - 3 AM: Check overdue invoices
  - 9 AM: Send payment reminders

### 3. Payment Processing
- Stripe integration for credit card payments
- Webhook handling for payment confirmations
- Automatic invoice status updates
- Multiple payment method support (planned)
- Transaction ID tracking

### 4. Admin Dashboard
- Real-time system statistics
- Quick action buttons
- System health monitoring
- Revenue analytics

### 5. Audit Logging
- Complete activity tracking
- User action history
- Entity change monitoring
- IP address logging

## Environment Variables

Required variables (set in your Vercel project):

```
# Database
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# MikroTik (optional, can be configured per router)
MIKROTIK_IP=192.168.1.1
MIKROTIK_PORT=8728
MIKROTIK_USERNAME=admin
MIKROTIK_PASSWORD=password
```

## Getting Started

### 1. Initial Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 2. Create First Admin

```bash
curl -X POST http://localhost:3000/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wisp.local",
    "password": "demo1234",
    "name": "Admin User"
  }'
```

### 3. Access Dashboard

Visit `http://localhost:3000/auth/signin` and log in with your admin credentials.

## Cron Jobs

The system runs automated tasks using node-cron:

1. **Daily Invoice Generation** (2 AM UTC)
   - Generates invoices for services with 30+ days since last billing
   - Updates `lastBillingDate` field

2. **Overdue Invoice Handling** (3 AM UTC)
   - Marks invoices as OVERDUE
   - Automatically suspends associated services

3. **Payment Reminders** (9 AM UTC)
   - Checks invoices due in next 3 days
   - Prepares reminder notifications (email integration ready)

## MikroTik Integration Details

### PPP Configuration

When a service is activated:
1. System creates PPP secret in MikroTik
2. Stores username and hashed password in database
3. Service becomes active in the address list

When suspended:
1. PPP user is disabled (not deleted)
2. Moved to SUSPENDED address list
3. Queue rules can limit bandwidth

### Address Lists

Two main lists:
- **ACTIVE** - All active customers
- **SUSPENDED** - Suspended customers

Used for:
- Firewall rules
- QoS (Quality of Service)
- Traffic shaping
- Access control

## Security Considerations

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **Session Management**: Secure HTTP-only cookies via NextAuth
3. **API Authentication**: Session-based with middleware protection
4. **Sensitive Data**: Environment variables for credentials
5. **Row Level Security**: Can be enabled at database level
6. **Audit Logging**: All admin actions tracked

## Deployment

### Vercel

```bash
# Deploy to Vercel
vercel deploy

# Set environment variables in Vercel dashboard
# Run migrations:
npm run prisma:deploy
```

### Self-Hosted

```bash
# Build
npm run build

# Start
npm start

# Initialize cron jobs
# Add to systemd service or similar
```

## Troubleshooting

### MikroTik Connection Issues
- Verify IP address and port
- Check router REST API is enabled
- Confirm username/password credentials
- Test with: `POST /api/customers/test-mikrotik`

### Payment Processing
- Verify Stripe keys are correct
- Check webhook URL is accessible
- Monitor `/api/webhooks/stripe` logs

### Database Issues
- Verify connection string
- Run migrations: `npx prisma migrate deploy`
- Check Prisma client is generated: `npx prisma generate`

## Future Enhancements

1. **Multi-language support**
2. **Customer portal login**
3. **Bandwidth throttling per plan**
4. **Advanced analytics & reporting**
5. **SMS/Email notifications**
6. **Support ticket system**
7. **Network topology mapping**
8. **Real-time service monitoring**

## Support & Maintenance

- Monitor cron job logs
- Regular database backups
- Update dependencies monthly
- Test MikroTik connectivity weekly
- Monitor Stripe integration health

---

**Version**: 1.0.0
**Last Updated**: 2024
**Maintainer**: Development Team

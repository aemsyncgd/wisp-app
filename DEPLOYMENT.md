# WISP Management System - Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database created and migrations applied
- [ ] First admin user created via setup endpoint
- [ ] MikroTik router connection tested (optional)
- [ ] Stripe keys configured (optional)
- [ ] Domain/SSL certificate prepared
- [ ] Backup strategy planned
- [ ] Monitoring setup planned

## Vercel Deployment (Recommended)

### Step 1: Prepare Repository

```bash
# Initialize git if not done
git init
git add .
git commit -m "Initial WISP Management System commit"

# Push to GitHub (required for Vercel)
git push origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com/new
2. Select your GitHub repository
3. Click "Deploy"

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
# Database
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Authentication
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://yourdomain.com

# Stripe (if using)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# MikroTik (if using)
MIKROTIK_IP=your.router.ip
MIKROTIK_PORT=8728
MIKROTIK_USERNAME=admin
MIKROTIK_PASSWORD=password
```

### Step 4: Configure Build Settings

In Vercel Dashboard → Settings → Build & Development:

- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Step 5: Run Migrations

After first deploy:

```bash
# Via Vercel CLI
vercel env pull
npx prisma migrate deploy

# Or via Vercel Dashboard → Functions → Logs
# Run manual deployment with:
npm run prisma:deploy
```

### Step 6: Create Admin User

After successful deployment:

```bash
curl -X POST https://yourdomain.com/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "name": "System Administrator"
  }'
```

### Step 7: Access System

Navigate to: `https://yourdomain.com/auth/signin`

## Self-Hosted Deployment (Docker)

### Step 1: Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build application
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: wisp_user
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: wisp_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      POSTGRES_PRISMA_URL: postgresql://wisp_user:secure_password@postgres:5432/wisp_db
      POSTGRES_URL_NON_POOLING: postgresql://wisp_user:secure_password@postgres:5432/wisp_db
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: http://localhost:3000
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      MIKROTIK_IP: ${MIKROTIK_IP}
      MIKROTIK_PORT: ${MIKROTIK_PORT}
      MIKROTIK_USERNAME: ${MIKROTIK_USERNAME}
      MIKROTIK_PASSWORD: ${MIKROTIK_PASSWORD}
    depends_on:
      - postgres
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
```

### Step 3: Deploy

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Create admin user
curl -X POST http://localhost:3000/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@localhost",
    "password": "SecurePassword123!",
    "name": "Administrator"
  }'
```

## Traditional VPS Deployment (Linux/Ubuntu)

### Step 1: Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs npm

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install nginx
sudo apt install -y nginx
```

### Step 2: Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/yourusername/wisp-management.git
cd wisp-management
npm install
```

### Step 3: Configure Environment

```bash
# Create .env.local
cat > .env.local << EOF
POSTGRES_PRISMA_URL=postgresql://wisp_user:password@localhost:5432/wisp_db
POSTGRES_URL_NON_POOLING=postgresql://wisp_user:password@localhost:5432/wisp_db
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://yourdomain.com
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
EOF
```

### Step 4: Build & Setup Database

```bash
npm run build
npx prisma migrate deploy
```

### Step 5: Setup Process Manager (PM2)

```bash
sudo npm install -g pm2

pm2 start npm --name "wisp" -- start
pm2 startup
pm2 save
```

### Step 6: Configure Nginx

```bash
# Create nginx config
sudo cat > /etc/nginx/sites-available/wisp << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/wisp /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Step 7: Setup SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 8: Create Admin User

```bash
curl -X POST http://localhost:3000/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "name": "Administrator"
  }'
```

## Post-Deployment Tasks

### 1. Verify Installation

```bash
# Check database connectivity
npx prisma db execute --stdin < check-connection.sql

# Test API endpoints
curl https://yourdomain.com/api/service-plans
```

### 2. Monitor Cron Jobs

Ensure cron jobs are running:

```bash
# For Vercel: Check Function logs
# For self-hosted: Initialize in your app startup

# Cron jobs schedule:
# 2 AM UTC - Invoice generation
# 3 AM UTC - Overdue processing
# 9 AM UTC - Payment reminders
```

### 3. Backup Strategy

Set up automated backups:

```bash
# Daily PostgreSQL backup
0 2 * * * pg_dump $DATABASE_URL > /backups/wisp_$(date +\%Y\%m\%d).sql

# Archive old backups
find /backups -name "wisp_*.sql" -mtime +30 -delete
```

### 4. Monitoring

Set up monitoring for:
- Application errors (Sentry, etc.)
- Database performance
- API response times
- MikroTik connectivity
- Stripe webhook health

### 5. Security Hardening

```bash
# Update system regularly
sudo apt update && sudo apt upgrade -y

# Setup firewall
sudo ufw enable
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS

# Rotate admin credentials
# Change NEXTAUTH_SECRET periodically
# Review audit logs regularly
```

## Troubleshooting

### Database Connection Failed

```bash
# Check connection string
echo $POSTGRES_PRISMA_URL

# Test connection
psql $POSTGRES_PRISMA_URL -c "SELECT 1"

# Reset Prisma
npx prisma db execute --stdin < reset.sql
```

### Migrations Not Applied

```bash
# Run migrations manually
npx prisma migrate deploy

# Or reset database (development only)
npx prisma migrate reset
```

### MikroTik Connection Issues

```bash
# Test router connectivity
curl -u admin:password http://192.168.1.1:8728/rest/system/identity

# Verify credentials in environment
echo $MIKROTIK_IP $MIKROTIK_PORT
```

### Stripe Webhooks Not Working

1. Verify webhook URL: `https://yourdomain.com/api/webhooks/stripe`
2. Check webhook secret matches STRIPE_WEBHOOK_SECRET
3. Monitor webhook logs in Stripe Dashboard

## Scaling Considerations

For production at scale:

1. **Database**: Use read replicas, connection pooling
2. **Cache**: Implement Redis for session/data caching
3. **CDN**: Serve static assets via Cloudflare/CDN
4. **Load Balancing**: Use load balancer for multiple app instances
5. **Monitoring**: Implement comprehensive logging and alerting

## Support

For deployment assistance:
- Check WISP_SYSTEM_GUIDE.md for detailed documentation
- Review logs: Vercel → Deployments → Logs
- Check database: `npx prisma studio`
- Test APIs: Use Postman or curl

---

**Deployment Version**: 1.0.0
**Last Updated**: 2024

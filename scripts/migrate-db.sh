#!/bin/bash

# WISP Management System - Database Migration Script
# This script applies Prisma migrations to set up the PostgreSQL database

echo "🚀 WISP Management System - Database Setup"
echo "==========================================="

# Check if .env exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local file not found"
  echo "Please set up your environment variables first"
  exit 1
fi

echo "📊 Running Prisma migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
  echo "⚠️  Prisma migrate deploy failed. Running reset and push instead..."
  npx prisma db push
fi

echo "✅ Database migration complete!"
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "✅ All done! Your WISP database is ready to use."

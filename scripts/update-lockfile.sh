#!/bin/bash
# Update pnpm lockfile after package.json changes
# This script is used during Vercel deployment to handle lockfile mismatches

echo "[v0] Updating pnpm lockfile..."
pnpm install --no-frozen-lockfile
echo "[v0] Lockfile updated successfully"

#!/bin/bash
set -e
cd /Users/user/Documents/ASCEND/ascend-web

echo "Building ASCEND..."
node node_modules/next/dist/bin/next build

echo "Starting with PM2..."
pm2 delete ascend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "✓ ASCEND is running at http://localhost:3000"
echo ""
echo "To make it survive reboots, run:"
echo "  pm2 startup"
echo "Then copy-paste the command it prints."
echo ""
echo "To access from your phone on this network:"
ipconfig getifaddr en0 2>/dev/null && echo ":3000"

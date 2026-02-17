#!/bin/bash

# African Fashion eCommerce - Production Build Script

set -e

echo "🏗️  Building African Fashion eCommerce for production..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Using .env.example as template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "⚠️  Please configure .env with production values before deploying!"
    fi
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false
echo ""

# Type check
echo "🔍 Running TypeScript type check..."
npm run type-check
echo ""

# Lint code
echo "🧹 Linting code..."
npm run lint
echo ""

# Build application
echo "🔨 Building Next.js application..."
npm run build
echo ""

echo "✅ Build completed successfully!"
echo ""
echo "To start the production server, run:"
echo "  npm start"
echo ""
echo "Or with PM2:"
echo "  pm2 start ecosystem.config.js"

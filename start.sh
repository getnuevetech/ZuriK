#!/bin/bash

# African Fashion eCommerce - Local Development Start Script

set -e

echo "🚀 Starting African Fashion eCommerce..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the development server
echo "🎨 Starting Next.js development server..."
echo "🌐 Server will be available at http://localhost:3000"
echo ""
npm run dev

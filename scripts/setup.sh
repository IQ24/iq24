#!/bin/bash

# IQ24 Development Environment Setup Script
# This script sets up the development environment for the IQ24 AI platform

set -e

echo "🚀 Setting up IQ24 Development Environment..."

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install bun first."
    echo "Visit: https://bun.sh/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Check if supabase is installed globally
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    bun install -g supabase
fi

# Check if mintlify is installed globally
if ! command -v mintlify &> /dev/null; then
    echo "📦 Installing Mintlify CLI..."
    bun install -g mintlify
fi

# Set up environment files
echo "🔧 Setting up environment files..."

# API environment
if [ ! -f "apps/api/.env" ]; then
    if [ -f "apps/api/.env-template" ]; then
        cp apps/api/.env-template apps/api/.env
        echo "✅ Created apps/api/.env from template"
    fi
fi

# Dashboard environment
if [ ! -f "apps/dashboard/.env" ]; then
    if [ -f "apps/dashboard/.env-example" ]; then
        cp apps/dashboard/.env-example apps/dashboard/.env
        echo "✅ Created apps/dashboard/.env from example"
    fi
fi

# Website environment
if [ ! -f "apps/website/.env" ]; then
    if [ -f "apps/website/.env-template" ]; then
        cp apps/website/.env-template apps/website/.env
        echo "✅ Created apps/website/.env from template"
    fi
fi

# Engine environment
if [ ! -f "apps/engine/.env" ]; then
    if [ -f "apps/engine/.dev.vars-example" ]; then
        cp apps/engine/.dev.vars-example apps/engine/.dev.vars
        echo "✅ Created apps/engine/.dev.vars from example"
    fi
fi

# Build packages
echo "🏗️ Building packages..."
bun run build:packages

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables in the .env files"
echo "2. Run 'bun run dev' to start all services"
echo "3. Visit the documentation at http://localhost:3004"
echo ""
echo "Available commands:"
echo "- bun run dev           # Start all services"
echo "- bun run dev:dashboard # Start dashboard only"
echo "- bun run dev:website   # Start website only"
echo "- bun run dev:api       # Start API only"
echo "- bun run dev:engine    # Start engine only"
echo "- bun run dev:docs      # Start docs only"
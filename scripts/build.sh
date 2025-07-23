#!/bin/bash

# IQ24 Build Script
# This script builds all packages and applications for production

set -e

echo "🏗️ Building IQ24 AI Platform..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
fi

# Function to build with error handling
build_with_error_handling() {
    local target=$1
    local description=$2
    
    echo "🔄 Building $description..."
    
    if bun run build --filter="$target"; then
        echo "✅ $description build successful"
    else
        echo "❌ $description build failed"
        exit 1
    fi
}

# Build packages first (dependencies)
echo "📦 Building packages..."
bun run build:packages

# Build applications
echo "🔧 Building applications..."

# Build Dashboard
build_with_error_handling "@iq24/dashboard" "Dashboard"

# Build Website
build_with_error_handling "@iq24/website" "Website"

# Build Engine
build_with_error_handling "@iq24/engine" "Engine"

# Build Documentation
if [ -d "apps/docs" ]; then
    echo "🔄 Building Documentation..."
    cd apps/docs
    if command -v mintlify &> /dev/null; then
        mintlify build
        echo "✅ Documentation build successful"
    else
        echo "⚠️  Mintlify not found, skipping documentation build"
    fi
    cd ../..
fi

# Run type checking
echo "🔍 Running type checks..."
if bun run typecheck; then
    echo "✅ Type checking passed"
else
    echo "❌ Type checking failed"
    exit 1
fi

# Run linting
echo "🧹 Running linting..."
if bun run lint; then
    echo "✅ Linting passed"
else
    echo "❌ Linting failed"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
if bun run test; then
    echo "✅ Tests passed"
else
    echo "❌ Tests failed"
    exit 1
fi

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "Built applications:"
echo "- Dashboard: apps/dashboard/.next/"
echo "- Website: apps/website/.next/"
echo "- Engine: apps/engine/dist/"
echo "- Documentation: apps/docs/out/"
echo ""
echo "Next steps:"
echo "1. Deploy to your hosting platform"
echo "2. Set up production environment variables"
echo "3. Configure database connections"
#!/bin/bash

# IQ24 Clean Script
# This script cleans all build artifacts and dependencies

set -e

echo "🧹 Cleaning IQ24 AI Platform..."

# Function to clean directory if it exists
clean_directory() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        echo "🗑️  Removing $description..."
        rm -rf "$dir"
        echo "✅ $description removed"
    else
        echo "⚠️  $description not found, skipping"
    fi
}

# Function to clean file if it exists
clean_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo "🗑️  Removing $description..."
        rm -f "$file"
        echo "✅ $description removed"
    else
        echo "⚠️  $description not found, skipping"
    fi
}

# Parse command line arguments
FULL_CLEAN=false
DEPS_ONLY=false
BUILD_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --full)
            FULL_CLEAN=true
            shift
            ;;
        --deps-only)
            DEPS_ONLY=true
            shift
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --full        Clean everything (dependencies, build artifacts, cache)"
            echo "  --deps-only   Clean only dependencies (node_modules)"
            echo "  --build-only  Clean only build artifacts"
            echo "  --help        Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Set default to full clean if no specific option is provided
if [ "$DEPS_ONLY" = false ] && [ "$BUILD_ONLY" = false ]; then
    FULL_CLEAN=true
fi

# Clean dependencies
if [ "$FULL_CLEAN" = true ] || [ "$DEPS_ONLY" = true ]; then
    echo "📦 Cleaning dependencies..."
    
    # Clean root node_modules
    clean_directory "node_modules" "root node_modules"
    
    # Clean package node_modules
    for package in packages/*/node_modules; do
        if [ -d "$package" ]; then
            clean_directory "$package" "$(dirname "$package") node_modules"
        fi
    done
    
    # Clean app node_modules
    for app in apps/*/node_modules; do
        if [ -d "$app" ]; then
            clean_directory "$app" "$(dirname "$app") node_modules"
        fi
    done
    
    # Clean lock files
    clean_file "bun.lockb" "bun lock file"
    clean_file "package-lock.json" "npm lock file"
    clean_file "yarn.lock" "yarn lock file"
    clean_file "pnpm-lock.yaml" "pnpm lock file"
fi

# Clean build artifacts
if [ "$FULL_CLEAN" = true ] || [ "$BUILD_ONLY" = true ]; then
    echo "🏗️ Cleaning build artifacts..."
    
    # Clean Next.js build outputs
    clean_directory "apps/dashboard/.next" "Dashboard build output"
    clean_directory "apps/website/.next" "Website build output"
    clean_directory "apps/dashboard/out" "Dashboard export output"
    clean_directory "apps/website/out" "Website export output"
    
    # Clean Engine build output
    clean_directory "apps/engine/dist" "Engine build output"
    clean_directory "apps/engine/.wrangler" "Engine wrangler output"
    
    # Clean Documentation build output
    clean_directory "apps/docs/out" "Documentation build output"
    
    # Clean Mobile build output
    clean_directory "apps/mobile/dist" "Mobile build output"
    clean_directory "apps/mobile/.expo" "Expo cache"
    
    # Clean package build outputs
    for package in packages/*/dist; do
        if [ -d "$package" ]; then
            clean_directory "$package" "$(dirname "$package") build output"
        fi
    done
    
    # Clean TypeScript build info
    find . -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true
    echo "✅ TypeScript build info cleaned"
fi

# Clean cache and temporary files
if [ "$FULL_CLEAN" = true ]; then
    echo "🗂️ Cleaning cache and temporary files..."
    
    # Clean Turbo cache
    clean_directory ".turbo" "Turbo cache"
    
    # Clean cache directories
    clean_directory ".cache" "General cache"
    clean_directory ".tmp" "Temporary files"
    clean_directory "tmp" "Temporary files"
    
    # Clean test coverage
    clean_directory "coverage" "Test coverage"
    
    # Clean logs
    find . -name "*.log" -type f -delete 2>/dev/null || true
    echo "✅ Log files cleaned"
    
    # Clean OS specific files
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
    echo "✅ OS specific files cleaned"
    
    # Clean IDE files
    clean_directory ".vscode/settings.json" "VSCode settings"
    clean_directory ".idea" "IntelliJ IDEA files"
    
    # Clean Supabase local files
    clean_directory "apps/api/supabase/.branches" "Supabase branches"
    clean_directory "apps/api/supabase/.temp" "Supabase temp files"
fi

echo ""
echo "🎉 Cleanup completed successfully!"
echo ""
echo "What was cleaned:"
if [ "$FULL_CLEAN" = true ] || [ "$DEPS_ONLY" = true ]; then
    echo "- Dependencies (node_modules, lock files)"
fi
if [ "$FULL_CLEAN" = true ] || [ "$BUILD_ONLY" = true ]; then
    echo "- Build artifacts (.next, dist, out directories)"
fi
if [ "$FULL_CLEAN" = true ]; then
    echo "- Cache files (.turbo, .cache)"
    echo "- Temporary files and logs"
    echo "- OS and IDE specific files"
fi
echo ""
echo "Next steps:"
echo "1. Run 'bun install' to reinstall dependencies"
echo "2. Run 'bun run dev' to start development"
echo "3. Run 'bun run build' for production builds"
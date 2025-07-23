#!/bin/bash

# IQ24 Release Script
# This script handles versioning and releasing the IQ24 AI platform

set -e

echo "🚀 IQ24 Release Manager"
echo "======================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ This script must be run in a git repository"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working directory is not clean. Please commit or stash changes first."
    git status --short
    exit 1
fi

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "❌ Releases must be made from the main branch. Currently on: $current_branch"
    exit 1
fi

# Parse command line arguments
RELEASE_TYPE=""
SKIP_TESTS=false
SKIP_BUILD=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --major)
            RELEASE_TYPE="major"
            shift
            ;;
        --minor)
            RELEASE_TYPE="minor"
            shift
            ;;
        --patch)
            RELEASE_TYPE="patch"
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [RELEASE_TYPE] [OPTIONS]"
            echo ""
            echo "Release Types:"
            echo "  --major      Major version bump (1.0.0 -> 2.0.0)"
            echo "  --minor      Minor version bump (1.0.0 -> 1.1.0)"
            echo "  --patch      Patch version bump (1.0.0 -> 1.0.1)"
            echo ""
            echo "Options:"
            echo "  --skip-tests Skip running tests"
            echo "  --skip-build Skip building applications"
            echo "  --dry-run    Show what would be done without making changes"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Prompt for release type if not provided
if [ -z "$RELEASE_TYPE" ]; then
    echo "Select release type:"
    echo "1) Patch (bug fixes)"
    echo "2) Minor (new features)"
    echo "3) Major (breaking changes)"
    read -p "Enter choice [1-3]: " choice
    
    case $choice in
        1) RELEASE_TYPE="patch" ;;
        2) RELEASE_TYPE="minor" ;;
        3) RELEASE_TYPE="major" ;;
        *) echo "Invalid choice"; exit 1 ;;
    esac
fi

# Get current version
current_version=$(node -p "require('./package.json').version")
echo "Current version: $current_version"

# Calculate new version
IFS='.' read -r -a version_parts <<< "$current_version"
major=${version_parts[0]}
minor=${version_parts[1]}
patch=${version_parts[2]}

case $RELEASE_TYPE in
    major)
        new_version="$((major + 1)).0.0"
        ;;
    minor)
        new_version="$major.$((minor + 1)).0"
        ;;
    patch)
        new_version="$major.$minor.$((patch + 1))"
        ;;
esac

echo "New version: $new_version"

# Confirm release
if [ "$DRY_RUN" = false ]; then
    read -p "Continue with release? [y/N]: " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "Release cancelled"
        exit 0
    fi
fi

# Update version in package.json files
update_version() {
    local file=$1
    if [ -f "$file" ]; then
        echo "🔄 Updating version in $file..."
        if [ "$DRY_RUN" = false ]; then
            sed -i.bak "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" "$file"
            rm -f "$file.bak"
        fi
        echo "✅ Version updated in $file"
    fi
}

# Update root package.json
update_version "package.json"

# Update package versions
for package in packages/*/package.json; do
    if [ -f "$package" ]; then
        update_version "$package"
    fi
done

# Update app versions
for app in apps/*/package.json; do
    if [ -f "$app" ]; then
        update_version "$app"
    fi
done

# Run tests
if [ "$SKIP_TESTS" = false ]; then
    echo "🧪 Running tests..."
    if [ "$DRY_RUN" = false ]; then
        if ! ./scripts/test.sh; then
            echo "❌ Tests failed. Release cancelled."
            exit 1
        fi
    else
        echo "✅ Would run tests"
    fi
else
    echo "⚠️  Skipping tests"
fi

# Build applications
if [ "$SKIP_BUILD" = false ]; then
    echo "🏗️ Building applications..."
    if [ "$DRY_RUN" = false ]; then
        if ! ./scripts/build.sh; then
            echo "❌ Build failed. Release cancelled."
            exit 1
        fi
    else
        echo "✅ Would build applications"
    fi
else
    echo "⚠️  Skipping build"
fi

# Create changelog entry
echo "📝 Creating changelog entry..."
changelog_entry="## [$new_version] - $(date +%Y-%m-%d)

### Added
- 

### Changed
- 

### Fixed
- 

### Removed
- 

"

if [ "$DRY_RUN" = false ]; then
    # Create or update CHANGELOG.md
    if [ -f "CHANGELOG.md" ]; then
        # Insert new entry after the title
        sed -i.bak "1a\\
$changelog_entry" CHANGELOG.md
        rm -f CHANGELOG.md.bak
    else
        echo "# Changelog

$changelog_entry" > CHANGELOG.md
    fi
    echo "✅ Changelog entry created"
else
    echo "✅ Would create changelog entry"
fi

# Commit changes
if [ "$DRY_RUN" = false ]; then
    echo "💾 Committing changes..."
    git add .
    git commit -m "chore: release v$new_version"
    echo "✅ Changes committed"
else
    echo "✅ Would commit changes"
fi

# Create and push tag
if [ "$DRY_RUN" = false ]; then
    echo "🏷️  Creating tag..."
    git tag -a "v$new_version" -m "Release v$new_version"
    echo "✅ Tag created"
    
    echo "📤 Pushing to origin..."
    git push origin main
    git push origin "v$new_version"
    echo "✅ Pushed to origin"
else
    echo "✅ Would create and push tag v$new_version"
fi

echo ""
echo "🎉 Release completed successfully!"
echo ""
echo "Release Summary:"
echo "- Version: $current_version → $new_version"
echo "- Type: $RELEASE_TYPE"
echo "- Tag: v$new_version"
echo ""
echo "Next steps:"
echo "1. Update the changelog with specific changes"
echo "2. Create a GitHub release with release notes"
echo "3. Deploy to production environments"
echo "4. Announce the release to the team"

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "ℹ️  This was a dry run. No changes were made."
fi
# IQ24 Scripts

This directory contains utility scripts for managing the IQ24 AI platform development workflow.

## Available Scripts

### 🚀 `setup.sh`
Initial setup script for the development environment.

**Usage:**
```bash
./scripts/setup.sh
```

**What it does:**
- Checks for required dependencies (bun, node.js)
- Installs global dependencies (supabase, mintlify)
- Sets up environment files from templates
- Builds packages
- Provides next steps guidance

### 🔧 `dev.sh`
Development environment startup script.

**Usage:**
```bash
./scripts/dev.sh
```

**What it does:**
- Starts all services in development mode
- Manages service ports and processes
- Provides graceful shutdown on Ctrl+C
- Displays service URLs

**Services started:**
- Dashboard: `http://localhost:3000`
- Website: `http://localhost:3001`
- API: `http://localhost:54321`
- Engine: `http://localhost:8787`
- Documentation: `http://localhost:3004`

### 🏗️ `build.sh`
Production build script.

**Usage:**
```bash
./scripts/build.sh
```

**What it does:**
- Builds all packages and applications
- Runs type checking
- Runs linting
- Runs tests
- Provides build output information

### 🧪 `test.sh`
Comprehensive test runner.

**Usage:**
```bash
./scripts/test.sh
```

**What it does:**
- Runs unit tests for all packages
- Runs integration tests
- Runs end-to-end tests
- Provides detailed test results
- Exits with proper status codes

### 🧹 `clean.sh`
Cleanup script for build artifacts and dependencies.

**Usage:**
```bash
./scripts/clean.sh [OPTIONS]
```

**Options:**
- `--full`: Clean everything (default)
- `--deps-only`: Clean only dependencies
- `--build-only`: Clean only build artifacts
- `--help`: Show help message

**What it does:**
- Removes node_modules directories
- Cleans build outputs
- Clears cache files
- Removes temporary files
- Cleans OS-specific files

### 🚀 `release.sh`
Version management and release script.

**Usage:**
```bash
./scripts/release.sh [RELEASE_TYPE] [OPTIONS]
```

**Release Types:**
- `--major`: Major version bump (1.0.0 → 2.0.0)
- `--minor`: Minor version bump (1.0.0 → 1.1.0)
- `--patch`: Patch version bump (1.0.0 → 1.0.1)

**Options:**
- `--skip-tests`: Skip running tests
- `--skip-build`: Skip building applications
- `--dry-run`: Show what would be done without making changes
- `--help`: Show help message

**What it does:**
- Updates version numbers in all package.json files
- Runs tests and builds
- Creates changelog entries
- Creates git tags
- Pushes to remote repository

## Quick Start

1. **Initial Setup:**
   ```bash
   ./scripts/setup.sh
   ```

2. **Start Development:**
   ```bash
   ./scripts/dev.sh
   ```

3. **Run Tests:**
   ```bash
   ./scripts/test.sh
   ```

4. **Build for Production:**
   ```bash
   ./scripts/build.sh
   ```

5. **Clean Everything:**
   ```bash
   ./scripts/clean.sh
   ```

## Development Workflow

### Daily Development
```bash
# Start development
./scripts/dev.sh

# In another terminal, run tests
./scripts/test.sh

# Clean up when needed
./scripts/clean.sh --build-only
```

### Before Commit
```bash
# Run all checks
./scripts/test.sh
./scripts/build.sh

# Format and lint
bun run format
bun run lint
```

### Release Process
```bash
# Create a patch release
./scripts/release.sh --patch

# Create a minor release with dry run first
./scripts/release.sh --minor --dry-run
./scripts/release.sh --minor
```

## Script Permissions

All scripts should be executable. If you encounter permission issues, run:

```bash
chmod +x scripts/*.sh
```

## Dependencies

The scripts require the following tools to be installed:

### Required
- **bun**: Package manager and runtime
- **node.js**: JavaScript runtime
- **git**: Version control

### Optional (installed by setup.sh)
- **supabase**: Database and auth platform CLI
- **mintlify**: Documentation platform CLI

## Environment Variables

The scripts will set up environment files automatically, but you may need to configure:

- `apps/api/.env` - API configuration
- `apps/dashboard/.env` - Dashboard configuration
- `apps/website/.env` - Website configuration
- `apps/engine/.dev.vars` - Engine configuration

## Troubleshooting

### Common Issues

1. **Permission Denied:**
   ```bash
   chmod +x scripts/*.sh
   ```

2. **Dependencies Not Found:**
   ```bash
   ./scripts/setup.sh
   ```

3. **Port Already in Use:**
   ```bash
   # Kill processes on specific ports
   lsof -ti:3000 | xargs kill -9
   ```

4. **Build Failures:**
   ```bash
   ./scripts/clean.sh
   bun install
   ./scripts/build.sh
   ```

### Getting Help

Each script has a `--help` option that provides detailed usage information:

```bash
./scripts/setup.sh --help
./scripts/dev.sh --help
./scripts/build.sh --help
./scripts/test.sh --help
./scripts/clean.sh --help
./scripts/release.sh --help
```

## Contributing

When adding new scripts:

1. Follow the existing naming convention
2. Add appropriate help text and error handling
3. Update this README with documentation
4. Make scripts executable (`chmod +x`)
5. Test on both development and CI environments
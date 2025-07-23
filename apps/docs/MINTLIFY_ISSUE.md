# Mintlify Setup Issue

## Current Problem
Mintlify documentation server is currently experiencing a module resolution issue with lodash dependency.

## Error Details
```
Error: Cannot find package '/home/runner/app/node_modules/lodash/index.js' imported from /home/runner/app/node_modules/@mintlify/common/dist/openapi/truncateCircularReferences.js
```

## Attempted Solutions
1. ✅ Installed lodash at workspace level
2. ✅ Installed Mintlify globally via bun
3. ✅ Installed Mintlify globally via npm
4. ✅ Installed lodash globally
5. ❌ Module resolution issue persists

## Current Status
- Documentation files are ready and properly structured
- Mintlify configuration (mint.json) is valid
- Issue appears to be with Mintlify's internal dependency resolution in Node.js v22.16.0
- Services are configured to run without docs server for now

## Workaround
To run documentation server manually when needed:
```bash
cd apps/docs
# Try with different Node versions or Mintlify alternatives
```

## Next Steps
1. Consider using alternative documentation solutions (Docusaurus, GitBook, etc.)
2. Monitor Mintlify updates for Node.js v22 compatibility
3. Test with different Node.js versions if needed

## Files
- `mint.json` - Mintlify configuration
- `*.mdx` files - Documentation content
- `api-reference/` - API documentation structure
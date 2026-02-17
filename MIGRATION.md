# Migration from Monorepo to Standalone App

This document explains the restructuring of the African Fashion eCommerce project from a monorepo structure to a standalone Next.js application.

## What Changed?

### Before (Monorepo Structure)
```
african-fashion-ecommerce/
├── apps/
│   └── frontend/         # Next.js app
│       ├── src/
│       ├── package.json
│       └── ...config files
├── package.json          # Root workspace config
└── ...
```

### After (Standalone Structure)
```
african-fashion-ecommerce/
├── src/                  # Moved from apps/frontend/src
├── package.json          # Combined dependencies
├── next.config.js        # Moved from apps/frontend
├── tsconfig.json         # Moved from apps/frontend
└── ...all config files at root
```

## Why the Change?

1. **Simpler Deployment**: Railway and similar platforms work better with standalone apps
2. **Easier CI/CD**: No need to navigate to subdirectories
3. **Clearer Structure**: One app = one repository
4. **Better DX**: Simplified development workflow

## What Was Added?

### Deployment Files
- `.nvmrc` - Specifies Node.js version (20)
- `vercel.json` - Vercel deployment configuration
- `ecosystem.config.js` - PM2 process manager configuration
- `.env.example` - Environment variables template
- `.gitignore` - Updated for standalone structure

### Scripts
- `start.sh` - Quick start for local development
- `build.sh` - Production build script

### Documentation
- `README.md` - Project overview and quick start
- `DEPLOYMENT_SIMPLE.md` - Comprehensive deployment guide
- `MIGRATION.md` - This file

## Migration Steps (Already Done)

If you need to understand what was done or replicate it:

1. **Copied frontend code to root**:
   ```bash
   cp -r apps/frontend/src .
   cp apps/frontend/*.js .
   cp apps/frontend/*.json .
   ```

2. **Merged package.json**:
   - Took dependencies from `apps/frontend/package.json`
   - Removed workspace configuration
   - Updated scripts for root-level execution

3. **Updated configurations**:
   - Fixed `tsconfig.json` paths
   - Updated `.eslintrc.json`
   - Configured `next.config.js` for standalone output

4. **Fixed import issues**:
   - Updated font imports in layout
   - Fixed Three.js version format
   - Added missing type definitions

5. **Created deployment files**:
   - Added `.nvmrc` with Node 20
   - Created `vercel.json`
   - Created `ecosystem.config.js`
   - Created `.env.example`

6. **Updated `.gitignore**:
   - Excluded `apps/` directory
   - Added deployment artifacts

## For Developers

### If You Have Local Changes in `apps/frontend`

Your old work is still in the `apps/frontend` directory, but it's now excluded from git. 

**To migrate your local changes**:

1. Compare your local `apps/frontend` with the new `src`:
   ```bash
   diff -r apps/frontend/src src
   ```

2. Copy any custom changes to the new locations:
   ```bash
   # Example: copy a modified file
   cp apps/frontend/src/components/MyComponent.tsx src/components/
   ```

3. Clean up when done:
   ```bash
   rm -rf apps/
   ```

### Working with the New Structure

Everything is now at the root level:

- Source code: `src/`
- Configuration: `*.config.js`, `tsconfig.json`, etc.
- Scripts: `npm run dev`, `npm run build`, etc.
- Environment: `.env` (copy from `.env.example`)

## Deployment

The new structure deploys easily to:

- **Railway**: Auto-detected as Next.js
- **Vercel**: One-click deploy button
- **Netlify**: Automatic detection
- **Docker**: Use the example Dockerfile in DEPLOYMENT_SIMPLE.md

See [DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md) for detailed instructions.

## Rollback (If Needed)

If you need to go back to the monorepo structure:

1. Checkout the commit before this migration
2. Or manually move files back:
   ```bash
   mkdir -p apps/frontend
   mv src apps/frontend/
   mv *.config.js apps/frontend/
   # ... etc
   ```

## Questions?

If you have questions about the migration, please:

1. Check [DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md)
2. Review the commit history
3. Open an issue on GitHub

---

**Migration Date**: 2026-02-17  
**Reason**: Simplify deployment to Railway and other platforms  
**Impact**: Breaking change for existing deployments (requires reconfiguration)

# Railway Deployment Guide for African Fashion eCommerce Frontend

This guide provides step-by-step instructions for deploying the Next.js frontend application to Railway.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Service Creation](#manual-service-creation)
- [Environment Variables](#environment-variables)
- [Build and Start Commands](#build-and-start-commands)
- [Monorepo Configuration](#monorepo-configuration)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

---

## Prerequisites

Before deploying to Railway, ensure you have:

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: This repository connected to your Railway account
3. **Node.js**: Version 20.x (recommended)
4. **Dependencies**: All packages in `apps/frontend/package.json` are valid

---

## Quick Start

### Option 1: Deploy with Railway Button

If available, click the Railway deploy button in the repository README to automatically configure and deploy the service.

### Option 2: Deploy via Railway Dashboard

1. Go to [railway.app/new](https://railway.app/new)
2. Select "Deploy from GitHub repo"
3. Choose this repository (`agolomola/african-fashion-ecommerce`)
4. Follow the [Manual Service Creation](#manual-service-creation) steps below

---

## Manual Service Creation

### Step 1: Create New Project

1. Log in to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account (if not already done)
5. Select the `agolomola/african-fashion-ecommerce` repository

### Step 2: Configure Service

Since this is a monorepo, Railway needs to know where the frontend app is located:

1. After selecting the repository, Railway will create a service
2. Go to the service settings
3. Navigate to the "Service" section
4. Set the **Root Directory** to: `apps/frontend`

### Step 3: Set Build and Start Commands

Railway should automatically detect the Next.js app, but verify these settings:

#### Build Command
```bash
npm ci && npm run build
```

Or if you're at the repository root:
```bash
cd apps/frontend && npm ci && npm run build
```

#### Start Command
```bash
npm start
```

Or if you're at the repository root:
```bash
cd apps/frontend && npm start
```

### Step 4: Configure Environment Variables

See the [Environment Variables](#environment-variables) section below.

---

## Environment Variables

Set these environment variables in Railway Dashboard under your service's "Variables" section:

### Required Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NODE_ENV` | Node environment | `production` |
| `NODE_VERSION` | Node.js version | `20.x` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-api.railway.app` |

### Optional Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `PORT` | Port to run the app | `3000` (Railway sets this automatically) |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL | `https://your-app.railway.app` |

### Setting Variables in Railway

1. Open your service in Railway Dashboard
2. Click on the "Variables" tab
3. Click "+ New Variable"
4. Add the variable name and value
5. Click "Add"
6. Railway will automatically redeploy with the new variables

---

## Build and Start Commands

### Using railway.toml (Recommended for Monorepo)

The repository includes a `railway.toml` file at the root with the following configuration:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "cd apps/frontend && npm ci && npm run build"

[deploy]
startCommand = "cd apps/frontend && npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_VERSION = "20.x"
NODE_ENV = "production"
```

### Using railway.json (Alternative)

The `apps/frontend/railway.json` file provides an alternative configuration when the root directory is set to `apps/frontend`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Manual Configuration

If Railway doesn't pick up the configuration files, manually set:

1. **Build Command**: 
   - With root directory set to `apps/frontend`: `npm ci && npm run build`
   - From repository root: `cd apps/frontend && npm ci && npm run build`

2. **Start Command**:
   - With root directory set to `apps/frontend`: `npm start`
   - From repository root: `cd apps/frontend && npm start`

---

## Monorepo Configuration

This project uses a monorepo structure with the frontend app located in `apps/frontend`.

### Approach 1: Set Root Directory (Recommended)

In Railway service settings:
1. Go to "Settings" → "Service"
2. Set **Root Directory**: `apps/frontend`
3. Railway will run all commands from this directory
4. Use `railway.json` configuration in `apps/frontend/`

### Approach 2: Use Repository Root

Keep root directory as `.` (repository root) and:
1. Use `railway.toml` at repository root
2. Build command should `cd` into `apps/frontend`
3. Start command should `cd` into `apps/frontend`

---

## Troubleshooting

### Build Failures

#### Issue: "Cannot find module 'next'"
**Solution**: Ensure the build command includes `npm ci` to install dependencies:
```bash
npm ci && npm run build
```

#### Issue: "Build command not found"
**Solution**: Verify that `package.json` in `apps/frontend` has the build script:
```json
{
  "scripts": {
    "build": "next build"
  }
}
```

#### Issue: "Memory exceeded during build"
**Solution**: 
1. Check Railway plan limits
2. Optimize build by reducing dependencies
3. Set `NODE_OPTIONS` environment variable: `--max-old-space-size=4096`

### Deployment Failures

#### Issue: "Application failed to start"
**Solution**: 
1. Check logs in Railway Dashboard
2. Verify start command is correct: `npm start`
3. Ensure `next start` is in package.json scripts
4. Check that PORT environment variable is not hardcoded

#### Issue: "Module not found in production"
**Solution**: 
1. Check if the package is in `dependencies` (not `devDependencies`)
2. Verify `npm ci` is running during build
3. Check `.railwayignore` isn't excluding necessary files

### Runtime Errors

#### Issue: "API connection failed"
**Solution**: 
1. Verify `NEXT_PUBLIC_API_URL` environment variable is set correctly
2. Check backend service is running and accessible
3. Ensure CORS is configured on the backend

#### Issue: "Environment variables not working"
**Solution**: 
1. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
2. Server-side variables don't need the prefix
3. Restart the service after adding new variables
4. Rebuild the app if you changed build-time variables

### Monorepo Issues

#### Issue: "Package.json not found"
**Solution**: Set the Root Directory to `apps/frontend` in Railway service settings

#### Issue: "Workspaces error"
**Solution**: Don't use workspace commands in Railway. Use `cd apps/frontend && npm ci` instead of workspace-aware commands.

---

## Advanced Configuration

### Custom Domain

1. Go to "Settings" → "Networking"
2. Click "Generate Domain" for a Railway subdomain
3. Or add your custom domain and configure DNS

### Health Checks

Railway automatically performs health checks on your app. The Next.js app should respond to HTTP requests on the configured PORT.

### Scaling

Railway offers:
- **Horizontal Scaling**: Multiple instances (available on Pro plan)
- **Vertical Scaling**: More CPU/RAM per instance

### Continuous Deployment

Railway automatically deploys when you push to the connected branch:
1. Go to "Settings" → "Service"
2. Configure "Branch" to deploy from (e.g., `main` or `production`)
3. Enable "Auto Deploy" to deploy on every push

### Build Optimization

To speed up builds:

1. **Use Build Cache**: Railway caches `node_modules` between builds
2. **Minimize Dependencies**: Review and remove unused packages
3. **Optimize Next.js**: Use `output: 'standalone'` in `next.config.js`

Example `next.config.js` optimization:
```javascript
const nextConfig = {
  output: 'standalone',
  // ... other config
}
```

### Logs and Monitoring

View logs in Railway Dashboard:
1. Click on your service
2. Go to "Deployments" tab
3. Click on a deployment to view build and runtime logs
4. Use the search/filter to find specific log entries

### Database Connection

If your frontend needs to connect to a database (usually through the backend):
1. Deploy backend service first
2. Note the backend URL
3. Set `NEXT_PUBLIC_API_URL` to point to the backend
4. Backend handles database connections

---

## Support

### Railway Documentation
- [Railway Docs](https://docs.railway.app)
- [Next.js on Railway](https://docs.railway.app/guides/nextjs)

### Common Resources
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)

### Project-Specific Issues
If you encounter issues specific to this project, please:
1. Check the [GitHub Issues](https://github.com/agolomola/african-fashion-ecommerce/issues)
2. Review deployment logs in Railway Dashboard
3. Verify all environment variables are correctly set
4. Ensure the backend service is deployed and accessible

---

## Deployment Checklist

Before deploying, ensure:

- [ ] Railway account is set up
- [ ] Repository is connected to Railway
- [ ] Root directory is set to `apps/frontend` (or commands use `cd apps/frontend`)
- [ ] Build command: `npm ci && npm run build`
- [ ] Start command: `npm start`
- [ ] Environment variables are configured:
  - [ ] `NODE_ENV=production`
  - [ ] `NODE_VERSION=20.x`
  - [ ] `NEXT_PUBLIC_API_URL` (backend URL)
- [ ] Backend service is deployed (if needed)
- [ ] Domain is configured (optional)
- [ ] Auto-deploy is enabled

---

## Quick Reference Commands

### Build Command (from repository root)
```bash
cd apps/frontend && npm ci && npm run build
```

### Build Command (from apps/frontend)
```bash
npm ci && npm run build
```

### Start Command (from repository root)
```bash
cd apps/frontend && npm start
```

### Start Command (from apps/frontend)
```bash
npm start
```

### Local Testing
```bash
cd apps/frontend
npm ci
npm run build
npm start
# Visit http://localhost:3000
```

---

## Next Steps

After successful deployment:

1. **Test the Application**: Visit the deployed URL and test all features
2. **Configure Domain**: Set up a custom domain if desired
3. **Set Up Monitoring**: Use Railway logs and metrics
4. **Deploy Backend**: Deploy the backend service if not already done
5. **Update API URL**: Ensure frontend points to the correct backend URL
6. **Enable Auto-Deploy**: Configure CD for automatic deployments

---

**Note**: This is a Next.js 14 application using React 18, Tailwind CSS, and modern features. Ensure your Railway service has sufficient resources for optimal performance.

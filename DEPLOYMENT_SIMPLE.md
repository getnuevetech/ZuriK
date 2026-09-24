# Simple Deployment Guide for African Fashion eCommerce

> This file describes an older single Next.js app (NextAuth, Vercel, Railway). It does not match the current repository. To deploy the NestJS API and the `frontend/` Next.js app on AWS Lightsail, follow [docs/LIGHTSAIL.md](docs/LIGHTSAIL.md).

This guide will help you deploy the African Fashion eCommerce platform to various hosting providers with minimal configuration.

## 📋 Prerequisites

- Node.js 20.x or later
- A GitHub account
- A hosting platform account (Railway, Vercel, or Netlify)

## 🚂 Railway Deployment (Recommended)

Railway is the easiest way to deploy this Next.js application. Follow these steps:

### Step 1: Prepare Your Repository

1. Ensure all changes are committed and pushed to GitHub
2. Make sure your repository is public or you have Railway connected to your GitHub account

### Step 2: Deploy to Railway

1. **Go to Railway**: Visit [railway.app](https://railway.app)
2. **Sign In**: Click "Login" and sign in with GitHub
3. **New Project**: Click "New Project"
4. **Deploy from GitHub repo**: Select "Deploy from GitHub repo"
5. **Select Repository**: Choose `agolomola/african-fashion-ecommerce`
6. **Deploy Now**: Click "Deploy Now"

That's it! Railway will automatically:
- Detect that it's a Next.js project
- Read the Node version from `.nvmrc`
- Install dependencies with `npm install`
- Build with `npm run build`
- Start with `npm start`

### Step 3: Configure Environment Variables

After deployment:

1. **Open Your Project**: Click on your deployed project in Railway
2. **Go to Variables Tab**: Click on "Variables" in the left sidebar
3. **Add Variables**: Add the following environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=https://your-app.railway.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   STRIPE_SECRET_KEY=sk_live_your_key
   NODE_ENV=production
   ```
4. **Generate Domain**: Railway will automatically generate a domain like `african-fashion-ecommerce-production.up.railway.app`
5. **Custom Domain (Optional)**: Click "Settings" → "Domains" to add your custom domain

### Step 4: Verify Deployment

1. Click on the generated URL
2. Your site should be live! 🎉

### Common Railway Issues & Fixes

#### Issue: Build fails with "Cannot find module"
**Fix**: Check that all dependencies are in `package.json` under `dependencies` (not `devDependencies`)

#### Issue: App crashes on start
**Fix**: 
- Check the logs in Railway dashboard
- Ensure `NEXT_PUBLIC_API_URL` is set correctly
- Verify Node version matches `.nvmrc`

#### Issue: "Module not found" errors
**Fix**: Run `npm install` locally and commit any missing `package-lock.json` changes

#### Issue: Environment variables not working
**Fix**: 
- Restart the deployment after adding variables
- Ensure variables starting with `NEXT_PUBLIC_` for client-side access

## ▲ Vercel Deployment

Vercel is optimized for Next.js applications.

### Quick Deploy to Vercel

1. **Go to Vercel**: Visit [vercel.com](https://vercel.com)
2. **Import Project**: Click "New Project" → "Import Git Repository"
3. **Select Repo**: Choose your GitHub repository
4. **Configure**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Environment Variables**: Add the same variables as Railway
6. **Deploy**: Click "Deploy"

### Vercel Configuration

The `vercel.json` file is already configured for optimal deployment.

## 🎯 Netlify Deployment

### Deploy to Netlify

1. **Go to Netlify**: Visit [netlify.com](https://netlify.com)
2. **New Site**: Click "New site from Git"
3. **Connect to Git**: Choose GitHub and select your repository
4. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: leave empty
5. **Environment Variables**: Add your environment variables
6. **Deploy**: Click "Deploy site"

### Netlify Configuration

Create a `netlify.toml` file if needed:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## 🐳 Docker Deployment

For custom deployments or when you need more control:

### Create Dockerfile

Create a `Dockerfile` in the root:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Deploy with Docker

```bash
# Build
docker build -t african-fashion-ecommerce .

# Run
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=your-api-url african-fashion-ecommerce
```

## 🔧 Local Testing Before Deployment

Always test locally before deploying:

```bash
# Development
./start.sh

# Production build test
./build.sh
npm start
```

## 📝 Environment Variables Reference

Required variables for production:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.example.com` |
| `NEXTAUTH_SECRET` | NextAuth secret | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app URL | `https://yourapp.railway.app` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_live_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `NODE_ENV` | Environment | `production` |

## 🐛 Troubleshooting

### General Issues

1. **Blank page / 404 errors**
   - Check that `next.config.js` is at root level
   - Verify build completed successfully
   - Check browser console for errors

2. **API connection issues**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS settings on your backend
   - Ensure backend is deployed and accessible

3. **Build timeouts**
   - Increase build timeout in platform settings
   - Remove unused dependencies
   - Optimize large packages

### Platform-Specific Tips

**Railway:**
- Build logs are in the "Deployments" tab
- Increase memory if builds fail (Settings → Resources)
- Use Railway CLI for debugging: `railway logs`

**Vercel:**
- Build logs available in deployment details
- Function timeout is 10s on hobby plan (60s on pro)
- Use `vercel dev` for local testing with Vercel environment

**Netlify:**
- Check build logs in "Deploys" tab
- Clear cache and retry if build fails
- Use Netlify CLI: `netlify dev` for local testing

## 🎉 Success Checklist

- [ ] Repository is pushed to GitHub
- [ ] `.env.example` copied to `.env` with production values
- [ ] All environment variables configured on platform
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic on all platforms)
- [ ] Application loads without errors
- [ ] Can navigate to different pages
- [ ] API connection working
- [ ] Payment integration tested (if applicable)

## 🆘 Need Help?

- **Railway**: [railway.app/help](https://railway.app/help)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

## 🚀 Next Steps

After successful deployment:

1. Set up monitoring (e.g., Sentry, LogRocket)
2. Configure analytics (e.g., Google Analytics, Plausible)
3. Set up automatic deployments on push
4. Add custom domain
5. Configure CDN if needed
6. Set up backup strategy

---

**Note**: This application is now a standalone Next.js app (not a monorepo), making it much easier to deploy!

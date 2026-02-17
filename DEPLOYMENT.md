# African Fashion eCommerce - Deployment Guide

This guide provides comprehensive instructions for deploying the African Fashion eCommerce platform to production using Railway, along with general deployment best practices.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Railway Deployment](#railway-deployment)
- [Environment Variables Setup](#environment-variables-setup)
- [Database Migration](#database-migration)
- [Custom Domain Setup](#custom-domain-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Payment Accounts** (Optional but recommended):
   - Stripe account for payments
   - Cloudinary account for image storage
   - Email service (Mailtrap for testing, SendGrid for production)

---

## Railway Deployment

Railway makes deployment simple with automatic builds and deployments from GitHub.

### Step 1: Create a New Project

1. Log in to [Railway](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select the `african-fashion-ecommerce` repository

### Step 2: Add Services

You'll need to set up three services:

#### A. PostgreSQL Database

1. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will automatically provision the database
3. Note the connection details (automatically available as environment variables)

#### B. Backend Service

1. Click **"New"** → **"GitHub Repo"**
2. Select your repository
3. Configure the service:
   - **Name**: `african-fashion-backend`
   - **Root Directory**: `/`
   - **Build Command**: Leave empty (uses Dockerfile.backend)
   - **Start Command**: Leave empty (uses Dockerfile CMD)
   - **Dockerfile Path**: `Dockerfile.backend`
   - **Port**: `3001`

4. Add environment variables (see [Environment Variables](#backend-environment-variables) section)

#### C. Frontend Service

1. Click **"New"** → **"GitHub Repo"**
2. Select your repository again
3. Configure the service:
   - **Name**: `african-fashion-frontend`
   - **Root Directory**: `/`
   - **Build Command**: Leave empty (uses Dockerfile.frontend)
   - **Start Command**: Leave empty (uses Dockerfile CMD)
   - **Dockerfile Path**: `Dockerfile.frontend`
   - **Port**: `3000`

4. Add environment variables (see [Environment Variables](#frontend-environment-variables) section)

### Step 3: Configure Service Dependencies

1. Go to the backend service settings
2. Under **"Dependencies"**, link it to the PostgreSQL database
3. Go to the frontend service settings
4. Under **"Dependencies"**, link it to the backend service

---

## Environment Variables Setup

### Backend Environment Variables

Navigate to your backend service → **Variables** → Add the following:

```bash
# Database (Auto-configured by Railway when linked)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Manual Database Config (if not using DATABASE_URL)
DB_TYPE=postgres
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_SYNCHRONIZE=false

# Application
NODE_ENV=production
PORT=3001
API_PREFIX=api

# CORS (Use your Railway frontend URL)
CORS_ORIGIN=${{african-fashion-frontend.RAILWAY_PUBLIC_DOMAIN}}

# JWT - Generate secure random strings
JWT_SECRET=<generate-random-32-char-string>
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=<generate-random-32-char-string>
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>

# PayPal
PAYPAL_CLIENT_ID=<your-paypal-client-id>
PAYPAL_CLIENT_SECRET=<your-paypal-client-secret>
PAYPAL_MODE=live

# Email (Use SendGrid or AWS SES for production)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=<your-sendgrid-api-key>
MAIL_FROM=noreply@yourdomain.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

**Generate Secure Secrets:**
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Frontend Environment Variables

Navigate to your frontend service → **Variables** → Add the following:

```bash
# Backend API (Use Railway backend URL)
NEXT_PUBLIC_API_URL=https://${{african-fashion-backend.RAILWAY_PUBLIC_DOMAIN}}/api

# NextAuth
NEXTAUTH_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=<generate-random-32-char-string>

# Payment Gateway Public Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<your-paypal-client-id>

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_SITE_NAME=African Fashion eCommerce

NODE_ENV=production
```

---

## Database Migration

After deploying the backend, you need to run database migrations:

### Method 1: Railway CLI

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Link to your project:
```bash
railway link
```

4. Run migrations:
```bash
railway run --service african-fashion-backend npm run migration:run
```

### Method 2: One-off Command in Railway Dashboard

1. Go to your backend service
2. Click **"Settings"** → **"Deploy"** → **"One-off Command"**
3. Enter: `npm run migration:run`
4. Click **"Run Command"**

### Method 3: Manual Database Setup

If migrations fail, you can connect directly to the database:

1. Get database credentials from Railway
2. Use a database client (e.g., DBeaver, pgAdmin)
3. Connect to the database
4. Run migration SQL files manually from `apps/backend/src/database/migrations/`

---

## Custom Domain Setup

### Configure Your Domain

1. Go to your frontend service in Railway
2. Click **"Settings"** → **"Domains"**
3. Click **"Custom Domain"**
4. Enter your domain (e.g., `africanfashion.com`)
5. Railway will provide DNS records

### Update DNS Settings

Add these records to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare):

```
Type: CNAME
Name: @ (or your subdomain)
Value: <railway-provided-value>
TTL: Auto
```

### SSL Certificate

Railway automatically provisions SSL certificates via Let's Encrypt. This process takes 5-10 minutes after DNS propagation.

### Update Environment Variables

After setting up your custom domain, update:

**Backend:**
```bash
CORS_ORIGIN=https://yourdomain.com
```

**Frontend:**
```bash
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Monitoring & Logging

### View Logs in Railway

1. Go to your service in Railway
2. Click **"Deployments"** → Select deployment → **"View Logs"**
3. You can filter by service and time range

### Application Monitoring

Consider adding monitoring tools:

#### Sentry (Error Tracking)

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project
3. Add to backend `.env`:
```bash
SENTRY_DSN=<your-sentry-dsn>
```

#### LogRocket (Session Replay)

For frontend monitoring:
```bash
NEXT_PUBLIC_LOGROCKET_ID=<your-logrocket-id>
```

### Database Backups

Railway automatically backs up PostgreSQL databases. To manually backup:

1. Go to PostgreSQL service
2. Click **"Data"** → **"Backups"**
3. Click **"Create Backup"**

---

## Troubleshooting

### Common Issues

#### 1. Build Fails

**Problem**: Docker build fails with dependencies error

**Solution**:
- Check `package.json` files are up to date
- Ensure all dependencies are listed
- Check Railway build logs for specific errors
- Try: `npm install` locally to verify dependencies

#### 2. Backend Health Check Fails

**Problem**: Backend service shows unhealthy status

**Solution**:
- Verify database connection by checking logs
- Ensure environment variables are set correctly
- Check if migrations ran successfully
- Verify `PORT` is set to `3001` in backend env

#### 3. Frontend Can't Connect to Backend

**Problem**: API requests fail with CORS or connection errors

**Solution**:
- Verify `NEXT_PUBLIC_API_URL` points to backend Railway URL
- Check backend `CORS_ORIGIN` includes frontend URL
- Ensure both services are running
- Check network tab in browser dev tools

#### 4. Database Connection Failed

**Problem**: Backend logs show database connection errors

**Solution**:
- Verify PostgreSQL service is running
- Check backend has dependency link to PostgreSQL
- Verify database credentials in env variables
- Try connecting manually with database client

#### 5. Payment Integration Not Working

**Problem**: Stripe/PayPal payments fail

**Solution**:
- Verify API keys are correct (test vs. production)
- Check webhook URLs are configured in Stripe/PayPal dashboard
- Ensure public keys are set in frontend env
- Test with Stripe test cards: `4242 4242 4242 4242`

#### 6. Images Not Uploading

**Problem**: Image uploads fail

**Solution**:
- Verify Cloudinary credentials are correct
- Check API key permissions
- Ensure upload preset is configured in Cloudinary
- Check file size limits

#### 7. Migrations Won't Run

**Problem**: Database migrations fail

**Solution**:
```bash
# Check current migration status
railway run --service african-fashion-backend npm run typeorm migration:show

# Revert last migration
railway run --service african-fashion-backend npm run migration:revert

# Run migrations again
railway run --service african-fashion-backend npm run migration:run
```

### Getting Help

#### Check Railway Status

- Visit [Railway Status Page](https://status.railway.app)

#### Community Support

- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- GitHub Issues: Create issue in your repository

#### Debugging Tips

1. **Enable Debug Logging:**
```bash
# Backend
DEBUG=*
LOG_LEVEL=debug

# Frontend
NEXT_PUBLIC_DEBUG=true
```

2. **Check Service Health:**
```bash
# Test backend health
curl https://your-backend-url.railway.app/api/health

# Test frontend
curl https://your-frontend-url.railway.app
```

3. **Database Connection Test:**
```bash
railway run --service african-fashion-backend psql $DATABASE_URL -c "SELECT version();"
```

---

## Performance Optimization

### Production Checklist

- [ ] Enable compression in backend
- [ ] Configure CDN for static assets (Cloudinary, CloudFlare)
- [ ] Set up proper caching headers
- [ ] Enable database connection pooling
- [ ] Configure proper logging levels
- [ ] Set up monitoring and alerts
- [ ] Test payment flows thoroughly
- [ ] Configure rate limiting
- [ ] Review security headers
- [ ] Set up automated backups

### Scaling

Railway automatically scales based on usage. To manually scale:

1. Go to service **"Settings"**
2. Adjust **"Resources"** (CPU/Memory)
3. Enable horizontal scaling if needed

---

## Security Best Practices

1. **Secrets Management**
   - Never commit `.env` files
   - Use Railway's environment variables
   - Rotate secrets regularly

2. **API Security**
   - Enable rate limiting
   - Validate all inputs
   - Use HTTPS only
   - Implement CORS properly

3. **Database Security**
   - Use connection pooling
   - Enable SSL connections
   - Regular backups
   - Limit database access

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor API response times
   - Track failed authentication attempts
   - Set up uptime monitoring

---

## Next Steps

After successful deployment:

1. Test all features thoroughly
2. Set up monitoring and alerting
3. Configure automated backups
4. Plan for scaling strategy
5. Document your deployment process
6. Set up CI/CD pipelines for automated deployments

---

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Documentation](https://docs.nestjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe Documentation](https://stripe.com/docs)
- [API Documentation](./API.md)

---

**Need Help?** Open an issue in the GitHub repository or contact the development team.

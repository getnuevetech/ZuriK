# Railway Deployment Guide - African Fashion eCommerce Backend

Step-by-step guide for deploying the NestJS backend to Railway.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start (5 Minutes)](#quick-start-5-minutes)
- [PostgreSQL Database Setup](#postgresql-database-setup)
- [Environment Variables](#environment-variables)
- [Database Migration](#database-migration)
- [Verify Deployment](#verify-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Railway account](https://railway.app) (free tier available)
- GitHub account with this repository forked or accessible
- Local `.env` configured (see `.env.example`)

---

## Quick Start (5 Minutes)

### Step 1: Create Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select this repository (`agolomola/african-fashion-ecommerce`)
4. Railway auto-detects the `Dockerfile` and starts building

### Step 2: Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway automatically provisions the database and sets `DATABASE_URL`

### Step 3: Set Environment Variables

In Railway dashboard → your service → **"Variables"** tab:

```
NODE_ENV=production
JWT_ACCESS_SECRET=<generate with: openssl rand -base64 64>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 64>
GOOGLE_CALLBACK_URL=https://<your-service>.railway.app/auth/google/callback
FRONTEND_URL=https://<your-frontend>.railway.app
```

> **Note:** `DATABASE_URL` and `PORT` are set automatically by Railway.

### Step 4: Deploy

Railway deploys automatically after each push to the connected branch.

To trigger a manual deploy: Railway dashboard → **"Deploy"** button.

### Step 5: Test

Visit `https://<your-service>.railway.app/health` — you should see:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 42,
  "database": "connected",
  "version": "1.0.0"
}
```

---

## PostgreSQL Database Setup

Railway auto-provisions PostgreSQL when you add the plugin. The connection string is automatically injected as `DATABASE_URL`.

### Schema

Tables are created automatically via TypeORM `synchronize: true` on first startup:

| Table | Description |
|-------|-------------|
| `products` | Product catalogue with name, description, price |
| `fabrics` | Fabric types with origin and pricing |
| `designers` | Designer profiles |

### Seed Data

The `SeedService` automatically seeds the database with sample products, fabrics, and designers on first startup (only if tables are empty).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Auto-set | PostgreSQL connection string (Railway sets this) |
| `NODE_ENV` | ✅ | Set to `production` on Railway |
| `PORT` | ✅ Auto-set | Port number (Railway sets this automatically) |
| `JWT_ACCESS_SECRET` | ✅ | Secret for signing JWT access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Secret for signing JWT refresh tokens |
| `GOOGLE_CLIENT_ID` | ⬜ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ⬜ | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | ⬜ | OAuth callback: `https://<app>.railway.app/auth/google/callback` |
| `FRONTEND_URL` | ⬜ | Frontend URL for CORS configuration |

---

## Database Migration

TypeORM `synchronize: true` handles schema creation/updates automatically on startup.

For production migration best practices (Phase 2+), replace `synchronize: true` with TypeORM migrations:

```bash
# Generate a migration
npx typeorm migration:generate -n InitialSchema

# Run migrations
npx typeorm migration:run
```

---

## Verify Deployment

### Health Check

```bash
curl https://<your-service>.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 42,
  "database": "connected",
  "version": "1.0.0"
}
```

### API Endpoints

```bash
# Products
curl https://<your-service>.railway.app/products

# Fabrics
curl https://<your-service>.railway.app/fabrics

# Designers
curl https://<your-service>.railway.app/designers
```

---

## Troubleshooting

### Build fails: "Cannot find module"

Ensure all dependencies are in `dependencies` (not `devDependencies`):
```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express
```

### "DATABASE_URL not set"

Add the Railway PostgreSQL plugin to your project:
1. Railway dashboard → **"+ New"** → **"Database"** → **"PostgreSQL"**

### "SSL connection error"

`NODE_ENV=production` enables SSL automatically. Ensure it is set in Railway Variables.

### Database not connecting

Check Railway logs:
1. Railway dashboard → your service → **"Deployments"** → latest deployment → **"View Logs"**

### Port binding error

Railway sets `PORT` automatically. Do not hardcode it. The app reads `process.env.PORT`.

---

## Deployment Checklist

- [ ] Railway account created
- [ ] Repository connected to Railway
- [ ] PostgreSQL plugin added (auto-sets `DATABASE_URL`)
- [ ] `NODE_ENV=production` set
- [ ] `JWT_ACCESS_SECRET` set (strong random value)
- [ ] `JWT_REFRESH_SECRET` set (strong random value)
- [ ] Deployment succeeded (green status)
- [ ] Health check returns `{ status: 'ok', database: 'connected' }`
- [ ] `/products`, `/fabrics`, `/designers` endpoints return data

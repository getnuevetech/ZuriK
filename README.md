# African Fashion Marketplace API

A privacy-first African fashion marketplace backend built with NestJS, connecting Designers, Fabric Sellers, Customers, QA, and Admin.

## 🚀 Phase 1: Backend Foundation

This is Phase 1 of the phased development plan, establishing the backend foundation:

- **Authentication**: JWT-based auth (register, login, refresh, profile)
- **User Management**: Full CRUD for users with role-based access
- **Database**: PostgreSQL with TypeORM
- **API Docs**: Swagger at `/docs`

## 🏗️ Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL 15 with TypeORM
- **Auth**: JWT (access + refresh tokens) with Passport
- **Validation**: class-validator + class-transformer
- **Docs**: Swagger / OpenAPI

## 🐳 Running with Docker Compose

```bash
# Copy environment variables
cp .env.example .env

# Start services
docker compose up --build

# API available at http://localhost:3000
# Swagger docs at http://localhost:3000/docs
```

## 🌱 Running Seeds

```bash
# Development (ts-node)
npm run seed

# Production (after build)
npm run seed:prod
```

Seeds create one user per role:
- `admin@africanfashion.com` — Admin
- `designer@africanfashion.com` — Designer
- `seller@africanfashion.com` — Fabric Seller
- `qa@africanfashion.com` — QA
- `customer@africanfashion.com` — Customer

All with password: `Password123!`

## 📦 Available Scripts

- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run start:dev` — Start development server with hot reload
- `npm run seed` — Seed database (development)
- `npm run seed:prod` — Seed database (production)

## 🔑 Environment Variables

See `.env.example` for required variables:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/african_fashion_db
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=development
PORT=3000
AUTO_SYNC=true
```

## 🔒 Database SSL in Production

When `NODE_ENV=production`, SSL is required for all database connections and certificate validation is **always enforced** (`rejectUnauthorized: true`). This protects against man-in-the-middle attacks.

### Managed databases (Railway, AWS RDS, etc.)

If your database uses a private CA (common with Railway Postgres, AWS RDS, and similar services), set the `DATABASE_CA_CERT` environment variable to the PEM-encoded CA certificate:

```bash
# Single-line value — replace actual newlines with \n
DATABASE_CA_CERT="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
```

**Railway**: Download the CA cert from your Railway Postgres service dashboard under *Connect → SSL Certificates*, then set the variable in your Railway service environment.

**AWS RDS**: Download the appropriate regional bundle from https://truststore.pki.rds.amazonaws.com and set `DATABASE_CA_CERT` to its contents.

If `DATABASE_CA_CERT` is not set, the connection uses the system's default CA store (suitable for databases whose certificates chain to a public CA, e.g. Neon, Supabase).

## 📚 API Documentation

Swagger docs available at `http://localhost:3000/docs` after starting the server.

### Phase 1 Endpoints

**Authentication** (`/auth`):
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login
- `POST /auth/refresh` — Refresh tokens
- `GET /auth/profile` — Get current user (requires JWT)

**Users** (`/users`):
- `GET /users` — List all users
- `GET /users/:id` — Get user by ID
- `PATCH /users/:id` — Update user
- `DELETE /users/:id` — Deactivate user

## 🗺️ Development Phases

- **Phase 1** ✅ — Backend Foundation (Auth + User Management)
- **Phase 2** 🔜 — Products & Fabrics
- **Phase 3** 🔜 — Orders & Payments
- **Phase 4** 🔜 — QA Workflow
- **Phase 5** 🔜 — Notifications & Admin Dashboard

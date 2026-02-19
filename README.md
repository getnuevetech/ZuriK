# African Fashion E-commerce API

A NestJS backend API for the African Fashion E-commerce Platform.

## Quick Start

### Prerequisites
- Docker & Docker Compose

### Run with Docker

```bash
docker-compose up
```

The API will be available at http://localhost:3000

### Run locally

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Start dev server (requires PostgreSQL)
npm run start:dev
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Register new user | No |
| POST | /auth/login | Login with email/password | No |
| POST | /auth/refresh | Refresh access token | No |
| GET | /users/:id | Get user profile | Bearer |
| PATCH | /users/:id | Update user profile | Bearer |
| GET | /health | Health check | No |

## Environment Variables

See `.env.example` for required variables.

## Project Structure

```
src/
├── main.ts
├── app.module.ts
├── database/config/typeorm.config.ts
├── user/user.entity.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.guard.ts
│   ├── jwt.strategy.ts
│   └── dto/auth.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   └── users.service.ts
└── health/
    ├── health.module.ts
    └── health.controller.ts
```

## Railway Deployment

1. Push to GitHub
2. Connect repo at Railway.app
3. Set environment variables (DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET)
4. Deploy

## Phase 2

- Google OAuth
- Advanced features

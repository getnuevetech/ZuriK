# Local Development Setup

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm

## Quick Start

1. **Clone the repository** and install dependencies:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start the database**:
   ```bash
   docker-compose up postgres -d
   ```

4. **Start the backend** (TypeScript compilation + NestJS):
   ```bash
   npm run start:dev
   ```

5. **Start the frontend** (in a separate terminal):
   ```bash
   cd frontend && npm run dev
   ```

## Running Everything with Docker

```bash
docker-compose up
```

This starts:
- PostgreSQL on port 5432
- API on port 3001

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_ACCESS_SECRET` | JWT access token secret | - |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | - |
| `PORT` | API port | 3001 |
| `NODE_ENV` | Environment | development |

## API Testing

Import the Postman collection from `docs/postman-collection.json`.

Or test manually:

```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

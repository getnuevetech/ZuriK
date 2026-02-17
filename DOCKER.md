# Docker Guide - African Fashion eCommerce

Complete guide for running the African Fashion eCommerce platform with Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Configuration](#docker-configuration)
- [Development vs Production](#development-vs-production)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Docker 20.10+ installed
- Docker Compose v2.0+ installed
- At least 4GB RAM available for Docker
- At least 10GB disk space

### Installation

**macOS (with Homebrew)**:
```bash
brew install docker docker-compose
```

**Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
```

**Windows**:
Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Quick Start

### Production Setup

1. **Clone and configure**:
```bash
git clone https://github.com/agolomola/african-fashion-ecommerce.git
cd african-fashion-ecommerce
cp .env.example .env
```

2. **Edit `.env` file** with your configuration (see `.env.example` for required variables)

3. **Start all services**:
```bash
docker-compose up -d
```

4. **Run database migrations**:
```bash
docker-compose exec backend npm run migration:run
```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - API Docs: http://localhost:3001/api/docs

### Development Setup

For development with hot-reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

---

## Docker Configuration

### Dockerfile.frontend

Multi-stage build for Next.js application:

**Stages**:
1. **deps**: Install dependencies
2. **builder**: Build Next.js application
3. **runner**: Production runtime with minimal image

**Key Features**:
- Node.js 18 Alpine (minimal image size)
- Standalone output for optimal bundle size
- Non-root user for security
- Port 3000 exposed

### Dockerfile.backend

Multi-stage build for NestJS application:

**Stages**:
1. **deps**: Install dependencies
2. **builder**: Build NestJS application and prune dev dependencies
3. **runner**: Production runtime with dumb-init

**Key Features**:
- Node.js 18 Alpine (minimal image size)
- dumb-init for proper signal handling
- Non-root user for security
- Port 3001 exposed

### docker-compose.yml (Production)

**Services**:
- `postgres`: PostgreSQL 15 database with persistent volume
- `backend`: NestJS API with health checks
- `frontend`: Next.js app depending on backend

**Features**:
- Health checks for all services
- Service dependencies
- Persistent data volumes
- Isolated network
- Environment variable configuration

### docker-compose.dev.yml (Development)

Same services but configured for development:
- Hot-reload enabled
- Source code mounted as volumes
- Debug mode enabled
- Synchronize database schema (DB_SYNCHRONIZE=true)

---

## Development vs Production

### Production (`docker-compose.yml`)

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Characteristics**:
- Optimized builds
- No hot-reload
- Database schema NOT auto-synced (migrations required)
- Production environment variables
- Minimal image sizes

### Development (`docker-compose.dev.yml`)

```bash
# Start services
docker-compose -f docker-compose.dev.yml up

# Stop services
docker-compose -f docker-compose.dev.yml down
```

**Characteristics**:
- Source code mounted (hot-reload)
- Database schema auto-synced
- Development environment variables
- Faster iteration

---

## Common Commands

### Service Management

```bash
# Start all services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (complete reset)
docker-compose down -v

# Restart a specific service
docker-compose restart backend

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
```

### Building

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend

# Build without cache (fresh build)
docker-compose build --no-cache

# Rebuild and restart
docker-compose up --build
```

### Database Operations

```bash
# Run migrations
docker-compose exec backend npm run migration:run

# Generate migration
docker-compose exec backend npm run migration:generate -- -n MigrationName

# Revert last migration
docker-compose exec backend npm run migration:revert

# Access PostgreSQL shell
docker-compose exec postgres psql -U africanfashion -d african_fashion_db

# Backup database
docker-compose exec postgres pg_dump -U africanfashion african_fashion_db > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U africanfashion african_fashion_db
```

### Container Management

```bash
# List running containers
docker-compose ps

# Execute command in container
docker-compose exec backend sh

# View container stats (CPU, memory)
docker stats

# Inspect container
docker-compose exec backend env

# Remove stopped containers
docker-compose rm
```

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi african-fashion-backend

# Remove unused images
docker image prune

# Remove all unused data
docker system prune -a
```

---

## Environment Variables

### Required Variables

Create a `.env` file based on `.env.example`:

```bash
# Database
DB_USER=africanfashion
DB_PASSWORD=strong_password_here
DB_NAME=african_fashion_db

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-32-character-secret
JWT_REFRESH_SECRET=your-32-character-secret
NEXTAUTH_SECRET=your-32-character-secret

# API Configuration
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Generating Secrets

```bash
# Generate random 32-character secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Health Checks

### Backend Health Check

```bash
# Using curl
curl http://localhost:3001/api/health

# Using httpie
http http://localhost:3001/api/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### Frontend Health Check

```bash
curl http://localhost:3000
# Should return 200 OK
```

### Database Health Check

```bash
docker-compose exec postgres pg_isready -U africanfashion
# Should return: postgres:5432 - accepting connections
```

---

## Troubleshooting

### Container Won't Start

**Problem**: Container exits immediately

**Solution**:
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database connection failed - Check DB credentials
# 2. Port already in use - Stop conflicting service
# 3. Missing environment variables - Check .env file
```

### Database Connection Failed

**Problem**: Backend can't connect to PostgreSQL

**Solution**:
```bash
# 1. Verify PostgreSQL is running
docker-compose ps postgres

# 2. Check database credentials
docker-compose exec postgres psql -U africanfashion -d african_fashion_db

# 3. Verify network connectivity
docker-compose exec backend ping postgres

# 4. Check environment variables
docker-compose exec backend env | grep DB_
```

### Port Already in Use

**Problem**: Error: port is already allocated

**Solution**:
```bash
# Find process using port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3002:3000"  # Use different host port
```

### Build Fails

**Problem**: Docker build fails

**Solutions**:
```bash
# 1. Clear Docker cache
docker-compose build --no-cache

# 2. Remove old images
docker system prune -a

# 3. Check Dockerfile syntax
cat Dockerfile.backend

# 4. Verify package.json exists
ls -la apps/backend/package.json
```

### Out of Disk Space

**Problem**: No space left on device

**Solution**:
```bash
# Check Docker disk usage
docker system df

# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup (WARNING: Removes everything)
docker system prune -a --volumes
```

### Slow Performance

**Problem**: Containers running slowly

**Solutions**:
1. **Increase Docker resources** (Docker Desktop → Settings → Resources)
   - RAM: 4GB minimum, 8GB recommended
   - CPUs: 2 minimum, 4 recommended

2. **Check resource usage**:
```bash
docker stats
```

3. **Optimize volumes** (especially on macOS/Windows):
```bash
# Use cached or delegated mounts
volumes:
  - ./apps/backend/src:/app/apps/backend/src:cached
```

### Cannot Access Application

**Problem**: Can't access http://localhost:3000

**Solutions**:
```bash
# 1. Verify containers are running
docker-compose ps

# 2. Check container logs
docker-compose logs frontend

# 3. Verify port mapping
docker-compose port frontend 3000

# 4. Test from inside container
docker-compose exec frontend wget -O- http://localhost:3000

# 5. Check firewall settings
```

### Migration Fails

**Problem**: Database migration errors

**Solution**:
```bash
# 1. Check migration files exist
docker-compose exec backend ls -la src/database/migrations

# 2. Manually run migration
docker-compose exec backend npm run migration:run

# 3. Check database connection
docker-compose exec backend npm run typeorm -- query "SELECT version();"

# 4. Reset database (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend npm run migration:run
```

---

## Performance Optimization

### Image Size Optimization

Current image sizes (approximate):
- Frontend: ~200MB (with Next.js standalone)
- Backend: ~180MB (with NestJS compiled)
- PostgreSQL: ~80MB (Alpine version)

**Tips**:
1. Use Alpine Linux base images (already implemented)
2. Multi-stage builds (already implemented)
3. Only include production dependencies
4. Leverage Docker layer caching

### Build Speed

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker-compose build

# Parallel builds
docker-compose build --parallel
```

### Runtime Performance

1. **Limit container resources**:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

2. **Use production Node.js flags**:
```yaml
environment:
  NODE_OPTIONS: "--max-old-space-size=512"
```

---

## Production Checklist

Before deploying to production:

- [ ] Update all secrets in `.env`
- [ ] Set `DB_SYNCHRONIZE=false`
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up log aggregation
- [ ] Configure backup strategy
- [ ] Set up monitoring (health checks)
- [ ] Test all services
- [ ] Document recovery procedures

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [NestJS Docker](https://docs.nestjs.com/recipes/deployment#docker)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)

---

**Last Updated**: January 2024

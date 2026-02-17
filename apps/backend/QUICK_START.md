# Quick Start Guide - African Fashion Backend

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd apps/backend
npm install
```

### 2. Configure Environment
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your settings (minimum required):
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=your_password
# DB_DATABASE=african_fashion_dev
# JWT_SECRET=your-super-secret-key-at-least-32-chars
# JWT_REFRESH_SECRET=your-refresh-secret-key-different
```

### 3. Setup Database
```bash
# Create the database
createdb african_fashion_dev

# Or using psql
psql -U postgres
CREATE DATABASE african_fashion_dev;
\q
```

### 4. Start Development Server
```bash
npm run start:dev
```

The server will start on `http://localhost:3000/api`

### 5. Access API Documentation
Open your browser and navigate to:
```
http://localhost:3000/api/docs
```

## Quick Test

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "customer"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "SecurePass123!"
  }'
```

Save the `accessToken` from the response.

### Get Current User (Authenticated)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## User Roles

Create users with different roles to test all features:

- **customer**: Browse and order designs/fabrics
- **designer**: Create and manage designs
- **fabric_seller**: Create and manage fabric listings
- **admin**: Full platform access

## Common Commands

```bash
# Start development with hot-reload
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Check TypeScript
npx tsc --noEmit

# Format code
npm run format
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `pg_isready`
- Check database exists: `psql -l | grep african_fashion`
- Verify credentials in .env match your PostgreSQL setup

### Port Already in Use
Change the PORT in .env:
```env
PORT=3001
```

### TypeORM Sync Issues
For development, synchronize is enabled. If you need a fresh schema:
```sql
DROP DATABASE african_fashion_dev;
CREATE DATABASE african_fashion_dev;
```

Then restart the server.

## Next Steps

1. **Explore API**: Use Swagger UI at `/api/docs`
2. **Create Test Data**: Register users, create designs, and fabrics
3. **Test Orders**: Create orders to see payment splitting in action
4. **Check Logs**: Development logs show all SQL queries
5. **Frontend Integration**: Connect your frontend to these endpoints

## Support

For detailed documentation, see:
- [README.md](./README.md) - Full documentation
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical details
- Swagger UI - Interactive API documentation

---

🎉 You're all set! Happy coding!

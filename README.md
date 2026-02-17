# African Fashion eCommerce Platform

A full-stack eCommerce platform connecting African fashion designers with global customers. Built with Next.js 14, NestJS, TypeORM, and PostgreSQL.

## 🎨 Features

- **Premium Design Aesthetic**: Farfetch/Browns Fashion meets Etsy community warmth
- **Designer Marketplace**: Connect African fashion designers directly with customers worldwide
- **Fabric Sellers**: Integrated fabric marketplace with location-based filtering
- **Order Splitting Logic**: Smart order management splitting payments between designers and fabric sellers
- **Multi-Currency Support**: Global payment processing with Stripe & PayPal
- **Role-Based Access**: Customer, Designer, Fabric Seller, and Admin roles
- **Measurement System**: Custom measurement profiles for perfect fits

## 🚀 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** (African color palette)
- **Zustand** (State management)
- **Axios** (API client)

### Backend
- **NestJS** (Node.js framework)
- **TypeORM** (ORM)
- **PostgreSQL** (Database)
- **JWT** (Authentication)
- **Stripe & PayPal** (Payments)
- **Swagger** (API documentation)

### DevOps
- **Docker & Docker Compose**
- **Railway** (Deployment)
- **GitHub Actions** (CI/CD)

## 📦 Project Structure

```
african-fashion-ecommerce/
├── apps/
│   ├── frontend/          # Next.js application
│   │   ├── src/
│   │   │   ├── app/       # Next.js app router pages
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── data/
│   │   └── public/
│   └── backend/           # NestJS application
│       └── src/
│           ├── modules/
│           ├── database/
│           └── common/
├── docker-compose.yml
└── package.json
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (recommended)
- PostgreSQL (optional if using Docker)

### Quick Start with Docker (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/agolomola/african-fashion-ecommerce.git
cd african-fashion-ecommerce
```

2. **Configure environment variables**
```bash
# Copy example env file and configure
cp .env.example .env
# Edit .env with your configuration
```

3. **Start all services with Docker Compose**
```bash
docker-compose up
```

This will start:
- PostgreSQL database on port 5432
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

### Manual Setup (Without Docker)

1. **Clone and install dependencies**
```bash
git clone https://github.com/agolomola/african-fashion-ecommerce.git
cd african-fashion-ecommerce
npm install
```

2. **Configure environment variables**
```bash
# Create env files for each service
cp .env.example apps/backend/.env
cp .env.example apps/frontend/.env.local
```

3. **Start PostgreSQL** (if not using Docker)
```bash
# Using local PostgreSQL
createdb african_fashion_db
```

4. **Start services**
```bash
# Terminal 1 - Backend (http://localhost:3001)
npm run backend:dev

# Terminal 2 - Frontend (http://localhost:3000)
npm run frontend:dev
```

### Database Migrations

```bash
# Generate migration
npm run db:generate -- -n MigrationName

# Run migrations
npm run db:migrate

# Revert last migration
cd apps/backend && npm run migration:revert
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up --build

# Stop and remove volumes (fresh start)
docker-compose down -v
```

## 🎨 African Color Palette

- **Gold**: `#D4AF37` - Premium accents, CTAs
- **Dark**: `#1a1a1a` - Text, headers
- **Cream**: `#F5F1E8` - Backgrounds, cards
- **Red Accent**: `#C41E3A` - Highlights, badges

## 📖 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:3001/api/docs
- **API Documentation**: See [API.md](./API.md)

## 🚢 Deployment

### Docker Build

Build Docker images locally:

```bash
# Build backend
docker build -f Dockerfile.backend -t african-fashion-backend .

# Build frontend
docker build -f Dockerfile.frontend -t african-fashion-frontend .

# Run with docker-compose
docker-compose up
```

### Railway Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Railway deployment guide.

**Quick Deploy**:

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and link project:
```bash
railway login
railway link
```

3. Deploy:
```bash
railway up
```

### Environment Variables

Before deploying, ensure all environment variables are configured. See [.env.example](./.env.example) for required variables.

**Critical Variables**:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- `NEXTAUTH_SECRET` - NextAuth secret (min 32 chars)
- `STRIPE_SECRET_KEY` - Stripe payment integration
- `CLOUDINARY_*` - Image storage credentials

### Health Checks

- Backend: `http://your-backend-url/api/health`
- Frontend: `http://your-frontend-url`

## 🧪 Testing

```bash
# Run all tests
npm test

# Frontend tests
cd apps/frontend && npm test

# Backend tests
cd apps/backend && npm test
```

## 📝 Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format
```

## 👥 User Roles

- **Customer**: Browse and purchase designs
- **Designer**: Upload designs, manage portfolio
- **Fabric Seller**: List fabrics, manage inventory
- **Admin**: Platform management, user moderation

## 🔐 Order Splitting Logic

Orders are automatically split between:
1. **Admin** (platform fee)
2. **Designer** (design payment)
3. **Fabric Seller** (fabric payment)

Each party sees only their relevant order information.

## 📄 License

Proprietary - African Fashion eCommerce Platform

## 🤝 Contributing

This is a proprietary project. Please contact the team for contribution guidelines.

## 📧 Support

For support, email support@africanfashion.com

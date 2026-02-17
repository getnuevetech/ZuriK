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
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/agolomola/african-fashion-ecommerce.git
cd african-fashion-ecommerce
```

2. **Install dependencies**
```bash
npm install
cd apps/frontend && npm install
cd ../backend && npm install
```

3. **Configure environment variables**
```bash
# Copy example env files
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env
```

4. **Start services with Docker Compose**
```bash
npm run dev
```

Or start services individually:

```bash
# Frontend (http://localhost:3000)
npm run frontend:dev

# Backend (http://localhost:3001)
npm run backend:dev
```

### Database Migrations

```bash
# Generate migration
npm run db:generate -- -n MigrationName

# Run migrations
npm run db:migrate
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

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Railway deployment instructions.

### Quick Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

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

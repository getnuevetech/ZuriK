# African Fashion eCommerce Backend

A comprehensive NestJS backend API for the African Fashion eCommerce platform, connecting customers with African fashion designers and fabric sellers.

## 🌟 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Support for Customers, Designers, Fabric Sellers, and Admins
- **Design Catalog**: Designers can showcase and sell their custom fashion designs
- **Fabric Marketplace**: Sellers can list and manage fabric inventory
- **Order Management**: Complete order processing with intelligent payment splitting
- **Measurements**: Users can save custom measurements for tailored orders
- **Admin Dashboard**: Platform management and analytics

## 🏗️ Architecture

### Tech Stack
- **Framework**: NestJS 10
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Passport JWT
- **Validation**: class-validator & class-transformer
- **API Documentation**: Swagger/OpenAPI

### Database Entities
- **User**: Multi-role user system (Customer, Designer, Fabric Seller, Admin)
- **Design**: Fashion designs with categories and compatibility info
- **Fabric**: Fabric listings with inventory management
- **Order**: Orders with item details and payment tracking
- **Measurement**: User body measurements for custom tailoring

## 💰 Order Splitting Logic

The platform implements a sophisticated **3-way payment split** for each order:

### Payment Distribution
1. **Platform (Admin)**: Receives platform fee (default 10% of subtotal)
2. **Designer**: Receives design price minus proportional platform fee
3. **Fabric Seller**: Receives fabric price minus proportional platform fee

### Example Order Calculation
```
Order: Design ($60) + Fabric ($40) = $100 subtotal
- Platform fee: $10 (10% of $100)
- Designer: $60 - $6 (60% of platform fee) = $54
- Fabric Seller: $40 - $4 (40% of platform fee) = $36
- Total: $54 + $36 + $10 = $100 ✓
```

See `src/modules/orders/order-splitting.service.ts` for detailed implementation.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd apps/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Setup database**
   ```bash
   # Create PostgreSQL database
   createdb african_fashion_dev
   
   # Run migrations (if any)
   npm run migration:run
   ```

5. **Start development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000/api`

## 📚 API Documentation

Once the server is running, access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

#### Users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user profile
- `GET /api/users/me` - Get current user

#### Designs
- `GET /api/designs` - List all designs (with filters)
- `GET /api/designs/:id` - Get design details
- `POST /api/designs` - Create design (Designer only)
- `PATCH /api/designs/:id` - Update design (Designer only)
- `DELETE /api/designs/:id` - Delete design (Designer only)

#### Fabrics
- `GET /api/fabrics` - List all fabrics (with filters)
- `GET /api/fabrics/:id` - Get fabric details
- `POST /api/fabrics` - Create fabric listing (Fabric Seller only)
- `PATCH /api/fabrics/:id` - Update fabric (Fabric Seller only)
- `DELETE /api/fabrics/:id` - Delete fabric (Fabric Seller only)

#### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status (Admin/Seller)

#### Measurements
- `GET /api/measurements` - Get user measurements
- `POST /api/measurements` - Create measurement
- `PATCH /api/measurements/:id` - Update measurement
- `DELETE /api/measurements/:id` - Delete measurement

#### Admin
- `GET /api/admin/orders` - Get all orders (Admin only)
- `GET /api/admin/users` - Get all users (Admin only)
- `PATCH /api/admin/users/:id/role` - Update user role (Admin only)
- `GET /api/admin/statistics` - Get platform statistics (Admin only)

## 🔐 Authentication

The API uses JWT Bearer token authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **CUSTOMER**: Can browse, order, and manage measurements
- **DESIGNER**: Can create and manage designs + all customer features
- **FABRIC_SELLER**: Can create and manage fabrics + all customer features
- **ADMIN**: Full platform access

## 🗄️ Database Schema

### Key Relationships
- User (1) → (N) Designs
- User (1) → (N) Fabrics
- User (1) → (N) Orders
- User (1) → (N) Measurements
- Design (N) ↔ (N) Fabrics (compatible fabrics)

### Enums
- **UserRole**: customer, designer, fabric_seller, admin
- **OrderStatus**: pending, confirmed, processing, shipped, delivered, cancelled, refunded
- **PaymentMethod**: card, bank_transfer, mobile_money, cash_on_delivery
- **FabricType**: cotton, silk, ankara, kente, dashiki, adire, mudcloth, kitenge, linen, velvet, other
- **DesignCategory**: dress, suit, traditional, casual, formal, wedding, agbada, kaftan, dashiki, wrapper, other
- **MeasurementUnit**: inches, centimeters

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run start:dev        # Start with hot-reload

# Building
npm run build           # Build for production

# Production
npm run start:prod      # Start production server

# Testing
npm run test           # Run unit tests
npm run test:e2e       # Run e2e tests
npm run test:cov       # Test coverage

# Database
npm run migration:generate  # Generate migration
npm run migration:run       # Run migrations
npm run migration:revert    # Revert migration

# Linting
npm run lint           # Lint code
npm run format         # Format code
```

### Project Structure

```
src/
├── common/                 # Shared utilities
│   ├── decorators/        # Custom decorators
│   ├── filters/           # Exception filters
│   ├── guards/            # Authorization guards
│   ├── pipes/             # Validation pipes
│   └── constants/         # Constants and messages
├── database/              # Database layer
│   ├── config/           # TypeORM configuration
│   ├── entities/         # Database entities
│   └── migrations/       # Database migrations
├── modules/              # Feature modules
│   ├── auth/            # Authentication
│   ├── users/           # User management
│   ├── designs/         # Design catalog
│   ├── fabrics/         # Fabric marketplace
│   ├── orders/          # Order processing
│   ├── measurements/    # User measurements
│   └── admin/           # Admin operations
├── app.module.ts        # Root module
└── main.ts             # Application entry point
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options:

- **Database**: PostgreSQL connection settings
- **JWT**: Secret keys and expiration times
- **CORS**: Allowed origins
- **Platform**: Fee percentage, upload settings
- **Pagination**: Default and max page sizes

### TypeORM Configuration

Synchronize is enabled in development for convenience. For production:
1. Set `synchronize: false` in `app.module.ts`
2. Use migrations for schema changes
3. Run `npm run migration:run` to apply migrations

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure production database
4. Set appropriate CORS origins
5. Configure platform fee percentage

### Database Migrations

For production deployments:
```bash
# Run pending migrations
npm run migration:run
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

For issues and questions, please create an issue in the repository.

---

Built with ❤️ for the African Fashion Community

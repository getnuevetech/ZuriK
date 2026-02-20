# Copilot Instructions for African Fashion eCommerce

## Project Overview

This is a full-stack African fashion marketplace platform connecting designers, fabric sellers, and customers. It features a multi-role system (Customer, Designer, Fabric Seller, QA Inspector, Admin) with a complete order lifecycle including quality assurance.

## Architecture

This is a **monorepo** with two separate applications:

### Backend — NestJS API (`/src`)
- **Framework**: NestJS 10 with TypeScript
- **Database**: PostgreSQL via TypeORM (entities use decorators, `synchronize: true` in dev)
- **Auth**: JWT (access + refresh tokens) with Passport.js, role-based guards
- **API Docs**: Swagger/OpenAPI via `@nestjs/swagger`
- **File Uploads**: Cloudinary integration via `multer`
- **Port**: 3001 (configured in `src/main.ts`)

### Frontend — Next.js App (`/frontend`)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design tokens (indigo primary, gold accent)
- **State**: React Context (auth-context, cart-context)
- **HTTP Client**: Axios (configured in `frontend/lib/api.ts`)
- **API Proxy**: Calls backend at `http://localhost:3001/api`

## Module Structure (Backend)

Each NestJS module follows this pattern:
```
src/<module>/
├── dto/                    # Request validation (class-validator decorators)
├── entities/               # TypeORM entities
├── <module>.controller.ts  # Route handlers
├── <module>.service.ts     # Business logic
└── <module>.module.ts      # NestJS module definition
```

**Active modules**: `auth`, `users`, `products`, `fabrics`, `orders`, `payments`, `measurements`, `notifications`, `settings`, `taxes`, `shipping`, `admin`, `hero-banners`, `cloudinary`, `upload`, `database`

## Frontend Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── checkout/           # Checkout flow
│   ├── orders/             # Order management
│   ├── products/           # Product browsing
│   └── ...
├── components/
│   ├── ui/                 # Reusable UI primitives (Button, Card, Badge, Spinner, etc.)
│   ├── common/             # Shared components (PriceDisplay, EmptyState, etc.)
│   ├── layout/             # Navbar, Footer
│   └── <feature>/          # Feature-specific components
├── lib/
│   ├── api.ts              # Axios instance + all API modules
│   ├── auth-context.tsx    # Authentication provider
│   └── cart-context.tsx    # Shopping cart provider
└── types/                  # TypeScript interfaces
```

## Key Domain Concepts

### User Roles (enum in `src/users/entities/user.entity.ts`)
- `CUSTOMER` — buys designs and fabrics
- `DESIGNER` — creates fashion designs, receives orders
- `FABRIC_SELLER` — sells fabrics
- `QA_INSPECTOR` — inspects finished garments
- `ADMIN` — platform management

### Order Types
- `CUSTOM_DESIGN` — customer picks design + fabric + measurements
- `READY_TO_WEAR` — pre-made design purchase
- `FABRIC_ONLY` — fabric purchase without design

### Order Status Flow
```
PENDING_PAYMENT → PAID → AWAITING_MATERIALS → IN_PRODUCTION →
SHIPPED_TO_QA → QA_INSPECTION → QA_APPROVED → SHIPPED_TO_CUSTOMER → DELIVERED
                              └→ QA_REJECTED (back to designer)
```

### Payment Providers
- **Paystack** — primary (African markets, amounts in kobo)
- **Stripe** — international fallback

## Coding Conventions

### Backend (NestJS)
- Use `class-validator` decorators on all DTOs
- Use `@InjectRepository()` for TypeORM repositories
- Controllers use `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles()` for auth
- Admin endpoints go under `/admin/` prefix
- All entities use UUID primary keys (`@PrimaryGeneratedColumn('uuid')`)
- Decimal money fields use `precision: 10, scale: 2`
- Use `NotFoundException`, `ForbiddenException`, `BadRequestException` from `@nestjs/common`
- Services should be `@Injectable()` and injected via constructor

### Frontend (Next.js)
- Client components must have `'use client'` directive at top
- Use existing UI components from `frontend/components/ui/` (Button, Card, Badge, Spinner, Textarea, etc.)
- Use `useAuth()` hook for authentication state
- Use `useCart()` hook for cart operations
- Use `useToast()` for user feedback messages
- API calls go through the centralized `frontend/lib/api.ts`
- Use `PriceDisplay` component for formatted currency
- Tailwind classes follow mobile-first responsive design
- Color palette: `indigo` primary, `gold`/`amber` accent, `neutral` for text

### Naming Conventions
- **Entities**: PascalCase, singular (e.g., `Order`, `PaymentGateway`)
- **DTOs**: `Create<Entity>Dto`, `Update<Entity>Dto`
- **Controllers**: `<Module>Controller` at route `/<module>`
- **Services**: `<Module>Service`
- **Frontend components**: PascalCase files (e.g., `PaymentStatusBadge.tsx`)
- **Frontend pages**: `page.tsx` inside route directories

### Commit Messages
Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`

## Environment Setup

### Backend
```bash
# From project root
cp .env.example .env
npm install
npm run start:dev    # Runs on port 3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Runs on port 3000
```

### Required Environment Variables
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — JWT signing keys
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — Email (optional)
- `PAYSTACK_SECRET_KEY`, `STRIPE_SECRET_KEY` — Payment providers (when payments module is active)

### Database
- PostgreSQL required (Docker: `docker-compose up -d`)
- TypeORM auto-sync enabled in development (`AUTO_SYNC=true`)
- Seed data: `npm run seed`

## Build & Verification

### Backend
```bash
npm run build        # Compiles to dist/
```

### Frontend
```bash
cd frontend
npm run build        # Next.js production build
npm run lint         # ESLint
```

## Important Patterns to Follow

1. **New backend modules** must be imported in `src/app.module.ts` and entities registered in the TypeORM `entities` array
2. **New entities** used across modules should be added to `TypeOrmModule.forFeature([...])` in consuming modules
3. **Webhook endpoints** must be public (no JWT guard) but verify signatures
4. **Money calculations** should use the existing platform fee rate from `SettingsService`
5. **Tax calculations** should use the existing `TaxesService`
6. **Order number generation** follows format: `ORD-YYYYMMDD-XXXXXX`
7. **Frontend API modules** follow the pattern in `frontend/lib/api.ts` — group related endpoints in an exported object
8. **Always handle loading and error states** in frontend pages

## Deployment

- **Platform**: Railway (see `railway.toml`, `Dockerfile`, `build.sh`)
- **Build script**: `build.sh` handles both backend and frontend builds
- Node.js version: specified in `.nvmrc`
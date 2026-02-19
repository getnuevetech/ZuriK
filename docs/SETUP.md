# Setup Guide - African Fashion eCommerce Backend

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/agolomola/african-fashion-ecommerce.git
   cd african-fashion-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local database credentials
   ```

4. **Start the development server**
   ```bash
   npm run start:dev
   ```

5. **Verify the server is running**
   ```bash
   curl http://localhost:3000/health
   ```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start in watch mode (development) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | Run compiled production build |
| `npm run type-check` | Run TypeScript type checking |

---

## Railway Quick-Start

For Railway deployment, see [docs/RAILWAY_SETUP.md](./RAILWAY_SETUP.md).

**TL;DR:**
1. Connect repo to Railway
2. Add PostgreSQL plugin
3. Set `NODE_ENV=production` and JWT secrets
4. Deploy — backend is live in ~2 minutes
5. Test at `https://<your-app>.railway.app/health`

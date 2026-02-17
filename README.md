# African Fashion eCommerce

A modern, standalone Next.js frontend for connecting African fashion designers with global customers.

## 🎨 Features

- **Authentic African Designs**: Showcase traditional and contemporary African fashion
- **Designer Marketplace**: Connect talented designers with customers worldwide
- **Responsive Design**: Optimized for all devices with Tailwind CSS
- **Modern Tech Stack**: Built with Next.js 14, TypeScript, and React 18
- **Easy Deployment**: Configured for Railway, Vercel, and Netlify

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or later
- npm or yarn

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/agolomola/african-fashion-ecommerce.git
   cd african-fashion-ecommerce
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**:
   ```bash
   npm run dev
   # or use the provided script
   ./start.sh
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests (when configured)

## 🏗️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.3
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **HTTP Client**: Axios
- **Icons**: React Icons, Lucide React

## 📁 Project Structure

```
african-fashion-ecommerce/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── common/       # Shared components (Header, Footer)
│   │   ├── designs/      # Design-related components
│   │   ├── home/         # Homepage components
│   │   └── ui/           # UI primitives (Button, Card, Input)
│   ├── data/             # Mock data
│   ├── services/         # API services
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── public/               # Static assets
├── .env.example          # Environment variables template
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── DEPLOYMENT_SIMPLE.md  # Deployment guide
```

## 🌍 Deployment

This application is configured for easy deployment to multiple platforms:

### Railway (Recommended)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Deploy!

For detailed deployment instructions, see [DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md)

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/agolomola/african-fashion-ecommerce)

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/agolomola/african-fashion-ecommerce)

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# API Configuration
NEXT_PUBLIC_API_URL=your-api-url

# Authentication
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=your-app-url

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret

# Optional: Image hosting, analytics, etc.
```

See `.env.example` for a complete list of available variables.

## 📸 Screenshots

_Screenshots will be added as the application develops_

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- **Documentation**: See [DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md) for deployment help
- **Issues**: [GitHub Issues](https://github.com/agolomola/african-fashion-ecommerce/issues)

## 🎯 Roadmap

- [ ] Backend API integration
- [ ] User authentication flow
- [ ] Shopping cart functionality
- [ ] Stripe payment integration
- [ ] Designer dashboard
- [ ] Order management
- [ ] Admin panel
- [ ] Mobile app (React Native)

## 📋 Recent Changes

### v1.0.0 - Standalone Deployment Ready

- Restructured from monorepo to standalone Next.js app
- Added deployment configurations for Railway, Vercel, and Netlify
- Created comprehensive deployment guide
- Fixed build configuration for production
- Added environment variables template
- Created quick-start scripts

---

**Made with ❤️ for African Fashion**

# African Fashion Marketplace - Project Saved

## Project Location
`/mnt/okcomputer/output/app/`

## Backup Archive
`/mnt/okcomputer/output/african-fashion-mueble-backup.tar.gz` (8.3 MB)

## Live Website
**URL:** https://kcpmrnjcte344.ok.kimi.link

---

## Design: Mueble Template Style

### Color Scheme
- **Background:** White (#ffffff)
- **Primary:** Navy Blue (#1a237e)
- **CTA Buttons:** Green (#00c853)
- **Footer:** Dark Blue (#1a237e)

### Typography
- **Headings:** Playfair Display (serif)
- **Body:** Inter (sans-serif)

---

## Project Structure

### Sections (in `/src/sections/`)
| File | Description |
|------|-------------|
| `Navbar.tsx` | Top navigation with social bar, logo, category tabs, icons |
| `Hero.tsx` | Full-width hero with overlay card, product carousel |
| `CategoryShowcase.tsx` | Two large category cards (Fabrics & Dresses) |
| `Products.tsx` | 8 products in 4-column grid with NEW badges |
| `Journal.tsx` | 3 blog posts with overlay cards |
| `Features.tsx` | 4 feature icons with descriptions |
| `Instagram.tsx` | Full-width image strip |
| `Footer.tsx` | Dark footer with logo, links, newsletter |

### Images (in `/public/images/`)
- `hero-bg.jpg` - Hero background
- `category-fabrics.jpg` - Fabrics category
- `category-dresses.jpg` - Dresses category
- `product-1.jpg` to `product-8.jpg` - Product images
- `blog-1.jpg` to `blog-3.jpg` - Blog post images

### Key Files
- `src/App.tsx` - Main app component
- `src/index.css` - Global styles
- `tailwind.config.js` - Tailwind configuration
- `index.html` - HTML entry point

---

## Features
- Full-width layout (board to border screen)
- Responsive design
- Product carousel with navigation
- Hover effects on cards
- Newsletter signup form
- Social media icons
- Green CTA buttons
- Clean, modern e-commerce aesthetic

---

## Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Framer Motion (installed)
- Lucide React icons

---

## How to Restore
```bash
# Extract backup
cd /mnt/okcomputer/output
tar -xzf african-fashion-mueble-backup.tar.gz

# Install dependencies
cd app
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

---

## Deployment
The site is deployed and live at:
**https://kcpmrnjcte344.ok.kimi.link**

To redeploy:
```bash
cd /mnt/okcomputer/output/app
npm run build
# Then deploy the dist/ folder
```

---

**Saved on:** 2026-02-26
**Status:** ✅ Complete and deployed

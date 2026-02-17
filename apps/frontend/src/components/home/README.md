# Home Page Components

This directory contains the main home page components for the African Fashion eCommerce platform.

## Components

### Hero.tsx

Hero banner section with:

- Large heading "Discover African Fashion"
- Subtitle about connecting with designers
- Two CTA buttons (Explore Designs, Join as Designer)
- African-inspired gradient background with pattern overlay
- Decorative elements for visual appeal

**Usage:**

```tsx
import { Hero } from '@/components/home';

<Hero />;
```

### FeaturedDesigns.tsx

Displays a grid of 6 featured designs:

- Responsive grid layout (1 col mobile, 2 tablet, 3 desktop)
- Each card shows:
  - Design image
  - Design name
  - Designer name
  - Price
  - Country badge
  - Rating and review count
- "View All Designs" button at bottom
- Uses `mockDesigns` data

**Usage:**

```tsx
import { FeaturedDesigns } from '@/components/home';

<FeaturedDesigns />;
```

### DesignerSpotlight.tsx

Showcases 3 featured designers:

- Designer profile cards with:
  - Profile picture with gold border
  - Name and country flag badge
  - Truncated bio
  - 2-3 recent design thumbnails from portfolio
  - Instagram link
  - "View Profile" button
- Responsive grid layout
- Uses `mockDesigners` and `mockDesigns` data

**Usage:**

```tsx
import { DesignerSpotlight } from '@/components/home';

<DesignerSpotlight />;
```

### LocationHighlight.tsx

Browse designs by African country:

- Features top 6 African countries:
  - Nigeria, Kenya, Ghana, South Africa, Morocco, Ethiopia
- Each card displays:
  - Country flag emoji
  - Country name
  - Number of designs
  - Number of designers
- Clickable cards that filter designs by country
- Responsive grid layout
- Uses `mockDesigns` and `mockDesigners` for counts

**Usage:**

```tsx
import { LocationHighlight } from '@/components/home';

<LocationHighlight />;
```

### TestimonialSection.tsx

Customer testimonials and platform stats:

- 4 customer testimonial cards with:
  - Customer photo
  - Name and country
  - 5-star rating
  - Review text
- Platform statistics at bottom:
  - 500+ Happy Customers
  - 4.9 Average Rating
  - 50+ Designers
- Responsive grid layout

**Usage:**

```tsx
import { TestimonialSection } from '@/components/home';

<TestimonialSection />;
```

## Full Home Page Example

```tsx
import {
  Hero,
  FeaturedDesigns,
  DesignerSpotlight,
  LocationHighlight,
  TestimonialSection,
} from '@/components/home';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FeaturedDesigns />
      <DesignerSpotlight />
      <LocationHighlight />
      <TestimonialSection />
    </main>
  );
}
```

## Styling

All components use:

- **Tailwind CSS** for styling
- **African color palette** (gold, accent, cream, dark)
- **Responsive design** for mobile, tablet, and desktop
- **Font family**: Display font for headings, default for body text

## Dependencies

- `next/link` - Navigation
- `next/image` - Optimized images
- `@/components/ui` - Button, Card, Badge components
- `@/data/mockDesigns` - Design data
- `@/data/mockDesigners` - Designer data
- `@/utils/helpers` - formatPrice, truncate, getCountryFlag helpers

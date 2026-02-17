# Common Layout Components

This directory contains the common layout components used throughout the African Fashion eCommerce application.

## Components

### Header.tsx

Main navigation header component with:

- **Logo/Brand**: AfriStyle logo with gradient background
- **Search Bar**: Central search functionality for designs and designers
- **Navigation Links**: Designs, Designers, About pages
- **Shopping Cart**: Cart icon with item count badge
- **User Menu**:
  - Unauthenticated: Login/Register buttons
  - Authenticated: User avatar with dropdown (role badge, dashboard link, logout)
- **Mobile Responsive**: Hamburger menu for mobile devices

**Usage:**

```tsx
import { Header } from '@/components/common';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
```

### Footer.tsx

Application footer with:

- **Brand Info**: Logo and description of the platform
- **Quick Links**: Navigation to key pages
- **Legal Links**: Terms, Privacy, Cookies, Refund policies
- **Social Media**: Instagram, Facebook, Twitter links
- **Newsletter**: Email subscription form with validation
- **Copyright**: Dynamic year with African heritage message

**Usage:**

```tsx
import { Footer } from '@/components/common';

export default function Layout({ children }) {
  return (
    <>
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

### Navigation.tsx

Mobile slide-out navigation menu component:

- **Overlay**: Dark overlay when menu is open
- **Slide Animation**: Smooth right-to-left transition
- **Navigation Links**: Home, Designs, Designers, About with icons
- **User Section**:
  - Shows user info and role badge when authenticated
  - Dashboard link for authenticated users
- **Auth Actions**: Login/Register buttons or Logout button
- **Body Scroll Lock**: Prevents background scrolling when open

**Usage:**

```tsx
import { Navigation } from '@/components/common';

export default function MyComponent() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <button onClick={() => setMenuOpen(true)}>Open Menu</button>
      <Navigation
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        isAuthenticated={false}
        user={null}
      />
    </>
  );
}
```

## African Color Palette

The components use the following color scheme:

- **Gold**: `#D4AF37` - Primary accent, buttons, highlights
- **Dark**: `#1a1a1a` - Text, backgrounds
- **Cream**: `#F5F1E8` - Light backgrounds, hover states
- **Accent**: `#C41E3A` - Important actions, alerts

## Mock Authentication

Currently, the components use mock authentication state:

- Set `isAuthenticated = true` in Header.tsx to test authenticated UI
- Configure the `user` object to test different roles: `customer`, `designer`, `admin`
- Each role displays a different badge color in the user menu

## TODO

- [ ] Connect to real authentication system
- [ ] Implement actual search functionality
- [ ] Connect cart to state management
- [ ] Implement newsletter subscription API
- [ ] Add internationalization support
- [ ] Add accessibility improvements (ARIA labels)
- [ ] Add unit tests for each component

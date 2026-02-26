# African Fashion Marketplace - Technical Specification

## Component Inventory

### shadcn/ui Components (Built-in)
| Component | Purpose | Customization |
|-----------|---------|---------------|
| Button | CTAs, actions | Custom orange variant, sharp corners |
| Card | Product cards, country cards | Remove border-radius |
| Input | Newsletter email input | Dark theme styling |
| Badge | Product badges, tags | Orange and muted variants |
| DropdownMenu | Shop dropdown | Dark theme |
| Sheet | Mobile navigation | Slide from right |
| Separator | Visual dividers | Subtle color |

### Custom Components
| Component | Purpose | Location |
|-----------|---------|----------|
| Navbar | Fixed navigation | `components/Navbar.tsx` |
| Hero | Full-screen hero section | `sections/Hero.tsx` |
| CountryCard | Country showcase cards | `components/CountryCard.tsx` |
| ProductCard | Product display cards | `components/ProductCard.tsx` |
| DesignerCard | Designer profile cards | `components/DesignerCard.tsx` |
| CollectionCard | Collection feature cards | `components/CollectionCard.tsx` |
| ScrollReveal | Scroll animation wrapper | `components/ScrollReveal.tsx` |
| AnimatedCounter | Stats counter animation | `components/AnimatedCounter.tsx` |

---

## Animation Implementation Table

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Page load stagger | Framer Motion | `motion.div` with staggerChildren | Medium |
| Hero parallax | Framer Motion | useScroll + useTransform hooks | Medium |
| Scroll reveal | Framer Motion | whileInView + viewport props | Low |
| Card hover lift | CSS/Tailwind | hover:translate-y + transition | Low |
| Image zoom on hover | CSS/Tailwind | group-hover:scale + overflow-hidden | Low |
| Button arrow slide | CSS/Tailwind | group-hover:translate-x | Low |
| Stats counter | Custom hook | useCountUp with requestAnimationFrame | Medium |
| Decorative dots float | CSS Keyframes | @keyframes bounce | Low |
| Scroll indicator bounce | CSS Keyframes | @keyframes bounce | Low |
| Navbar background | React state | useScrollPosition hook + conditional classes | Low |
| Quick Add fade in | Framer Motion | AnimatePresence + motion.div | Medium |
| Mobile menu slide | shadcn Sheet | Built-in animation | Low |

---

## Animation Library Choices

### Primary: Framer Motion
**Rationale:**
- Native React integration
- Declarative API
- Built-in scroll animations (whileInView)
- AnimatePresence for enter/exit animations
- Excellent TypeScript support

### Secondary: CSS/Tailwind
**Rationale:**
- Simple hover effects
- Keyframe animations (floating dots, scroll indicator)
- Better performance for simple transitions
- No JS overhead

---

## Project File Structure

```
/mnt/okcomputer/output/app/
├── public/
│   └── images/           # Generated images
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── CountryCard.tsx
│   │   ├── ProductCard.tsx
│   │   ├── DesignerCard.tsx
│   │   ├── CollectionCard.tsx
│   │   ├── ScrollReveal.tsx
│   │   └── AnimatedCounter.tsx
│   ├── sections/         # Page sections
│   │   ├── Hero.tsx
│   │   ├── Countries.tsx
│   │   ├── Products.tsx
│   │   ├── Collections.tsx
│   │   ├── Makers.tsx
│   │   ├── Heritage.tsx
│   │   ├── Newsletter.tsx
│   │   └── Footer.tsx
│   ├── hooks/            # Custom hooks
│   │   └── useScrollPosition.ts
│   ├── lib/              # Utilities
│   │   └── utils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── components/ui/        # shadcn components
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## Dependencies

### Core (via init script)
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Animation
```bash
npm install framer-motion
```

### Icons
```bash
npm install lucide-react
```

### Fonts
- Playfair Display (Google Fonts)
- Inter (Google Fonts)

---

## Tailwind Configuration

### Custom Colors
```js
colors: {
  background: '#1a1a1a',
  foreground: '#ffffff',
  card: '#242424',
  'card-foreground': '#ffffff',
  primary: {
    DEFAULT: '#f97316',
    foreground: '#ffffff',
  },
  secondary: {
    DEFAULT: '#2a2a2a',
    foreground: '#ffffff',
  },
  muted: {
    DEFAULT: '#333333',
    foreground: '#a3a3a3',
  },
  accent: {
    DEFAULT: '#f97316',
    foreground: '#ffffff',
  },
  border: '#404040',
}
```

### Custom Font Families
```js
fontFamily: {
  serif: ['Playfair Display', 'serif'],
  sans: ['Inter', 'sans-serif'],
}
```

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, hamburger menu |
| Tablet | 640-1024px | 2 columns, condensed nav |
| Desktop | > 1024px | Full layout, 4 columns |

---

## Performance Considerations

1. **Images**: Use WebP format, lazy loading
2. **Animations**: Use transform/opacity only, will-change hints
3. **Fonts**: Preload critical fonts, use font-display: swap
4. **Code splitting**: Lazy load below-fold sections
5. **Reduced motion**: Respect prefers-reduced-motion

---

## Accessibility

1. **Color contrast**: Minimum 4.5:1 for text
2. **Focus states**: Visible focus rings
3. **Keyboard navigation**: All interactive elements accessible
4. **Screen readers**: Proper ARIA labels
5. **Motion**: Reduced motion support

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { homepageApi, type PromoBanner as PromoBannerType } from '../../lib/api';
import { HeroBannerCarousel } from './HeroBannerCarousel';
import { FeaturedProducts } from './FeaturedProducts';
import { FeaturedSections } from './FeaturedSections';
import { ShopByCountry } from './ShopByCountry';
import { CategoryBanners } from './CategoryBanners';
import { TrendingProducts } from './TrendingProducts';
import { HowItWorks } from './HowItWorks';
import { DesignerSpotlight } from './DesignerSpotlight';
import { CollectionPosts } from './CollectionPosts';
import { CulturalHeritage } from './CulturalHeritage';
import { TryOnShowcase } from './TryOnShowcase';
import { Newsletter } from './Newsletter';
import { PromoBanner } from './PromoBanner';
import { PromoBannerSlot } from './PromoBannerSlot';

type LayoutItem = {
  type: string;
  order: number;
  sectionId: string | null;
};

type HomepagePayload = {
  theme?: {
    activeTheme?: string;
    colors?: Record<string, string>;
  };
  layout?: LayoutItem[];
};

const DEFAULT_LAYOUT: LayoutItem[] = [
  { type: 'HERO_BANNER', order: 0, sectionId: null },
  { type: 'FEATURED_PRODUCTS', order: 1, sectionId: null },
  { type: 'COUNTRY_CATEGORIES', order: 2, sectionId: null },
  { type: 'COLLECTIONS', order: 3, sectionId: null },
];

const DEFAULT_THEME_VARS: Record<string, string> = {
  '--color-primary': '#1a237e',
  '--color-primary-dark': '#0d1450',
  '--color-secondary': '#00c853',
  '--color-accent': '#00b248',
  '--color-background': '#ffffff',
  '--color-neutral-bg': '#f5f5f5',
  '--color-text': '#1a237e',
  '--color-text-muted': '#666666',
  '--color-surface': '#ffffff',
  '--color-border': '#e0e0e0',
};

function mapThemeColorsToVars(colors?: Record<string, string>): Record<string, string> {
  if (!colors) return DEFAULT_THEME_VARS;
  return {
    '--color-primary': colors.primary ?? DEFAULT_THEME_VARS['--color-primary'],
    '--color-primary-dark': colors.dark ?? colors.primary ?? DEFAULT_THEME_VARS['--color-primary-dark'],
    '--color-secondary': colors.secondary ?? DEFAULT_THEME_VARS['--color-secondary'],
    '--color-accent': colors.accent ?? colors.secondary ?? DEFAULT_THEME_VARS['--color-accent'],
    '--color-background': colors.lightBg ?? DEFAULT_THEME_VARS['--color-background'],
    '--color-neutral-bg': colors.lightBg ?? DEFAULT_THEME_VARS['--color-neutral-bg'],
    '--color-text': colors.text ?? DEFAULT_THEME_VARS['--color-text'],
    '--color-text-muted': colors.textLight ?? DEFAULT_THEME_VARS['--color-text-muted'],
    '--color-surface': '#ffffff',
    '--color-border': colors.accent ?? DEFAULT_THEME_VARS['--color-border'],
  };
}

export function AdminConnectedHomepage() {
  const [layout, setLayout] = useState<LayoutItem[]>(DEFAULT_LAYOUT);
  const [promoByLocation, setPromoByLocation] = useState<Record<string, PromoBannerType | null>>({});
  const [promoLoaded, setPromoLoaded] = useState(false);
  const [themeVars, setThemeVars] = useState<Record<string, string>>(DEFAULT_THEME_VARS);

  useEffect(() => {
    Promise.allSettled([homepageApi.getHomepage(), homepageApi.getPromoBannersByLocation()]).then(
      ([homepageResult, promoResult]) => {
        if (homepageResult.status === 'fulfilled') {
          const payload = homepageResult.value as HomepagePayload;
          const activeLayout = Array.isArray(payload.layout) && payload.layout.length > 0
            ? [...payload.layout].sort((a, b) => a.order - b.order)
            : DEFAULT_LAYOUT;
          setLayout(activeLayout);
          setThemeVars(mapThemeColorsToVars(payload.theme?.colors));
        }

        if (promoResult.status === 'fulfilled' && promoResult.value) {
          setPromoByLocation(promoResult.value);
        }
      },
    ).finally(() => {
      setPromoLoaded(true);
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const previous = new Map<string, string>();
    Object.entries(themeVars).forEach(([key, value]) => {
      previous.set(key, root.style.getPropertyValue(key));
      root.style.setProperty(key, value);
    });
    return () => {
      Object.entries(themeVars).forEach(([key]) => {
        const oldValue = previous.get(key);
        if (oldValue) root.style.setProperty(key, oldValue);
        else root.style.removeProperty(key);
      });
    };
  }, [themeVars]);

  const orderedSections = useMemo(
    () => (layout.length > 0 ? layout : DEFAULT_LAYOUT),
    [layout],
  );
  const hasAnyPromo = useMemo(
    () => Object.values(promoByLocation).some(Boolean),
    [promoByLocation],
  );

  return (
    <div className="mueble-home">
      {orderedSections.map((section, index) => {
        const key = `${section.type}-${section.order}-${section.sectionId ?? index}`;
        if (section.type === 'HERO_BANNER') {
          return (
            <React.Fragment key={key}>
              <HeroBannerCarousel />
              <PromoBannerSlot banner={promoByLocation.AFTER_HERO} />
            </React.Fragment>
          );
        }

        if (section.type === 'FEATURED_PRODUCTS') {
          return (
            <React.Fragment key={key}>
              <FeaturedProducts />
              <PromoBannerSlot banner={promoByLocation.AFTER_RTW} />
            </React.Fragment>
          );
        }

        if (section.type === 'COUNTRY_CATEGORIES') {
          return <ShopByCountry key={key} />;
        }

        if (section.type === 'COLLECTIONS') {
          return (
            <React.Fragment key={key}>
              <CategoryBanners />
              <PromoBannerSlot banner={promoByLocation.AFTER_FABRICS} />
            </React.Fragment>
          );
        }

        return null;
      })}

      {promoLoaded && !hasAnyPromo && <PromoBanner />}
      <FeaturedSections />
      <TrendingProducts />
      <HowItWorks />
      <PromoBannerSlot banner={promoByLocation.AFTER_HOW_IT_WORKS} />
      <DesignerSpotlight />
      <CollectionPosts />
      <CulturalHeritage />
      <PromoBannerSlot banner={promoByLocation.AFTER_HERITAGE} />
      <TryOnShowcase />
      <Newsletter />
    </div>
  );
}


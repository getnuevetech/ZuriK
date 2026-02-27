import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { CartProvider } from '../lib/cart-context';
import { WishlistProvider } from '../lib/wishlist-context';
import { ComparisonProvider } from '../lib/comparison-context';
import { ToastProvider } from '../components/ui/Toast';
import { CurrencyProvider } from '../lib/currency-context';
import { NavbarWrapper } from '../components/layout/NavbarWrapper';
import { Footer } from '../components/layout/Footer';
import { MobileBottomTabs } from '../components/layout/MobileBottomTabs';
import { ComparisonBar } from '../components/products/ComparisonBar';
import { EmailVerificationBanner } from '../components/common/EmailVerificationBanner';
import { AnnouncementBar } from '../components/homepage/AnnouncementBar';

export const metadata: Metadata = {
  title: 'African Fashion — Premium African Marketplace',
  description: 'Discover authentic African designs, premium fabrics, and renowned designers.',
  openGraph: {
    title: 'African Fashion',
    description: 'Premium African fashion marketplace',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body text-[#1a237e] bg-white min-h-screen flex flex-col">
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  <ComparisonProvider>
                    <AnnouncementBar />
                    <NavbarWrapper />
                    <EmailVerificationBanner />
                    <main className="flex-1 pb-16 md:pb-0 page-transition">
                      {children}
                    </main>
                    <Footer />
                    <MobileBottomTabs />
                    <ComparisonBar />
                  </ComparisonProvider>
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { CartProvider } from '../lib/cart-context';
import { ToastProvider } from '../components/ui/Toast';
import { NavbarWrapper } from '../components/layout/NavbarWrapper';
import { Footer } from '../components/layout/Footer';

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
      <body className="font-body text-neutral-900 bg-neutral-50 min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <NavbarWrapper />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

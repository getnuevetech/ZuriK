import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PageShellProps {
  children: React.ReactNode;
  cartCount?: number;
}

export function PageShell({ children, cartCount = 0 }: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar cartCount={cartCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

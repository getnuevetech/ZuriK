'use client';

import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem('cart');
      const cartItems = cart ? JSON.parse(cart) : [];
      const count = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>African Fashion</title>
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <nav style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '1rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0 }}>African Fashion</h1>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</a>
              <a href="/products" style={{ color: '#fff', textDecoration: 'none' }}>Products</a>
              <a href="/fabrics" style={{ color: '#fff', textDecoration: 'none' }}>Fabrics</a>
              <a href="/designers" style={{ color: '#fff', textDecoration: 'none' }}>Designers</a>
              <a href="/cart" style={{ color: '#fff', textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🛒 Cart
                {cartCount > 0 && (
                  <span style={{ backgroundColor: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {cartCount}
                  </span>
                )}
              </a>
            </div>
          </div>
        </nav>
        <main style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
          {children}
        </main>
        <footer style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '2rem', textAlign: 'center' }}>
          <p>&copy; 2026 African Fashion. All rights reserved.</p>
        </footer>
      </body>
    </html>

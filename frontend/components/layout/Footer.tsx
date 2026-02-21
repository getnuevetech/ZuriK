import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="font-heading font-bold text-base text-white flex items-center gap-1.5 mb-4 tracking-tight">
              <span className="text-secondary-500">✦</span> African Fashion
            </Link>
            <p className="text-sm text-neutral-500 leading-relaxed mb-5 font-light max-w-xs">
              Celebrating the richness of African culture through fashion, fabrics, and craftsmanship. Every piece tells a story.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-neutral-600 hover:text-neutral-300 transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="text-neutral-600 hover:text-neutral-300 transition-colors" aria-label="Twitter/X">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-neutral-600 hover:text-neutral-300 transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-[0.15em] mb-5">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products" className="hover:text-neutral-200 transition-colors font-light">Ready-to-Wear</Link></li>
              <li><Link href="/fabrics" className="hover:text-neutral-200 transition-colors font-light">Premium Fabrics</Link></li>
              <li><Link href="/orders/custom-design" className="hover:text-neutral-200 transition-colors font-light">Custom Design</Link></li>
              <li><Link href="/designers" className="hover:text-neutral-200 transition-colors font-light">Designers</Link></li>
              <li><Link href="/products/compare" className="hover:text-neutral-200 transition-colors font-light">Compare Products</Link></li>
              <li><Link href="/wishlist" className="hover:text-neutral-200 transition-colors font-light">Wishlist</Link></li>
              <li><Link href="/cart" className="hover:text-neutral-200 transition-colors font-light">Cart</Link></li>
            </ul>
          </div>

          {/* Countries */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-[0.15em] mb-5">Countries</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: 'Nigeria', flag: '🇳🇬' },
                { name: 'Ghana', flag: '🇬🇭' },
                { name: 'Kenya', flag: '🇰🇪' },
                { name: 'South Africa', flag: '🇿🇦' },
                { name: 'Senegal', flag: '🇸🇳' },
                { name: 'Ethiopia', flag: '🇪🇹' },
              ].map((c) => (
                <li key={c.name}>
                  <Link href={`/products?country=${encodeURIComponent(c.name)}`} className="hover:text-neutral-200 transition-colors font-light">
                    {c.flag} {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-[0.15em] mb-5">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/login" className="hover:text-neutral-200 transition-colors font-light">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-neutral-200 transition-colors font-light">Register</Link></li>
              <li><a href="#" className="hover:text-neutral-200 transition-colors font-light">FAQ</a></li>
              <li><a href="#" className="hover:text-neutral-200 transition-colors font-light">Shipping Info</a></li>
              <li><a href="#" className="hover:text-neutral-200 transition-colors font-light">Returns</a></li>
              <li><a href="#" className="hover:text-neutral-200 transition-colors font-light">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
          <span>&copy; {new Date().getFullYear()} African Fashion. All rights reserved.</span>
          <span className="font-light">Proudly African. Globally Delivered.</span>
        </div>
      </div>
    </footer>
  );
}

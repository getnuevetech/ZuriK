'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { newsletterApi } from '../../lib/api';
import { CurrencySwitcher } from './CurrencySwitcher';

const menuLinks = [
  { href: '/products', label: 'Ready-to-Wear' },
  { href: '/fabrics', label: 'Premium Fabrics' },
  { href: '/designers', label: 'Designers' },
  { href: '/orders/custom-design', label: 'Custom Design' },
];

const storeLinks = [
  { href: '/products?category=dresses', label: 'Dresses' },
  { href: '/fabrics', label: 'Fabrics' },
  { href: '/products?category=accessories', label: 'Accessories' },
  { href: '/designers', label: 'Designers' },
];

const featuredProducts = [
  { name: 'Kitenge Fabric', price: 85 },
  { name: 'Ankara Maxi Dress', price: 210 },
  { name: 'Kente Gown', price: 450 },
];

const SOCIAL_ICONS = [
  {
    label: 'Facebook',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    label: 'Instagram',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  {
    label: 'Twitter/X',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with newsletter API endpoint
    setEmail('');
    setName('');
  };

  return (
    <footer className="bg-[#1a237e] text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <Link href="/" className="block">
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                African Fashion<sup className="text-sm">®</sup>
              </h3>
            </Link>
            <p className="text-white/70 text-sm mb-6">
              Celebrating the richness of African culture through fashion, fabrics, and craftsmanship. Every piece tells a story.
            </p>
            <div className="flex gap-4">
              {SOCIAL_ICONS.map((social) => (
                <a key={social.label} href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" aria-label={social.label}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
            <span className="inline-block bg-white/10 text-xs px-3 py-1">
              Secure payments via <span className="font-semibold">Stripe &amp; Paystack</span>
            </span>
          </div>

          {/* Menu */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-white/50 mb-4">Menu</h4>
            <ul className="space-y-3">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/80 hover:text-white transition-colors text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Store */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-white/50 mb-4">Store</h4>
            <ul className="space-y-3">
              {storeLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/80 hover:text-white transition-colors text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Featured */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-white/50 mb-4">Featured</h4>
            <ul className="space-y-4">
              {featuredProducts.map((product) => (
                <li key={product.name} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center text-lg">👗</div>
                  <div>
                    <p className="text-white/80 text-sm">{product.name}</p>
                    <p className="text-white/50 text-xs">${product.price}.00 USD</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-white/50 mb-4">Newsletter</h4>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white text-gray-900 px-4 py-3 text-sm placeholder:text-gray-400 outline-none"
              />
              <input
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white text-gray-900 px-4 py-3 text-sm placeholder:text-gray-400 outline-none"
              />
              <button type="submit" className="w-full bg-[#00c853] hover:bg-[#00b248] text-white py-3 font-medium transition-colors">
                Submit
              </button>
            </form>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span className="text-[#00c853]">✓</span>
                <span>Exclusive Product Releases</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span className="text-[#00c853]">✓</span>
                <span>Only Subscribers Offers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/50">
            <span>© 2026 African Fashion. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <CurrencySwitcher />
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span>|</span>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/50" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span>&copy; 2026 African Fashion</span>
          <span>|</span>
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span>|</span>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          <span>|</span>
          <span>Made with love for African fashion</span>
        </div>
      </div>
    </footer>
  );
}

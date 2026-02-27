'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const FOOTER_LINKS = {
  menu: [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Ready-to-Wear' },
    { href: '/fabrics', label: 'Premium Fabrics' },
    { href: '/orders/custom-design', label: 'Custom Design' },
    { href: '/designers', label: 'Designers' },
    { href: '#', label: 'Journal' },
  ],
  store: [
    { href: '/products', label: 'Dresses' },
    { href: '/fabrics', label: 'Fabrics' },
    { href: '/products', label: 'Accessories' },
    { href: '/designers', label: 'Designers' },
    { href: '/login', label: 'Sign In' },
    { href: '/register', label: 'Register' },
  ],
};

const featuredProducts = [
  { name: 'Kitenge Fabric', price: 85 },
  { name: 'Kente Gown', price: 450 },
  { name: 'Ankara Set', price: 295 },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <footer className="bg-[#1a237e] text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="font-heading font-bold text-2xl text-white flex items-center gap-1.5 mb-4 tracking-tight">
              African Fashion<sup className="text-sm">®</sup>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed mb-5 font-light max-w-xs">
              Celebrating the richness of African culture through fashion, fabrics, and craftsmanship. Every piece tells a story.
            </p>
            <div className="text-sm text-white/60 font-light space-y-1 mb-5">
              <div>📍 Lagos, Nigeria</div>
              <div>✉ hello@africanfashion.com</div>
              <div>📞 +234 800 FASHION</div>
            </div>
            <div className="flex gap-3">
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="footer-social w-8 h-8 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="footer-social w-8 h-8 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="#" aria-label="Twitter / X" className="footer-social w-8 h-8 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Menu */}
          <div>
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-[0.15em] mb-5">Menu</h3>
            <ul className="space-y-3 text-sm">
              {FOOTER_LINKS.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link font-light">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Store links */}
          <div>
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-[0.15em] mb-5">Store</h3>
            <ul className="space-y-3 text-sm">
              {FOOTER_LINKS.countries.slice(0, 5).map((c) => (
                <li key={c.name}>
                  <Link href={`/products?country=${encodeURIComponent(c.name)}`} className="footer-link font-light">
                    {c.flag} {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Featured products */}
          <div>
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-[0.15em] mb-5">Featured</h3>
            <ul className="space-y-4 text-sm">
              {FOOTER_LINKS.quickLinks.slice(0, 3).map((link) => (
                <li key={link.label} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 flex-shrink-0" />
                  <Link href={link.href} className="footer-link font-light">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-[0.15em] mb-5">Newsletter</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="name"
                className="w-full bg-white text-gray-900 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00c853]"
              />
              <input
                type="email"
                placeholder="email"
                className="w-full bg-white text-gray-900 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00c853]"
              />
              <button className="w-full bg-[#00c853] hover:bg-[#00b248] text-white py-3 font-medium transition-colors">
                Submit
              </button>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <svg className="w-4 h-4 text-[#00c853] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Exclusive Product Releases</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <svg className="w-4 h-4 text-[#00c853] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Only Subscribers Offers</span>
              </div>
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

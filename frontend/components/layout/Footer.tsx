'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { newsletterApi } from '../../lib/api';

const menuLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/fabrics', label: 'Fabrics' },
  { href: '/designers', label: 'Designers' },
  { href: '/orders/custom-design', label: 'Custom Design' },
];

const storeLinks = [
  { href: '/products', label: 'Dresses' },
  { href: '/fabrics', label: 'Fabrics' },
  { href: '/products?category=accessories', label: 'Accessories' },
  { href: '/designers', label: 'Designers' },
  { href: '/cart', label: 'Cart' },
];

const featuredProducts = [
  { name: 'Kitenge Fabric', price: 85 },
  { name: 'Kente Gown', price: 450 },
  { name: 'Ankara Set', price: 295 },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      await newsletterApi.subscribe(email, 'footer');
      setSubscribed(true);
      setEmail('');
      setName('');
    } catch {
      // Silently fail — user gets no error for newsletter
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#1a237e] text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              African Fashion<sup className="text-sm">®</sup>
            </Link>
            <p className="text-white/70 text-sm mb-6 leading-relaxed">
              Celebrating the richness of African culture through fashion, fabrics, and craftsmanship. Every piece tells a story.
            </p>
            <div className="flex gap-3 mb-6">
              {[
                { label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                { label: 'Twitter', path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
              ].map((social) => (
                <a key={social.label} href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#00c853] transition-colors" aria-label={social.label}>
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
            <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4">Menu</h4>
            <ul className="space-y-3">
              {menuLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/70 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Store */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4">Store</h4>
            <ul className="space-y-3">
              {storeLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/70 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Featured */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4">Featured</h4>
            <ul className="space-y-4">
              {featuredProducts.map((product) => (
                <li key={product.name} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 flex-shrink-0" />
                  <div>
                    <p className="text-white/80 text-sm">{product.name}</p>
                    <p className="text-white/50 text-xs">$ {product.price}.00 USD</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4">Newsletter</h4>
            {subscribed ? (
              <div className="py-4 text-center">
                <span className="text-[#00c853] text-2xl">✓</span>
                <p className="text-white/80 text-sm mt-2">Thanks for subscribing!</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white text-gray-900 px-4 py-3 text-sm placeholder:text-gray-400 outline-none"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white text-gray-900 px-4 py-3 text-sm placeholder:text-gray-400 outline-none"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="w-full bg-[#00c853] hover:bg-[#00b248] text-white py-3 font-medium transition-colors text-sm disabled:opacity-60"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span className="text-[#00c853]">✓</span>
                <span>Exclusive Product Releases</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span className="text-[#00c853]">✓</span>
                <span>Subscriber-Only Offers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/50">
            <span>© 2026 African Fashion</span>
            <span>|</span>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>|</span>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>|</span>
            <span>Made with love for African fashion</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

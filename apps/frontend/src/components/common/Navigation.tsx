'use client';

import React from 'react';
import Link from 'next/link';
import { DESIGN_CATEGORIES, AFRICAN_COUNTRIES } from '@/utils/constants';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Navigation({ isOpen, onClose }: NavigationProps) {
  const mainLinks = [
    { label: 'Home', href: '/' },
    { label: 'Designs', href: '/designs' },
    { label: 'Fabrics', href: '/fabrics' },
    { label: 'Designers', href: '/designers' },
    { label: 'About', href: '/about' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block border-t border-gray-200">
        <div className="container-custom">
          <ul className="flex items-center justify-center gap-8 py-4">
            {mainLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-african-dark hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[140px] bg-white z-40 overflow-y-auto">
          <nav className="container-custom py-6">
            <ul className="space-y-4">
              {mainLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block text-lg font-medium text-african-dark hover:text-gold transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Categories */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Categories
              </h3>
              <ul className="space-y-3">
                {DESIGN_CATEGORIES.slice(0, 6).map((category) => (
                  <li key={category}>
                    <Link
                      href={`/designs?category=${encodeURIComponent(category)}`}
                      onClick={onClose}
                      className="text-sm text-african-dark hover:text-gold transition-colors"
                    >
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Countries */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Shop by Country
              </h3>
              <ul className="space-y-3">
                {AFRICAN_COUNTRIES.slice(0, 6).map((country) => (
                  <li key={country}>
                    <Link
                      href={`/designs?country=${encodeURIComponent(country)}`}
                      onClick={onClose}
                      className="text-sm text-african-dark hover:text-gold transition-colors"
                    >
                      {country}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

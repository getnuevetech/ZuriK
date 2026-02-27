'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '../ui/Avatar';
import { GlobalSearch } from '../common/GlobalSearch';
import { NotificationBell } from '../notifications/NotificationBell';
import { LoyaltyBadge } from '../loyalty/LoyaltyBadge';
import { useAuth } from '../../lib/auth-context';
import { CurrencySwitcher } from './CurrencySwitcher';

interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
}

const categories = ['All', 'Dresses', 'Fabrics', 'Accessories', 'Designers'];

const CATEGORY_HREFS: Record<string, string> = {
  All: '/products',
  Dresses: '/products',
  Fabrics: '/fabrics',
  Accessories: '/products',
  Designers: '/designers',
};

export function Navbar({ cartCount = 0, wishlistCount = 0 }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shopMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (shopMenuRef.current && !shopMenuRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShopOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  const displayName = authUser?.firstName
    ? `${authUser.firstName} ${authUser.lastName ?? ''}`.trim()
    : authUser?.email;

  return (
    <nav
      className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${
        isScrolled ? 'shadow-md' : 'border-b border-gray-200'
      }`}
    >
      {/* Top social bar */}
      <div className="bg-[#1a237e] text-white py-2">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex gap-4">
            <a href="#" aria-label="Facebook" className="hover:opacity-70 transition-opacity">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <CurrencySwitcher />
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-3 text-xs">
                <Link href="/login" className="text-white/70 hover:text-white transition-colors">Sign in</Link>
                <span className="text-white/30">|</span>
                <Link href="/register" className="text-white/70 hover:text-white transition-colors">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-[#1a237e] hover:text-[#00c853] transition-colors flex-shrink-0"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            African Fashion
          </Link>

          {/* Category tabs — Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {categories.map((cat) => {
              const href = CATEGORY_HREFS[cat] ?? '/products';
              return (
                <Link
                  key={cat}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith(href) && href !== '/products'
                      ? 'text-[#00c853]'
                      : 'text-[#1a237e] hover:text-[#00c853]'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="text-[#1a237e] hover:text-[#00c853] transition-colors p-1"
              aria-label="Toggle search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link href="/wishlist" className="relative text-[#1a237e] hover:text-[#00c853] transition-colors p-1" aria-label="Wishlist">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#00c853] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative text-[#1a237e] hover:text-[#00c853] transition-colors p-1" aria-label="Cart">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#00c853] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Authenticated user menu */}
            {isAuthenticated && (
              <>
                <LoyaltyBadge />
                <NotificationBell />
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 focus:outline-none p-1"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <Avatar name={displayName} size="sm" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#1a237e]/60" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 py-1 text-[#1a237e] z-50 shadow-modal">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium truncate">{displayName}</p>
                        {authUser?.role && <p className="text-xs text-gray-400 capitalize">{authUser.role.replace('_', ' ')}</p>}
                      </div>
                      <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#00c853] transition-colors" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                      <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#00c853] transition-colors" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                      <Link href="/wishlist" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#00c853] transition-colors" onClick={() => setUserMenuOpen(false)}>Wishlist</Link>
                      <Link
                        href={
                          authUser?.role === 'designer' ? '/dashboard/designer'
                          : authUser?.role === 'fabric_seller' ? '/dashboard/fabric-seller'
                          : authUser?.role === 'qa' ? '/dashboard/qa'
                          : authUser?.role === 'admin' ? '/admin'
                          : '/account'
                        }
                        className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#00c853] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {authUser?.role === 'designer' ? 'Designer Dashboard'
                          : authUser?.role === 'fabric_seller' ? 'Seller Dashboard'
                          : authUser?.role === 'qa' ? 'QA Dashboard'
                          : authUser?.role === 'admin' ? 'Admin Dashboard'
                          : 'My Account'}
                      </Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">Sign out</button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-[#1a237e] p-1"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Desktop search bar */}
        {searchOpen && (
          <div className="hidden lg:block pb-3 pt-2 border-t border-gray-100">
            <GlobalSearch onClose={() => setSearchOpen(false)} autoFocus />
          </div>
        )}

        {/* Mobile always-visible search */}
        <div className="lg:hidden pb-3 pt-2 border-t border-gray-100">
          <GlobalSearch />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-1">
            {categories.map((cat) => {
              const href = CATEGORY_HREFS[cat] ?? '/products';
              return (
                <Link
                  key={cat}
                  href={href}
                  className="block py-2.5 text-[#1a237e] hover:text-[#00c853] transition-colors font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat}
                </Link>
              );
            })}

            {/* Shop dropdown items */}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <Link href="/orders/custom-design" className="block py-2.5 text-[#1a237e] hover:text-[#00c853] transition-colors" onClick={() => setMobileOpen(false)}>Custom Design</Link>
              {isAuthenticated && (
                <>
                  <Link href="/orders" className="block py-2.5 text-[#1a237e] hover:text-[#00c853] transition-colors" onClick={() => setMobileOpen(false)}>My Orders</Link>
                  <Link
                    href={
                      authUser?.role === 'designer' ? '/dashboard/designer'
                      : authUser?.role === 'fabric_seller' ? '/dashboard/fabric-seller'
                      : authUser?.role === 'qa' ? '/dashboard/qa'
                      : authUser?.role === 'admin' ? '/admin'
                      : '/account'
                    }
                    className="block py-2.5 text-[#1a237e] hover:text-[#00c853] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left py-2.5 text-red-500 hover:text-red-700 transition-colors">Sign out</button>
                </>
              )}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-medium border border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                  <Link href="/register" className="flex-1 text-center py-2.5 text-sm font-semibold bg-[#00c853] text-white hover:bg-[#00b248] transition-colors" onClick={() => setMobileOpen(false)}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

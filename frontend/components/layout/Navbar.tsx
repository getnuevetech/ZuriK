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

const COUNTRIES = [
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'Ghana', flag: '🇬🇭' },
  { name: 'Kenya', flag: '🇰🇪' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Ethiopia', flag: '🇪🇹' },
];

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/designers', label: 'Designers' },
];

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
    window.addEventListener('scroll', handleScroll, { passive: true });
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
    <nav className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${isScrolled ? 'shadow-md' : 'border-b border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Left: hamburger + nav links */}
          <div className="flex items-center gap-0.5">
            <button className="md:hidden p-2 text-[#1a237e]/70 hover:text-[#1a237e] transition-colors" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-0.5">
              <Link
                href="/"
                className={[
                  'text-xs font-semibold px-3 py-2 uppercase tracking-widest transition-colors',
                  pathname === '/' ? 'text-[#00c853]' : 'text-[#1a237e]/70 hover:text-[#00c853]',
                ].join(' ')}
              >
                Home
              </Link>

              {/* Shop mega menu trigger */}
              <div className="relative" ref={shopMenuRef}>
                <button
                  onClick={() => setShopOpen((v) => !v)}
                  className={[
                    'flex items-center gap-1 text-xs font-semibold px-3 py-2 uppercase tracking-widest transition-colors',
                    (pathname.startsWith('/products') || pathname.startsWith('/fabrics') || pathname.startsWith('/orders/custom'))
                      ? 'text-[#00c853]' : 'text-[#1a237e]/70 hover:text-[#00c853]',
                  ].join(' ')}
                  aria-expanded={shopOpen}
                  aria-haspopup="true"
                >
                  Shop
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${shopOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {shopOpen && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-[#1a237e] border border-[#1a237e]/20 py-2 z-50 shadow-modal">
                    <div className="px-1">
                      <Link href="/products" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors" onClick={() => setShopOpen(false)}>
                        <div>
                          <div className="font-medium text-sm text-white">Ready-to-Wear</div>
                          <div className="text-xs text-white/50 font-light">Curated African fashion, ready to ship</div>
                        </div>
                      </Link>
                      <Link href="/fabrics" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors" onClick={() => setShopOpen(false)}>
                        <div>
                          <div className="font-medium text-sm text-white">Premium Fabrics</div>
                          <div className="text-xs text-white/50 font-light">Authentic African textiles</div>
                        </div>
                      </Link>
                      <Link href="/orders/custom-design" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors" onClick={() => setShopOpen(false)}>
                        <div>
                          <div className="font-medium text-sm text-white">Custom Design</div>
                          <div className="text-xs text-white/50 font-light">Your body, your fabric, your style</div>
                        </div>
                      </Link>
                    </div>
                    <div className="border-t border-white/10 mt-1 pt-1 px-1">
                      <div className="px-3 py-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Shop by Country</div>
                      <div className="grid grid-cols-2 gap-0.5">
                        {COUNTRIES.map((c) => (
                          <Link
                            key={c.name}
                            href={`/products?country=${encodeURIComponent(c.name)}`}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 transition-colors text-sm text-white/70"
                            onClick={() => setShopOpen(false)}
                          >
                            <span>{c.flag}</span> {c.name}
                          </Link>
                        ))}
                        <Link href="/products" className="col-span-2 flex items-center gap-2 px-3 py-2 hover:bg-white/10 transition-colors text-sm text-white font-medium" onClick={() => setShopOpen(false)}>
                          View All Countries →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/designers" className={['text-xs font-semibold px-3 py-2 uppercase tracking-widest transition-colors', pathname.startsWith('/designers') ? 'text-[#00c853]' : 'text-[#1a237e]/70 hover:text-[#00c853]'].join(' ')}>
                Designers
              </Link>

              <Link href="/orders/custom-design" className="relative flex items-center gap-1 text-xs font-semibold px-3 py-2 uppercase tracking-widest transition-colors text-[#1a237e]/70 hover:text-[#00c853]">
                3D Try-On
                <span className="text-[#00c853] text-[9px] font-bold px-1 py-0.5 leading-none border border-[#00c853]/50">Soon</span>
              </Link>

              {isAuthenticated && (
                <>
                  <Link href="/orders" className="text-xs font-semibold text-[#1a237e]/70 hover:text-[#00c853] transition-colors px-3 py-2 uppercase tracking-widest">My Orders</Link>
                  <Link
                    href={
                      authUser?.role === 'designer' ? '/dashboard/designer'
                      : authUser?.role === 'fabric_seller' ? '/dashboard/fabric-seller'
                      : authUser?.role === 'qa' ? '/dashboard/qa'
                      : authUser?.role === 'admin' ? '/admin'
                      : '/account'
                    }
                    className="text-xs font-semibold text-[#1a237e]/70 hover:text-[#00c853] transition-colors px-3 py-2 uppercase tracking-widest"
                  >
                    {authUser?.role === 'designer' ? 'Dashboard'
                      : authUser?.role === 'fabric_seller' ? 'Dashboard'
                      : authUser?.role === 'qa' ? 'QA'
                      : authUser?.role === 'admin' ? 'Admin'
                      : 'Account'}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center">
            <Link href="/" className="font-heading font-bold text-lg text-[#1a237e] hover:text-[#00c853] transition-colors tracking-tight flex items-center gap-1.5">
              <span className="text-[#00c853]">✦</span>
              African Fashion
            </Link>
          </div>

          {/* Right: search + user icons + cart */}
          <div className="flex items-center gap-1 justify-end">
            <CurrencySwitcher />
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="hidden md:flex p-2 text-[#1a237e]/70 hover:text-[#1a237e] transition-colors"
              aria-label="Toggle search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>

            {isAuthenticated && (
              <Link href="/wishlist" className="relative p-2 text-[#1a237e]/70 hover:text-[#1a237e] transition-colors" aria-label="Wishlist">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#00c853] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            <Link href="/cart" className="relative p-2 text-[#1a237e]/70 hover:text-[#1a237e] transition-colors" aria-label="Cart">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#00c853] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <LoyaltyBadge />
                <NotificationBell />
                <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a237e]/40 p-1" aria-expanded={userMenuOpen} aria-haspopup="true">
                  <Avatar name={displayName} size="sm" />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#1a237e]/40" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-[#1a237e] border border-[#1a237e]/20 py-1 text-white z-50 shadow-modal">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-medium truncate">{displayName}</p>
                      {authUser?.role && <p className="text-xs text-white/50 capitalize font-light">{authUser.role.replace('_', ' ')}</p>}
                    </div>
                    <Link href="/account" className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                    <Link href="/wishlist" className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors" onClick={() => setUserMenuOpen(false)}>Wishlist</Link>
                    <Link href="/account/addresses" className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors" onClick={() => setUserMenuOpen(false)}>Addresses</Link>
                    {authUser?.role === 'customer' && (
                      <Link href="/become-seller" className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors" onClick={() => setUserMenuOpen(false)}>Become a Seller</Link>
                    )}
                    {authUser?.role === 'admin' && (
                      <Link href="/admin/seller-applications" className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors" onClick={() => setUserMenuOpen(false)}>Seller Applications</Link>
                    )}
                    <Link
                      href={
                        authUser?.role === 'designer' ? '/dashboard/designer'
                        : authUser?.role === 'fabric_seller' ? '/dashboard/fabric-seller'
                        : authUser?.role === 'qa' ? '/dashboard/qa'
                        : authUser?.role === 'admin' ? '/admin'
                        : '/account'
                      }
                      className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {authUser?.role === 'designer' ? 'Designer Dashboard'
                        : authUser?.role === 'fabric_seller' ? 'Seller Dashboard'
                        : authUser?.role === 'qa' ? 'QA Dashboard'
                        : authUser?.role === 'admin' ? 'Admin Dashboard'
                        : 'My Account'}
                    </Link>
                    {(authUser?.role === 'designer' || authUser?.role === 'fabric_seller') && (
                      <Link href="/dashboard/inventory" className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors" onClick={() => setUserMenuOpen(false)}>Inventory</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-900/20 transition-colors">Sign out</button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Link href="/login" className="text-sm font-medium text-[#1a237e]/80 hover:text-[#1a237e] transition-colors px-3 py-2">Sign in</Link>
                <Link href="/register" className="text-sm font-semibold bg-[#00c853] hover:bg-[#00b248] text-white transition-colors px-4 py-2 uppercase tracking-wider">Register</Link>
              </div>
            )}
          </div>
        </div>

        {/* Desktop expandable search */}
        {searchOpen && (
          <div className="hidden md:block pb-3 pt-2 border-t border-gray-200">
            <GlobalSearch onClose={() => setSearchOpen(false)} autoFocus />
          </div>
        )}

        {/* Mobile always-visible search */}
        <div className="md:hidden pb-3 pt-2 border-t border-gray-200">
          <GlobalSearch />
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-2 border-t border-gray-200 space-y-0.5">
            <div className="px-3 py-1">
              <CurrencySwitcher />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={['block px-3 py-2.5 text-sm font-medium uppercase tracking-widest transition-colors', pathname === link.href ? 'text-[#00c853]' : 'text-[#1a237e]/70 hover:text-[#00c853]'].join(' ')}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/products" className="block px-3 py-2.5 text-sm font-medium uppercase tracking-widest text-[#1a237e]/70 hover:text-[#00c853] transition-colors" onClick={() => setMobileOpen(false)}>Ready-to-Wear</Link>
            <Link href="/fabrics" className="block px-3 py-2.5 text-sm font-medium uppercase tracking-widest text-[#1a237e]/70 hover:text-[#00c853] transition-colors" onClick={() => setMobileOpen(false)}>Fabrics</Link>
            <Link href="/orders/custom-design" className="block px-3 py-2.5 text-sm font-medium uppercase tracking-widest text-[#1a237e]/70 hover:text-[#00c853] transition-colors" onClick={() => setMobileOpen(false)}>Custom Design</Link>
            {isAuthenticated ? (
              <>
                <Link href="/orders" className="block px-3 py-2.5 text-sm font-medium uppercase tracking-widest text-[#1a237e]/70 hover:text-[#00c853] transition-colors" onClick={() => setMobileOpen(false)}>My Orders</Link>
                <Link
                  href={
                    authUser?.role === 'designer' ? '/dashboard/designer'
                    : authUser?.role === 'fabric_seller' ? '/dashboard/fabric-seller'
                    : authUser?.role === 'qa' ? '/dashboard/qa'
                    : authUser?.role === 'admin' ? '/admin'
                    : '/account'
                  }
                  className="block px-3 py-2.5 text-sm font-medium uppercase tracking-widest text-[#1a237e]/70 hover:text-[#00c853] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {authUser?.role === 'designer' ? 'Designer Dashboard'
                    : authUser?.role === 'fabric_seller' ? 'Seller Dashboard'
                    : authUser?.role === 'qa' ? 'QA Dashboard'
                    : authUser?.role === 'admin' ? 'Admin Dashboard'
                    : 'My Account'}
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">Sign out</button>
              </>
            ) : (
              <div className="flex gap-2 pt-2 px-3">
                <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-medium border border-gray-300 text-[#1a237e] hover:border-[#1a237e] transition-colors" onClick={() => setMobileOpen(false)}>
                  Sign in
                </Link>
                <Link href="/register" className="flex-1 text-center py-2.5 text-sm font-semibold bg-[#00c853] hover:bg-[#00b248] text-white transition-colors uppercase tracking-wider" onClick={() => setMobileOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

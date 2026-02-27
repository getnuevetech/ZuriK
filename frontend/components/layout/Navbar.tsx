'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

function getInitials(value?: string): string {
  if (!value) return 'U';
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function Navbar({ cartCount = 0, wishlistCount = 0 }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shopMenuRef = useRef<HTMLDivElement>(null);

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
  const initials = getInitials(displayName);

  const accountHref =
    authUser?.role === 'designer' ? '/dashboard/designer'
      : authUser?.role === 'fabric_seller' ? '/dashboard/fabric-seller'
        : authUser?.role === 'qa' ? '/dashboard/qa'
          : authUser?.role === 'admin' ? '/admin'
            : '/account';

  const dashboardLabel = authUser?.role === 'admin' ? 'ADMIN' : 'DASHBOARD';
  const isShopPath =
    pathname.startsWith('/products')
    || pathname.startsWith('/fabrics')
    || pathname.startsWith('/ready-to-wear')
    || pathname.startsWith('/orders/custom-design');

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#1f3a63]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14">
          {/* Left: desktop menu */}
          <div className="flex items-center gap-0.5">
            <button
              className="lg:hidden p-2 text-white/85 hover:text-white transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>

            <div className="hidden lg:flex items-center gap-0.5">
              <Link
                href="/"
                className={[
                  'text-[11px] font-semibold px-3 py-2 uppercase tracking-[0.14em] transition-colors',
                  pathname === '/' ? 'text-[#f2c14d]' : 'text-white/72 hover:text-white',
                ].join(' ')}
              >
                Home
              </Link>

              <div className="relative" ref={shopMenuRef}>
                <button
                  onClick={() => setShopOpen((v) => !v)}
                  className={[
                    'flex items-center gap-1 text-[11px] font-semibold px-3 py-2 uppercase tracking-[0.14em] transition-colors',
                    isShopPath ? 'text-[#f2c14d]' : 'text-white/72 hover:text-white',
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
                  <div className="absolute top-full left-0 mt-2 w-80 border py-2 z-50 shadow-modal rounded-lg" style={{ backgroundColor: '#fffdf9', borderColor: 'var(--color-border)' }}>
                    <div className="px-1">
                      <Link href="/products" className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f8f2ea] transition-colors rounded-md" onClick={() => setShopOpen(false)}>
                        <div>
                          <div className="font-medium text-sm text-[var(--color-primary-dark)]">Ready-to-Wear</div>
                          <div className="text-xs text-[var(--color-text-muted)] font-light">Curated African fashion, ready to ship</div>
                        </div>
                      </Link>
                      <Link href="/fabrics" className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f8f2ea] transition-colors rounded-md" onClick={() => setShopOpen(false)}>
                        <div>
                          <div className="font-medium text-sm text-[var(--color-primary-dark)]">Premium Fabrics</div>
                          <div className="text-xs text-[var(--color-text-muted)] font-light">Authentic African textiles</div>
                        </div>
                      </Link>
                      <Link href="/orders/custom-design" className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f8f2ea] transition-colors rounded-md" onClick={() => setShopOpen(false)}>
                        <div>
                          <div className="font-medium text-sm text-[var(--color-primary-dark)]">Custom Design</div>
                          <div className="text-xs text-[var(--color-text-muted)] font-light">Your body, your fabric, your style</div>
                        </div>
                      </Link>
                    </div>
                    <div className="border-t mt-1 pt-1 px-1" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Shop by Country</div>
                      <div className="grid grid-cols-2 gap-0.5">
                        {COUNTRIES.map((c) => (
                          <Link
                            key={c.name}
                            href={`/products?country=${encodeURIComponent(c.name)}`}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-[#f8f2ea] transition-colors text-sm text-[var(--color-primary)]/75 rounded-md"
                            onClick={() => setShopOpen(false)}
                          >
                            <span>{c.flag}</span> {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/designers" className={['text-[11px] font-semibold px-3 py-2 uppercase tracking-[0.14em] transition-colors', pathname.startsWith('/designers') ? 'text-[#f2c14d]' : 'text-white/72 hover:text-white'].join(' ')}>
                Designers
              </Link>

              <Link href="/orders/custom-design" className="relative flex items-center gap-1 text-[11px] font-semibold px-3 py-2 uppercase tracking-[0.14em] transition-colors text-white/72 hover:text-white">
                3D Try-On
                <span className="text-[#f2c14d] text-[9px] font-bold px-1 py-0.5 leading-none border border-[#f2c14d]/70">Soon</span>
              </Link>

              {isAuthenticated && (
                <>
                  <Link href="/orders" className="text-[11px] font-semibold text-white/72 hover:text-white transition-colors px-3 py-2 uppercase tracking-[0.14em]">My Orders</Link>
                  <Link href={accountHref} className={['text-[11px] font-semibold transition-colors px-3 py-2 uppercase tracking-[0.14em]', authUser?.role === 'admin' ? 'text-[#f2c14d] hover:text-[#f6cf74]' : 'text-white/72 hover:text-white'].join(' ')}>
                    {dashboardLabel}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Center logo */}
          <div className="flex justify-center">
            <Link href="/" className="font-heading font-semibold text-2xl text-white hover:text-white/90 transition-colors tracking-tight flex items-center gap-1.5">
              <span className="text-[#f2c14d]">✦</span>
              African Fashion
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 justify-end min-w-0">
            <CurrencySwitcher tone="dark" />
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="hidden md:flex p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Toggle search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>

            {isAuthenticated && (
              <Link href="/wishlist" className="relative p-2 text-white/80 hover:text-white transition-colors" aria-label="Wishlist">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-[#1E3A5F] text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            <Link href="/cart" className="relative p-2 text-white/80 hover:text-white transition-colors" aria-label="Cart">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-[#1E3A5F] text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <LoyaltyBadge />
                <NotificationBell tone="dark" />
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 p-1 rounded" aria-expanded={userMenuOpen} aria-haspopup="true">
                    <span className="text-xs font-semibold text-white/95 uppercase">{initials}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white/70" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 border py-1 text-[var(--color-primary-dark)] z-50 shadow-modal rounded-lg" style={{ backgroundColor: '#fffdf9', borderColor: 'var(--color-border)' }}>
                      <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <p className="text-sm font-semibold truncate">{displayName}</p>
                        {authUser?.role && <p className="text-xs text-[var(--color-text-muted)] capitalize font-light">{authUser.role.replace('_', ' ')}</p>}
                      </div>
                      <Link href="/account" className="block px-4 py-2 text-sm hover:bg-[#f8f2ea] transition-colors" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                      <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-[#f8f2ea] transition-colors" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                      <Link href="/wishlist" className="block px-4 py-2 text-sm hover:bg-[#f8f2ea] transition-colors" onClick={() => setUserMenuOpen(false)}>Wishlist</Link>
                      <Link href={accountHref} className="block px-4 py-2 text-sm hover:bg-[#f8f2ea] transition-colors" onClick={() => setUserMenuOpen(false)}>Dashboard</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Sign out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Link href="/login" className="text-xs font-medium text-white/85 hover:text-white transition-colors px-2 py-2 uppercase tracking-[0.14em]">Sign in</Link>
                <Link href="/register" className="text-xs font-semibold text-[#1f3a63] hover:opacity-90 transition-colors px-3 py-1.5 uppercase tracking-[0.14em] rounded-md bg-[#f2c14d]">Register</Link>
              </div>
            )}
          </div>
        </div>

        {searchOpen && (
          <div className="hidden md:block pb-3 pt-2 border-t border-white/10">
            <GlobalSearch onClose={() => setSearchOpen(false)} autoFocus />
          </div>
        )}

        <div className="lg:hidden pb-3 pt-2 border-t border-white/10">
          <GlobalSearch />
        </div>

        {mobileOpen && (
          <div className="lg:hidden py-2 border-t border-white/10 space-y-0.5">
            <div className="px-3 py-1">
              <CurrencySwitcher tone="dark" />
            </div>
            {[
              { href: '/', label: 'Home' },
              { href: '/products', label: 'Shop' },
              { href: '/designers', label: 'Designers' },
              { href: '/orders/custom-design', label: '3D Try-On' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={['block px-3 py-2.5 text-sm font-medium uppercase tracking-widest transition-colors', pathname === link.href ? 'text-[#f2c14d]' : 'text-white/80 hover:text-white'].join(' ')}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link href="/orders" className="block px-3 py-2.5 text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>My Orders</Link>
                <Link href={accountHref} className="block px-3 py-2.5 text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>{authUser?.role === 'admin' ? 'Admin' : 'Dashboard'}</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 text-sm font-medium text-red-300 hover:text-red-200 transition-colors">Sign out</button>
              </>
            ) : (
              <div className="flex gap-2 pt-2 px-3">
                <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-medium border text-white/90 border-white/25 hover:border-white/40 transition-colors rounded-md" onClick={() => setMobileOpen(false)}>Sign in</Link>
                <Link href="/register" className="flex-1 text-center py-2.5 text-sm font-semibold text-[#1f3a63] hover:opacity-90 transition-colors uppercase tracking-wider rounded-md bg-[#f2c14d]" onClick={() => setMobileOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { GlobalSearch } from '../common/GlobalSearch';
import { NotificationBell } from '../notifications/NotificationBell';

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
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shopMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
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
    localStorage.removeItem('auth_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <nav className="bg-primary-950 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-white hover:text-secondary-300 transition-colors flex-shrink-0">
            <span className="text-secondary-400">✦</span>
            African Fashion
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={[
                'text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:text-secondary-300',
                pathname === '/' ? 'text-secondary-400' : 'text-neutral-200',
              ].join(' ')}
            >
              Home
            </Link>

            {/* Shop mega menu trigger */}
            <div className="relative" ref={shopMenuRef}>
              <button
                onClick={() => setShopOpen((v) => !v)}
                className={[
                  'flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:text-secondary-300',
                  (pathname.startsWith('/products') || pathname.startsWith('/fabrics') || pathname.startsWith('/orders/custom'))
                    ? 'text-secondary-400' : 'text-neutral-200',
                ].join(' ')}
                aria-expanded={shopOpen}
                aria-haspopup="true"
              >
                Shop
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${shopOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {shopOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white text-neutral-800 rounded-xl shadow-modal border border-neutral-100 py-2 z-50">
                  <div className="px-2">
                    <Link href="/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors" onClick={() => setShopOpen(false)}>
                      <span className="text-xl">👗</span>
                      <div>
                        <div className="font-medium text-sm">Ready-to-Wear</div>
                        <div className="text-xs text-neutral-500">Curated African fashion, ready to ship</div>
                      </div>
                    </Link>
                    <Link href="/fabrics" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors" onClick={() => setShopOpen(false)}>
                      <span className="text-xl">🧵</span>
                      <div>
                        <div className="font-medium text-sm">Premium Fabrics</div>
                        <div className="text-xs text-neutral-500">Authentic African textiles</div>
                      </div>
                    </Link>
                    <Link href="/orders/custom-design" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors" onClick={() => setShopOpen(false)}>
                      <span className="text-xl">✂️</span>
                      <div>
                        <div className="font-medium text-sm">Custom Design</div>
                        <div className="text-xs text-neutral-500">Your body, your fabric, your style</div>
                      </div>
                    </Link>
                  </div>
                  <div className="border-t border-neutral-100 mt-1 pt-1 px-2">
                    <div className="px-3 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Shop by Country</div>
                    <div className="grid grid-cols-2 gap-0.5">
                      {COUNTRIES.map((c) => (
                        <Link
                          key={c.name}
                          href={`/products?country=${encodeURIComponent(c.name)}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-sm"
                          onClick={() => setShopOpen(false)}
                        >
                          <span>{c.flag}</span> {c.name}
                        </Link>
                      ))}
                      <Link href="/products" className="col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-sm text-primary-600 font-medium" onClick={() => setShopOpen(false)}>
                        View All Countries →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/designers" className={['text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:text-secondary-300', pathname.startsWith('/designers') ? 'text-secondary-400' : 'text-neutral-200'].join(' ')}>
              Designers
            </Link>

            <Link href="/orders/custom-design" className="relative flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:text-secondary-300 text-neutral-200">
              3D Try-On
              <span className="bg-secondary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">Soon</span>
            </Link>

            {user && (
              <>
                <Link href="/orders" className="text-sm font-medium text-neutral-200 hover:text-secondary-300 transition-colors px-3 py-2 rounded-lg">My Orders</Link>
                <Link
                  href={
                    user.role === 'designer' ? '/dashboard/designer'
                    : user.role === 'fabric_seller' ? '/dashboard/fabric-seller'
                    : user.role === 'qa' ? '/dashboard/qa'
                    : user.role === 'admin' ? '/dashboard/admin'
                    : '/account'
                  }
                  className="text-sm font-medium text-neutral-200 hover:text-secondary-300 transition-colors px-3 py-2 rounded-lg"
                >
                  {user.role === 'designer' ? 'Designer Dashboard'
                    : user.role === 'fabric_seller' ? 'Seller Dashboard'
                    : user.role === 'qa' ? 'QA Dashboard'
                    : user.role === 'admin' ? 'Admin Dashboard'
                    : 'My Account'}
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="hidden md:flex p-2 text-neutral-200 hover:text-secondary-300 transition-colors rounded-lg"
              aria-label="Toggle search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>

            <Link href="/cart" className="relative p-2 text-neutral-200 hover:text-secondary-300 transition-colors" aria-label="Cart">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {user && (
              <Link href="/wishlist" className="relative p-2 text-neutral-200 hover:text-secondary-300 transition-colors" aria-label="Wishlist">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <>
                <NotificationBell />
                <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 rounded-lg p-1" aria-expanded={userMenuOpen} aria-haspopup="true">
                  <Avatar name={user.name || user.email} size="sm" />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-modal border border-neutral-100 py-1 text-neutral-800 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                      {user.role && <p className="text-xs text-neutral-500 capitalize">{user.role.replace('_', ' ')}</p>}
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-neutral-50 transition-colors" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-neutral-50 transition-colors" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                    <Link
                      href={
                        user.role === 'designer' ? '/dashboard/designer'
                        : user.role === 'fabric_seller' ? '/dashboard/fabric-seller'
                        : user.role === 'qa' ? '/dashboard/qa'
                        : user.role === 'admin' ? '/dashboard/admin'
                        : '/account'
                      }
                      className="block px-4 py-2 text-sm hover:bg-neutral-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {user.role === 'designer' ? 'Designer Dashboard'
                        : user.role === 'fabric_seller' ? 'Seller Dashboard'
                        : user.role === 'qa' ? 'QA Dashboard'
                        : user.role === 'admin' ? 'Admin Dashboard'
                        : 'My Account'}
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Sign out</button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login"><Button variant="ghost" size="sm" className="text-neutral-200 hover:text-white hover:bg-white/10">Sign in</Button></Link>
                <Link href="/register"><Button variant="secondary" size="sm">Register</Button></Link>
              </div>
            )}

            <button className="md:hidden p-2 rounded-lg text-neutral-200 hover:bg-white/10 transition-colors" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Desktop expandable search */}
        {searchOpen && (
          <div className="hidden md:block pb-3 pt-2 border-t border-white/10">
            <GlobalSearch onClose={() => setSearchOpen(false)} autoFocus />
          </div>
        )}

        {/* Mobile always-visible search */}
        <div className="md:hidden pb-3 pt-2 border-t border-white/10">
          <GlobalSearch />
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-2 border-t border-white/10 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={['block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors', pathname === link.href ? 'bg-white/10 text-secondary-400' : 'text-neutral-200 hover:bg-white/10'].join(' ')}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/products" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-200 hover:bg-white/10" onClick={() => setMobileOpen(false)}>👗 Ready-to-Wear</Link>
            <Link href="/fabrics" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-200 hover:bg-white/10" onClick={() => setMobileOpen(false)}>🧵 Fabrics</Link>
            <Link href="/orders/custom-design" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-200 hover:bg-white/10" onClick={() => setMobileOpen(false)}>✂️ Custom Design</Link>
            {user ? (
              <>
                <Link href="/orders" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-200 hover:bg-white/10" onClick={() => setMobileOpen(false)}>My Orders</Link>
                <Link
                  href={
                    user.role === 'designer' ? '/dashboard/designer'
                    : user.role === 'fabric_seller' ? '/dashboard/fabric-seller'
                    : user.role === 'qa' ? '/dashboard/qa'
                    : user.role === 'admin' ? '/dashboard/admin'
                    : '/account'
                  }
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-200 hover:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                >
                  {user.role === 'designer' ? 'Designer Dashboard'
                    : user.role === 'fabric_seller' ? 'Seller Dashboard'
                    : user.role === 'qa' ? 'QA Dashboard'
                    : user.role === 'admin' ? 'Admin Dashboard'
                    : 'My Account'}
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-white/10">Sign out</button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full border-white/30 text-white hover:bg-white/10">Sign in</Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

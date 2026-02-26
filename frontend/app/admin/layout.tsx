'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Spinner } from '../../components/ui/Spinner';

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  {
    href: '/admin/products',
    label: 'Products',
    icon: '🛍️',
    children: [
      { href: '/admin/products/fabrics', label: 'Fabrics', icon: '🧵' },
      { href: '/admin/products/ready-to-wear', label: 'Ready-to-Wear', icon: '👗' },
      { href: '/admin/products/designs', label: 'Designs', icon: '🎨' },
    ],
  },
  { href: '/admin/payments', label: 'Payments', icon: '💳' },
  { href: '/admin/seller-applications', label: 'Seller Applications', icon: '📋' },
  { href: '/admin/coupons', label: 'Coupons', icon: '🏷️' },
  { href: '/admin/shipping', label: 'Shipping Methods', icon: '🚚' },
  { href: '/admin/shipments', label: 'Shipments', icon: '📬' },
  { href: '/admin/homepage', label: 'Homepage', icon: '🏠' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/admin/taxes', label: 'Taxes', icon: '💰' },
  { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { href: '/admin/stock-alerts', label: 'Stock Alerts', icon: '📉' },
  { href: '/admin/loyalty', label: 'Loyalty', icon: '🎁' },
  { href: '/admin/newsletter', label: 'Newsletter', icon: '📧' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin');
      return;
    }
    if (user && user.role !== 'admin') {
      router.push('/403');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_theme');
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored);
      }
    } catch {
      // ignore localStorage failures
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('admin_theme', theme);
    } catch {
      // ignore localStorage failures
    }
  }, [theme]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null;
  }

  const toggleSidebar = () => setSidebarCollapsed((prev: boolean) => !prev);
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <div className={theme === 'dark' ? 'admin-theme-dark h-screen' : 'h-screen'}>
      <div className="flex h-screen admin-shell">
        <AdminSidebar
          items={ADMIN_NAV_ITEMS}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className={`backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between flex-shrink-0 ${
            theme === 'dark' ? 'bg-[#101a35]/90 border-[#2b3c71]' : 'bg-[#fffaf4]/90 border-[#e4d8cb]'
          }`}>
            <button
              className={`md:hidden p-1 rounded ${
                theme === 'dark' ? 'text-[#afc0ea] hover:text-[#f1f4ff]' : 'text-[#5c5247] hover:text-[#201a15]'
              }`}
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden md:block" />
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={toggleTheme}
                className={`text-[10px] uppercase tracking-[0.18em] rounded-md px-3 py-2 transition-colors ${
                  theme === 'dark'
                    ? 'text-[#d6e0ff] hover:text-white border border-[#3f568f] hover:bg-[#1d2c58]'
                    : 'text-[#4f463b] hover:text-[#201a15] border border-[#d9cdbc]'
                }`}
              >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <span className={`text-sm ${theme === 'dark' ? 'text-[#d6def5]' : 'text-[#5f5549]'}`}>
                {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user?.email}
              </span>
              <button
                onClick={logout}
                className={`text-xs uppercase tracking-[0.18em] rounded-md px-3 py-2 transition-colors ${
                  theme === 'dark'
                    ? 'text-[#d6e0ff] hover:text-white border border-[#3f568f] hover:bg-[#1d2c58]'
                    : 'text-[#4f463b] hover:text-[#201a15] border border-[#d9cdbc]'
                }`}
              >
                Logout
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

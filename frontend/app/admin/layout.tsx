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

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        items={ADMIN_NAV_ITEMS}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            className="md:hidden text-[#1a237e]/60 hover:text-[#1a237e] p-1 rounded"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#1a237e]/70 font-medium">
              {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user?.email}
            </span>
            <button
              onClick={logout}
              className="text-sm text-[#1a237e]/60 hover:text-[#1a237e] border border-gray-200 hover:border-[#1a237e]/30 rounded px-3 py-1.5 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

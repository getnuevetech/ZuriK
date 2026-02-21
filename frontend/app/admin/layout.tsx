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
  { href: '/admin/payments', label: 'Payments', icon: '💳' },
  { href: '/admin/coupons', label: 'Coupons', icon: '🏷️' },
  { href: '/admin/shipping', label: 'Shipping', icon: '🚚' },
  { href: '/admin/shipments', label: 'Shipments', icon: '📬' },
  { href: '/admin/seller-applications', label: 'Seller Applications', icon: '📋' },
  { href: '/admin/homepage', label: 'Homepage', icon: '🏠' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
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
    <div className="flex h-screen bg-neutral-50">
      <AdminSidebar
        items={ADMIN_NAV_ITEMS}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            className="md:hidden text-neutral-600 hover:text-neutral-900 p-1 rounded"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">
              {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user?.email}
            </span>
            <button
              onClick={logout}
              className="text-sm text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded px-3 py-1.5 transition-colors"
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

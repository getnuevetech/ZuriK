'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireRole } from '../../../lib/with-role';
import { analyticsApi } from '../../../lib/api';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { StatsCard } from '../../../components/dashboard/StatsCard';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { ActivityFeed } from '../../../components/dashboard/ActivityFeed';
import type { AnalyticsOverview } from '../../../types';

const SIDEBAR_ITEMS = [
  { href: '/dashboard/admin', label: 'Overview', icon: '📊' },
  { href: '/dashboard/admin/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/admin/orders', label: 'All Orders', icon: '📦' },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: '📈' },
];

export default function AdminDashboardPage() {
  const { user, isLoading } = useRequireRole(['admin']);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getOverview()
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  const activityEvents = analytics?.recentOrders.map((o) => ({
    id: o.id,
    label: `Order #${o.orderNumber} — ${o.status.replace(/_/g, ' ')} · $${o.totalPrice?.toFixed(2)}`,
    timestamp: o.createdAt,
    icon: '📦',
  })) || [];

  return (
    <DashboardLayout sidebarItems={SIDEBAR_ITEMS} userRole={user.role} title="Admin Dashboard">
      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatsCard label="Total Users" value={analytics?.totalUsers ?? 0} icon="👥" />
            <StatsCard label="Total Orders" value={analytics?.totalOrders ?? 0} icon="📦" />
            <StatsCard label="Revenue" value={`$${(analytics?.totalRevenue ?? 0).toFixed(0)}`} icon="💰" />
            <StatsCard label="Active Products" value={analytics?.activeProducts ?? 0} icon="👗" />
            <StatsCard label="Active Fabrics" value={analytics?.activeFabrics ?? 0} icon="🧵" />
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/dashboard/admin/users">
              <Button variant="outline" size="sm">Manage Users</Button>
            </Link>
            <Link href="/dashboard/admin/orders">
              <Button variant="outline" size="sm">View All Orders</Button>
            </Link>
            <Link href="/dashboard/admin/settings">
              <Button variant="outline" size="sm">Platform Settings</Button>
            </Link>
            <Link href="/dashboard/admin/analytics">
              <Button variant="outline" size="sm">Analytics</Button>
            </Link>
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h2>
            <ActivityFeed events={activityEvents} emptyMessage="No recent orders." />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

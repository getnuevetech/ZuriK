'use client';

import React, { useEffect, useState } from 'react';
import { useRequireRole } from '../../../../lib/with-role';
import { analyticsApi } from '../../../../lib/api';
import { Spinner } from '../../../../components/ui/Spinner';
import { StatsCard } from '../../../../components/dashboard/StatsCard';
import { DashboardLayout } from '../../../../components/dashboard/DashboardLayout';
import type { AnalyticsOverview } from '../../../../types';

const SIDEBAR_ITEMS = [
  { href: '/dashboard/admin', label: 'Overview', icon: '📊' },
  { href: '/dashboard/admin/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/admin/orders', label: 'All Orders', icon: '📦' },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: '📈' },
];

export default function AdminAnalyticsPage() {
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

  const statusCounts: Record<string, number> = {};
  analytics?.recentOrders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(statusCounts), 1);

  return (
    <DashboardLayout sidebarItems={SIDEBAR_ITEMS} userRole={user.role} title="Analytics">
      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          {/* Overview stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatsCard label="Total Users" value={analytics?.totalUsers ?? 0} icon="👥" />
            <StatsCard label="Total Orders" value={analytics?.totalOrders ?? 0} icon="📦" />
            <StatsCard label="Revenue" value={`$${(analytics?.totalRevenue ?? 0).toFixed(0)}`} icon="💰" />
            <StatsCard label="Active Products" value={analytics?.activeProducts ?? 0} icon="👗" />
            <StatsCard label="Active Fabrics" value={analytics?.activeFabrics ?? 0} icon="🧵" />
          </div>

          {/* Orders by status (simple bar chart) */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Orders by Status</h2>
            {Object.keys(statusCounts).length === 0 ? (
              <p className="text-neutral-500 text-sm">No order data available.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(statusCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => (
                    <div key={status} className="flex items-center gap-3">
                      <div className="w-40 text-xs text-neutral-600 truncate">{status.replace(/_/g, ' ')}</div>
                      <div className="flex-1 bg-neutral-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="bg-primary-500 h-full rounded-full transition-all"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                      <div className="w-8 text-xs text-right font-medium text-neutral-700">{count}</div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Revenue summary */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Revenue Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-sm text-neutral-500">Total Revenue</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  ${(analytics?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-sm text-neutral-500">Average Order Value</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  ${analytics?.totalOrders
                    ? ((analytics.totalRevenue / analytics.totalOrders)).toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

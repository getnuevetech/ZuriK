'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminApi } from '../../lib/api';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatsCard from '../../components/admin/StatsCard';
import SimpleBarChart from '../../components/admin/SimpleBarChart';
import StatusBadge from '../../components/admin/StatusBadge';
import DataTable from '../../components/admin/DataTable';
import { Spinner } from '../../components/ui/Spinner';

interface OverviewData {
  totalRevenue: number;
  totalOrders: number;
  totalOrdersLast30Days: number;
  totalUsers: number;
  usersByRole: Record<string, number>;
  pendingOrders: number;
  ordersByStatus: Record<string, number>;
  revenueByMonth: { label: string; value: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    customer: { firstName: string; lastName: string; email: string } | null;
  }[];
}

const QUICK_ACTIONS = [
  { href: '/admin/seller-applications', label: 'View Pending Seller Applications', icon: '📋' },
  { href: '/admin/coupons', label: 'Manage Coupons', icon: '🏷️' },
  { href: '/admin/settings', label: 'Platform Settings', icon: '⚙️' },
  { href: '/admin/homepage', label: 'Manage Homepage', icon: '🏠' },
];

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(false);
    adminApi
      .getOverview()
      .then(setOverview)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 text-lg mb-4">Failed to load dashboard data</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  type RecentOrder = {
    id: string;
    orderNumber: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    customer: { firstName: string; lastName: string; email: string } | null;
  };

  const recentOrderColumns = [
    { key: 'orderNumber', header: 'Order #' },
    {
      key: 'status',
      header: 'Status',
      render: (row: RecentOrder) => <StatusBadge status={row.status} />,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row: RecentOrder) =>
        row.customer
          ? `${row.customer.firstName} ${row.customer.lastName}`.trim() || row.customer.email
          : '—',
    },
    {
      key: 'totalPrice',
      header: 'Total',
      render: (row: RecentOrder) => `$${(row.totalPrice ?? 0).toFixed(2)}`,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row: RecentOrder) =>
        new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Dashboard" />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Revenue"
          value={`$${(overview?.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="💰"
        />
        <StatsCard
          label="Orders (Last 30 Days)"
          value={String(overview?.totalOrdersLast30Days ?? 0)}
          icon="📦"
        />
        <StatsCard
          label="Total Users"
          value={String(overview?.totalUsers ?? 0)}
          icon="👥"
        />
        <StatsCard
          label="Pending Orders"
          value={String(overview?.pendingOrders ?? 0)}
          icon="⏳"
        />
      </div>

      {/* Revenue chart */}
      {overview?.revenueByMonth && overview.revenueByMonth.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-base font-semibold text-neutral-800 mb-4">Revenue by Month</h2>
          <SimpleBarChart data={overview.revenueByMonth} height={180} color="indigo" />
        </div>
      )}

      {/* Orders by status */}
      {overview?.ordersByStatus && Object.keys(overview.ordersByStatus).length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-base font-semibold text-neutral-800 mb-4">Orders by Status</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(overview.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <StatusBadge status={status} />
                <span className="text-sm text-neutral-600 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders table */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-base font-semibold text-neutral-800 mb-4">Recent Orders</h2>
        <DataTable<RecentOrder>
          columns={recentOrderColumns}
          data={overview?.recentOrders ?? []}
          loading={loading}
          emptyMessage="No recent orders"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-base font-semibold text-neutral-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium text-neutral-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

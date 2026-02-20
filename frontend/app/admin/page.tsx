'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatsCard from '../../components/admin/StatsCard';
import SimpleBarChart from '../../components/admin/SimpleBarChart';
import StatusBadge from '../../components/admin/StatusBadge';
import DataTable from '../../components/admin/DataTable';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';

interface OverviewData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  revenueByMonth: { label: string; value: number }[];
  ordersByStatus: Record<string, number>;
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    totalPrice: number;
    createdAt: string;
  }[];
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    adminApi
      .getOverview()
      .then(setOverview)
      .catch(() => toast('error', 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  type RecentOrder = {
    id: string;
    orderNumber: string;
    status: string;
    totalPrice: number;
    createdAt: string;
  };

  const recentOrderColumns = [
    { key: 'orderNumber', header: 'Order #' },
    {
      key: 'status',
      header: 'Status',
      render: (row: RecentOrder) => <StatusBadge status={row.status} />,
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
          value={String(overview?.totalOrders ?? 0)}
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
    </div>
  );
}

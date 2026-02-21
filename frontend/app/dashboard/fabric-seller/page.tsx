'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireRole } from '../../../lib/with-role';
import { ordersApi, fabricsApi } from '../../../lib/api';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { StatsCard } from '../../../components/dashboard/StatsCard';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import type { Order, Fabric } from '../../../types';

const SIDEBAR_ITEMS = [
  { href: '/dashboard/fabric-seller', label: 'Overview', icon: '📊' },
  { href: '/dashboard/fabric-seller/fabrics', label: 'My Fabrics', icon: '🧵' },
  { href: '/dashboard/fabric-seller/orders', label: 'Orders', icon: '📦' },
];

const STATUS_VARIANTS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  PENDING_PAYMENT: 'warning',
  PAID: 'info',
  IN_PRODUCTION: 'info',
  SHIPPED_TO_QA: 'info',
  QA_APPROVED: 'success',
  QA_REJECTED: 'danger',
  SHIPPED_TO_CUSTOMER: 'success',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

export default function FabricSellerDashboardPage() {
  const { user, isLoading } = useRequireRole(['fabric_seller']);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersApi.getMyOrders().catch(() => [] as Order[]),
      fabricsApi.list().catch(() => ({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 })),
    ]).then(([o, f]) => {
      setOrders(o);
      setFabrics((f as { items: Fabric[] }).items);
    }).finally(() => setLoading(false));
  }, []);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  const lowStockFabrics = fabrics.filter((f) => f.stock < 10);
  const pendingOrders = orders.filter((o) => o.status === 'PAID');
  const earnings = orders
    .filter((o) => ['DELIVERED', 'SHIPPED_TO_CUSTOMER'].includes(o.status))
    .reduce((sum, o) => sum + (o.fabricPrice || 0), 0);

  return (
    <DashboardLayout sidebarItems={SIDEBAR_ITEMS} userRole={user.role} title="Fabric Seller Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Fabrics" value={fabrics.length} icon="🧵" />
        <StatsCard label="Low Stock Alerts" value={lowStockFabrics.length} icon="⚠️" />
        <StatsCard label="Pending Orders" value={pendingOrders.length} icon="📦" />
        <StatsCard label="Earnings" value={`$${earnings.toFixed(2)}`} icon="💰" />
      </div>

      {/* Quick links */}
      <div className="flex gap-3 mb-8">
        <Link href="/dashboard/fabric-seller/fabrics">
          <Button variant="outline" size="sm">Manage Fabrics</Button>
        </Link>
        <Link href="/dashboard/fabric-seller/orders">
          <Button variant="outline" size="sm">View All Orders</Button>
        </Link>
      </div>

      {/* Low stock alerts */}
      {lowStockFabrics.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Low Stock Alerts ({lowStockFabrics.length})</h3>
          <div className="flex flex-wrap gap-2">
            {lowStockFabrics.map((f) => (
              <Badge key={f.id} variant="warning">{f.name} ({f.stock} left)</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Inventory table */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Inventory Overview</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : fabrics.length === 0 ? (
          <div className="text-center py-10 text-neutral-500">No fabrics in inventory.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-100 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Material</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {fabrics.map((fabric) => (
                  <tr key={fabric.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{fabric.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{fabric.material}</td>
                    <td className="px-4 py-3">${fabric.customerPrice}</td>
                    <td className="px-4 py-3">
                      <Badge variant={fabric.stock === 0 ? 'danger' : fabric.stock < 10 ? 'warning' : 'success'}>
                        {fabric.stock} in stock
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={fabric.isActive ? 'success' : 'default'}>
                        {fabric.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incoming orders */}
      {pendingOrders.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 mt-6">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h2 className="text-lg font-semibold text-neutral-900">Incoming Orders</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {pendingOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">#{order.orderNumber}</p>
                  <p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge variant={STATUS_VARIANTS[order.status] || 'default'}>
                  {order.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

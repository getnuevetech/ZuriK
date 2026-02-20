'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireRole } from '../../../lib/with-role';
import { ordersApi, productsApi } from '../../../lib/api';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { StatsCard } from '../../../components/dashboard/StatsCard';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { StatusTransitionButton } from '../../../components/dashboard/StatusTransitionButton';
import type { Order, Product, OrderStatus } from '../../../types';

const SIDEBAR_ITEMS = [
  { href: '/dashboard/designer', label: 'Overview', icon: '📊' },
  { href: '/dashboard/designer/products', label: 'My Products', icon: '👗' },
  { href: '/dashboard/designer/orders', label: 'Orders', icon: '📦' },
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

export default function DesignerDashboardPage() {
  const { user, isLoading } = useRequireRole(['designer']);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([
      ordersApi.getMyOrders().catch(() => [] as Order[]),
      productsApi.list().catch(() => [] as Product[]),
    ]).then(([o, p]) => {
      setOrders(o);
      setProducts(p);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  const pendingOrders = orders.filter((o) => o.status === 'PAID');
  const inProgressOrders = orders.filter((o) => o.status === 'IN_PRODUCTION');
  const completedOrders = orders.filter((o) => ['DELIVERED', 'SHIPPED_TO_CUSTOMER'].includes(o.status));
  const earnings = completedOrders.reduce((sum, o) => sum + (o.designPrice || 0), 0);

  return (
    <DashboardLayout sidebarItems={SIDEBAR_ITEMS} userRole={user.role} title="Designer Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="My Products" value={products.length} icon="👗" />
        <StatsCard label="Pending Orders" value={pendingOrders.length} icon="⏳" />
        <StatsCard label="In Production" value={inProgressOrders.length} icon="⚙️" />
        <StatsCard label="Earnings" value={`$${earnings.toFixed(2)}`} icon="💰" />
      </div>

      {/* Quick links */}
      <div className="flex gap-3 mb-8">
        <Link href="/dashboard/designer/products">
          <Button variant="outline" size="sm">Manage Products</Button>
        </Link>
        <Link href="/dashboard/designer/orders">
          <Button variant="outline" size="sm">View All Orders</Button>
        </Link>
      </div>

      {/* Incoming orders */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Incoming Orders</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : pendingOrders.length === 0 ? (
          <div className="text-center py-10 text-neutral-500">No new incoming orders.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-100 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">#{order.orderNumber}</td>
                    <td className="px-4 py-3">{order.orderType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[order.status] || 'default'}>
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <StatusTransitionButton
                          orderId={order.id}
                          targetStatus="IN_PRODUCTION"
                          label="Accept"
                          variant="primary"
                          onSuccess={(s) => handleStatusUpdate(order.id, s)}
                        />
                        <StatusTransitionButton
                          orderId={order.id}
                          targetStatus="CANCELLED"
                          label="Reject"
                          variant="danger"
                          onSuccess={(s) => handleStatusUpdate(order.id, s)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRequireRole } from '../../../../lib/with-role';
import { ordersApi } from '../../../../lib/api';
import { Spinner } from '../../../../components/ui/Spinner';
import { Badge } from '../../../../components/ui/Badge';
import { Select } from '../../../../components/ui/Select';
import { DashboardLayout } from '../../../../components/dashboard/DashboardLayout';
import { StatusTransitionButton } from '../../../../components/dashboard/StatusTransitionButton';
import type { Order, OrderStatus } from '../../../../types';

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

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PAID', label: 'Paid' },
  { value: 'IN_PRODUCTION', label: 'In Production' },
  { value: 'SHIPPED_TO_QA', label: 'Shipped to QA' },
  { value: 'QA_REJECTED', label: 'QA Rejected' },
  { value: 'SHIPPED_TO_CUSTOMER', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function DesignerOrdersPage() {
  const { user, isLoading } = useRequireRole(['designer']);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    ordersApi.getMyOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  const filtered = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;

  return (
    <DashboardLayout sidebarItems={SIDEBAR_ITEMS} userRole={user.role} title="Order Management">
      <div className="flex gap-4 mb-4">
        <div className="w-56">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-100 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">#{order.orderNumber}</td>
                    <td className="px-4 py-3 text-neutral-600">{order.orderType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[order.status] || 'default'}>
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">${order.totalPrice?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {order.status === 'PAID' && (
                          <>
                            <StatusTransitionButton
                              orderId={order.id}
                              targetStatus="IN_PRODUCTION"
                              label="Start Production"
                              onSuccess={(s) => handleStatusUpdate(order.id, s)}
                            />
                            <StatusTransitionButton
                              orderId={order.id}
                              targetStatus="CANCELLED"
                              label="Reject"
                              variant="danger"
                              onSuccess={(s) => handleStatusUpdate(order.id, s)}
                            />
                          </>
                        )}
                        {order.status === 'IN_PRODUCTION' && (
                          <StatusTransitionButton
                            orderId={order.id}
                            targetStatus="SHIPPED_TO_QA"
                            label="Ship to QA"
                            variant="secondary"
                            onSuccess={(s) => handleStatusUpdate(order.id, s)}
                          />
                        )}
                        {order.status === 'QA_REJECTED' && (
                          <StatusTransitionButton
                            orderId={order.id}
                            targetStatus="IN_PRODUCTION"
                            label="Restart Production"
                            onSuccess={(s) => handleStatusUpdate(order.id, s)}
                          />
                        )}
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

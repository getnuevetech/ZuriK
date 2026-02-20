'use client';

import React, { useEffect, useState } from 'react';
import { useRequireRole } from '../../../../lib/with-role';
import { ordersApi } from '../../../../lib/api';
import { useToast } from '../../../../components/ui/Toast';
import { Spinner } from '../../../../components/ui/Spinner';
import { Badge } from '../../../../components/ui/Badge';
import { Select } from '../../../../components/ui/Select';
import { Input } from '../../../../components/ui/Input';
import { DashboardLayout } from '../../../../components/dashboard/DashboardLayout';
import { StatusTransitionButton } from '../../../../components/dashboard/StatusTransitionButton';
import type { Order, OrderStatus } from '../../../../types';

const SIDEBAR_ITEMS = [
  { href: '/dashboard/admin', label: 'Overview', icon: '📊' },
  { href: '/dashboard/admin/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/admin/orders', label: 'All Orders', icon: '📦' },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: '📈' },
];

const STATUS_VARIANTS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  PENDING_PAYMENT: 'warning',
  PAID: 'info',
  IN_PRODUCTION: 'info',
  SHIPPED_TO_QA: 'info',
  QA_INSPECTION: 'info',
  QA_APPROVED: 'success',
  QA_REJECTED: 'danger',
  SHIPPED_TO_CUSTOMER: 'success',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'PAID', label: 'Paid' },
  { value: 'IN_PRODUCTION', label: 'In Production' },
  { value: 'SHIPPED_TO_QA', label: 'Shipped to QA' },
  { value: 'QA_APPROVED', label: 'QA Approved' },
  { value: 'QA_REJECTED', label: 'QA Rejected' },
  { value: 'SHIPPED_TO_CUSTOMER', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const ORDER_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'CUSTOM_DESIGN', label: 'Custom Design' },
  { value: 'READY_TO_WEAR', label: 'Ready-to-Wear' },
  { value: 'FABRIC_ONLY', label: 'Fabric Only' },
];

const ALL_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT', 'PAID', 'IN_PRODUCTION', 'SHIPPED_TO_QA',
  'QA_INSPECTION', 'QA_APPROVED', 'QA_REJECTED', 'SHIPPED_TO_CUSTOMER',
  'DELIVERED', 'CANCELLED',
];

export default function AdminOrdersPage() {
  const { user, isLoading } = useRequireRole(['admin']);
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [overrideOrder, setOverrideOrder] = useState<Order | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<OrderStatus>('PAID');
  const [overriding, setOverriding] = useState(false);

  useEffect(() => {
    ordersApi.listAll(statusFilter ? { status: statusFilter } : undefined)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const handleOverride = async () => {
    if (!overrideOrder) return;
    setOverriding(true);
    try {
      await ordersApi.updateStatus(overrideOrder.id, overrideStatus);
      handleStatusUpdate(overrideOrder.id, overrideStatus);
      setOverrideOrder(null);
      toast('success', 'Order status overridden');
    } catch {
      toast('error', 'Failed to override status');
    } finally {
      setOverriding(false);
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  const filtered = orders.filter((o) => {
    if (typeFilter && o.orderType !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.orderNumber.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <DashboardLayout sidebarItems={SIDEBAR_ITEMS} userRole={user.role} title="All Orders">
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div className="flex-1 min-w-40">
          <Input placeholder="Search order number…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-48">
          <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="Filter by status" />
        </div>
        <div className="w-48">
          <Select options={ORDER_TYPE_OPTIONS} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} placeholder="Filter by type" />
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Override</th>
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
                      <button
                        className="text-xs text-primary-600 hover:underline"
                        onClick={() => { setOverrideOrder(order); setOverrideStatus(order.status as OrderStatus); }}
                      >
                        Override Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Override modal (inline) */}
      {overrideOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Override Status</h3>
            <p className="text-sm text-neutral-600 mb-4">Order #{overrideOrder.orderNumber}</p>
            <Select
              label="New Status"
              options={ALL_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))}
              value={overrideStatus}
              onChange={(e) => setOverrideStatus(e.target.value as OrderStatus)}
            />
            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
                onClick={handleOverride}
                disabled={overriding}
              >
                {overriding ? 'Saving…' : 'Apply Override'}
              </button>
              <button
                className="flex-1 border border-neutral-300 py-2 rounded-lg text-sm font-medium hover:bg-neutral-50"
                onClick={() => setOverrideOrder(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

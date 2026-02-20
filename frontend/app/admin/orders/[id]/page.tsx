'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import StatusBadge from '../../../../components/admin/StatusBadge';
import ConfirmDialog from '../../../../components/admin/ConfirmDialog';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { Select } from '../../../../components/ui/Select';
import { useToast } from '../../../../components/ui/Toast';
import { Order, OrderStatus } from '../../../../types';

const ALL_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'PAID', label: 'Paid' },
  { value: 'IN_PRODUCTION', label: 'In Production' },
  { value: 'SHIPPED_TO_QA', label: 'Shipped to QA' },
  { value: 'QA_INSPECTION', label: 'QA Inspection' },
  { value: 'QA_APPROVED', label: 'QA Approved' },
  { value: 'QA_REJECTED', label: 'QA Rejected' },
  { value: 'SHIPPED_TO_CUSTOMER', label: 'Shipped to Customer' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

interface OrderDetail extends Order {
  customer?: { firstName?: string; lastName?: string; email?: string };
  subtotal?: number;
  platformFee?: number;
  tax?: number;
}

function formatOrderType(orderType: string): string {
  return orderType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    adminApi
      .getOrder(id)
      .then((data: OrderDetail) => {
        setOrder(data);
        setSelectedStatus(data.status);
      })
      .catch(() => toast('error', 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusSave = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await adminApi.updateOrderStatus(order.id, selectedStatus);
      setOrder((prev: OrderDetail | null) => prev ? { ...prev, status: selectedStatus as OrderStatus } : prev);
      toast('success', 'Order status updated');
      setStatusModalOpen(false);
    } catch {
      toast('error', 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await adminApi.refundOrder(order.id);
      toast('success', 'Refund initiated');
      setRefundDialogOpen(false);
    } catch {
      toast('error', 'Failed to initiate refund');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!order) {
    return <p className="text-neutral-500">Order not found.</p>;
  }

  const customerName = order.customer
    ? [order.customer.firstName, order.customer.lastName].filter(Boolean).join(' ') ||
      order.customer.email
    : '—';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Order Detail"
        breadcrumbs={[
          { label: 'Orders', href: '/admin/orders' },
          { label: order.orderNumber },
        ]}
      />

      {/* Order info card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">#{order.orderNumber}</h2>
            <p className="text-sm text-neutral-500 capitalize">
              {formatOrderType(order.orderType)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wide">Customer</p>
            <p className="text-sm font-medium text-neutral-800">{customerName}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wide">Created</p>
            <p className="text-sm font-medium text-neutral-800">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wide">Updated</p>
            <p className="text-sm font-medium text-neutral-800">
              {new Date(order.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wide">Quantity</p>
            <p className="text-sm font-medium text-neutral-800">{order.quantity ?? 1}</p>
          </div>
        </div>
      </div>

      {/* Pricing breakdown */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-base font-semibold text-neutral-800 mb-4">Pricing</h3>
        <div className="space-y-2 max-w-xs">
          {order.designPrice != null && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Design</span>
              <span>${order.designPrice.toFixed(2)}</span>
            </div>
          )}
          {order.fabricPrice != null && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Fabric</span>
              <span>${order.fabricPrice.toFixed(2)}</span>
            </div>
          )}
          {order.subtotal != null && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
          )}
          {order.platformFee != null && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Platform Fee</span>
              <span>${order.platformFee.toFixed(2)}</span>
            </div>
          )}
          {order.tax != null && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold border-t border-neutral-200 pt-2">
            <span>Total</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(true)}>
          Override Status
        </Button>
        <Button variant="danger" size="sm" onClick={() => setRefundDialogOpen(true)}>
          Refund Order
        </Button>
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/orders')}>
          ← Back to Orders
        </Button>
      </div>

      {/* Status override modal */}
      <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Override Order Status">
        <div className="space-y-4">
          <Select
            label="New Status"
            options={ALL_STATUSES}
            value={selectedStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
            placeholder="Select status"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleStatusSave}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Refund confirm dialog */}
      <ConfirmDialog
        isOpen={refundDialogOpen}
        onClose={() => setRefundDialogOpen(false)}
        onConfirm={handleRefund}
        title="Refund Order"
        message={`Are you sure you want to refund order #${order.orderNumber}? This action cannot be undone.`}
        confirmLabel="Refund"
        variant="danger"
      />
    </div>
  );
}

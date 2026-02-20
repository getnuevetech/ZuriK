'use client';

import React, { useEffect, useState } from 'react';
import { useRequireRole } from '../../../lib/with-role';
import { ordersApi } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { StatusTransitionButton } from '../../../components/dashboard/StatusTransitionButton';
import type { Order, OrderStatus } from '../../../types';

const SIDEBAR_ITEMS = [
  { href: '/dashboard/qa', label: 'Inspection Queue', icon: '🔍' },
];

export default function QADashboardPage() {
  const { user, isLoading } = useRequireRole(['qa']);
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notes, setNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    ordersApi.getMyOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const openApprove = (order: Order) => {
    setSelectedOrder(order);
    setNotes('');
    setTrackingNumber('');
    setModalAction('approve');
    setModalOpen(true);
  };

  const openReject = (order: Order) => {
    setSelectedOrder(order);
    setNotes('');
    setModalAction('reject');
    setModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedOrder || !modalAction) return;
    try {
      if (modalAction === 'approve') {
        await ordersApi.updateStatus(selectedOrder.id, 'QA_APPROVED', notes || undefined);
        handleStatusUpdate(selectedOrder.id, 'QA_APPROVED');
        toast('success', 'Order approved and ready to ship');
      } else {
        if (!notes.trim()) {
          toast('error', 'Please provide rejection notes');
          return;
        }
        await ordersApi.updateStatus(selectedOrder.id, 'QA_REJECTED', notes);
        handleStatusUpdate(selectedOrder.id, 'QA_REJECTED');
        toast('success', 'Order rejected and returned to designer');
      }
      setModalOpen(false);
    } catch {
      toast('error', 'Failed to update order status');
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  const inspectionQueue = orders.filter((o) => ['SHIPPED_TO_QA', 'QA_INSPECTION'].includes(o.status));
  const completed = orders.filter((o) => ['QA_APPROVED', 'QA_REJECTED', 'SHIPPED_TO_CUSTOMER', 'DELIVERED'].includes(o.status));
  const passCount = completed.filter((o) => ['QA_APPROVED', 'SHIPPED_TO_CUSTOMER', 'DELIVERED'].includes(o.status)).length;
  const failCount = completed.filter((o) => o.status === 'QA_REJECTED').length;

  return (
    <DashboardLayout sidebarItems={SIDEBAR_ITEMS} userRole={user.role} title="QA Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500">In Queue</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{inspectionQueue.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500">Passed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{passCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{failCount}</p>
        </div>
      </div>

      {/* Inspection Queue */}
      <div className="bg-white rounded-xl border border-neutral-200 mb-6">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Inspection Queue</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : inspectionQueue.length === 0 ? (
          <div className="text-center py-10 text-neutral-500">No orders in inspection queue.</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {inspectionQueue.map((order) => (
              <div key={order.id} className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-neutral-900">#{order.orderNumber}</p>
                      <Badge variant="info">{order.status.replace(/_/g, ' ')}</Badge>
                    </div>
                    <p className="text-sm text-neutral-600">Type: {order.orderType.replace(/_/g, ' ')}</p>
                    {order.design && <p className="text-sm text-neutral-600">Product: {order.design.name}</p>}
                    {order.customerNotes && (
                      <p className="text-sm text-neutral-500 mt-1">Notes: {order.customerNotes}</p>
                    )}
                    {order.chest && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Measurements: Chest {order.chest}, Waist {order.waist}, Hips {order.hips}
                      </p>
                    )}
                    <p className="text-xs text-neutral-400 mt-1">
                      Received: {new Date(order.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="primary" size="sm" onClick={() => openApprove(order)}>
                      ✓ Approve
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => openReject(order)}>
                      ✕ Reject
                    </Button>
                    {order.status === 'QA_APPROVED' && (
                      <StatusTransitionButton
                        orderId={order.id}
                        targetStatus="SHIPPED_TO_CUSTOMER"
                        label="Ship to Customer"
                        variant="secondary"
                        onSuccess={(s) => handleStatusUpdate(order.id, s)}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Inspections */}
      {completed.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h2 className="text-lg font-semibold text-neutral-900">Completed Inspections</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-100 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Result</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {completed.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">#{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <Badge variant={order.status === 'QA_REJECTED' ? 'danger' : 'success'}>
                        {order.status === 'QA_REJECTED' ? 'Rejected' : 'Passed'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{new Date(order.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalAction === 'approve' ? 'Approve Order' : 'Reject Order'}
      >
        <div className="space-y-4">
          {selectedOrder && (
            <p className="text-sm text-neutral-600">Order #{selectedOrder.orderNumber}</p>
          )}
          {modalAction === 'approve' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tracking Number (optional)</label>
              <input
                type="text"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              {modalAction === 'approve' ? 'Inspection Notes (optional)' : 'Rejection Notes (required)'}
            </label>
            <textarea
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder={modalAction === 'approve' ? 'Add inspection notes...' : 'Describe the reason for rejection...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant={modalAction === 'approve' ? 'primary' : 'danger'}
              className="flex-1"
              onClick={handleConfirmAction}
            >
              {modalAction === 'approve' ? '✓ Confirm Approval' : '✕ Confirm Rejection'}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

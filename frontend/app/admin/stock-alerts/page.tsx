'use client';

import React, { useState } from 'react';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/ui/Toast';
import api from '../../../lib/api';

const PRODUCT_TYPES = [
  { value: 'ready-to-wear', label: 'Ready-to-Wear' },
  { value: 'fabric', label: 'Fabric' },
];

export default function AdminStockAlertsPage() {
  const [productId, setProductId] = useState('');
  const [productType, setProductType] = useState('ready-to-wear');
  const [productName, setProductName] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!productId.trim() || !productName.trim()) {
      toast('error', 'Product ID and product name are required');
      return;
    }
    setSending(true);
    try {
      await api.post(`/stock-alerts/admin/${productId}/notify`, {
        productType,
        productName,
      });
      toast('success', 'Back-in-stock notifications sent successfully');
      setProductId('');
      setProductName('');
    } catch {
      toast('error', 'Failed to send stock alert notifications');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Stock Alerts" />

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-3">
        <span className="text-blue-500 text-xl mt-0.5">ℹ️</span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-800">How Stock Alerts Work</p>
          <p className="text-sm text-blue-700">
            Stock alerts are automatically managed by the system. When a customer attempts to view or purchase
            an out-of-stock product, they can subscribe to receive a notification when it becomes available again.
            This page allows you to manually trigger back-in-stock notification emails for a specific product.
          </p>
        </div>
      </div>

      {/* Manual trigger form */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-neutral-800">Manually Trigger Back-in-Stock Notifications</h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Product ID *</label>
            <input
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              placeholder="Enter product UUID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Product Type *</label>
            <select
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
            >
              {PRODUCT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Product Name *</label>
            <input
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              placeholder="e.g. Ankara Print Dress"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {sending ? (
              <>
                <Spinner />
                <span>Sending…</span>
              </>
            ) : (
              'Send Notifications'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

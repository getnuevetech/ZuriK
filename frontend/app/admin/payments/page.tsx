'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../../lib/api';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import DataTable from '../../../components/admin/DataTable';
import StatusBadge from '../../../components/admin/StatusBadge';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useToast } from '../../../components/ui/Toast';

interface Gateway {
  id: string;
  name: string;
  provider: string;
  isActive: boolean;
  credentials?: Record<string, unknown>;
}

const PROVIDER_OPTIONS = [
  { value: 'STRIPE', label: 'Stripe' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'FLUTTERWAVE', label: 'Flutterwave' },
  { value: 'PAYSTACK', label: 'Paystack' },
];

const DEFAULT_FORM = { name: '', provider: 'STRIPE', publicKey: '', secretKey: '' };

export default function AdminPaymentsPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGateway, setEditGateway] = useState<Gateway | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchGateways = useCallback(() => {
    setLoading(true);
    adminApi
      .getGateways()
      .then((data: Gateway[] | { data: Gateway[] }) =>
        setGateways(Array.isArray(data) ? data : data.data ?? [])
      )
      .catch(() => toast('error', 'Failed to load gateways'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  const openAdd = () => {
    setEditGateway(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  };

  const openEdit = (gw: Gateway) => {
    setEditGateway(gw);
    setForm({
      name: gw.name,
      provider: gw.provider,
      publicKey: (gw.credentials?.publicKey as string) ?? '',
      secretKey: (gw.credentials?.secretKey as string) ?? '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      provider: form.provider,
      credentials: { publicKey: form.publicKey, secretKey: form.secretKey },
    };
    try {
      if (editGateway) {
        await adminApi.updateGateway(editGateway.id, payload);
        toast('success', 'Gateway updated');
      } else {
        await adminApi.createGateway(payload);
        toast('success', 'Gateway created');
      }
      setModalOpen(false);
      fetchGateways();
    } catch {
      toast('error', 'Failed to save gateway');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (gw: Gateway) => {
    try {
      await adminApi.updateGateway(gw.id, { isActive: !gw.isActive });
      toast('success', `Gateway ${gw.isActive ? 'disabled' : 'enabled'}`);
      fetchGateways();
    } catch {
      toast('error', 'Failed to update gateway');
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'provider', header: 'Provider' },
    {
      key: 'isActive',
      header: 'Active',
      render: (row: Gateway) => (
        <StatusBadge status={row.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Gateway) => (
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-2 py-1 rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
            onClick={() => openEdit(row)}
          >
            Edit
          </button>
          <button
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              row.isActive
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            }`}
            onClick={() => handleToggleActive(row)}
          >
            {row.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payment Management"
        actions={
          <Button variant="primary" size="sm" onClick={openAdd}>
            Add Gateway
          </Button>
        }
      />

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={gateways}
            loading={false}
            emptyMessage="No payment gateways configured"
          />
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editGateway ? 'Edit Gateway' : 'Add Gateway'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            type="text"
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f: typeof DEFAULT_FORM) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Stripe Production"
            required
          />
          <Select
            label="Provider"
            options={PROVIDER_OPTIONS}
            value={form.provider}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm((f: typeof DEFAULT_FORM) => ({ ...f, provider: e.target.value }))}
          />
          <Input
            label="Public Key"
            type="text"
            value={form.publicKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f: typeof DEFAULT_FORM) => ({ ...f, publicKey: e.target.value }))}
            placeholder="pk_..."
          />
          <Input
            label="Secret Key"
            type="password"
            value={form.secretKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f: typeof DEFAULT_FORM) => ({ ...f, secretKey: e.target.value }))}
            placeholder="sk_..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
              {editGateway ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

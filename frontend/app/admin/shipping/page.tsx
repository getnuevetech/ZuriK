'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { shippingApi, type ShippingMethod } from '../../../lib/api';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import DataTable from '../../../components/admin/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/ui/Toast';
import { Input } from '../../../components/ui/Input';
import { Card, CardBody } from '../../../components/ui/Card';
import { useCurrency } from '../../../lib/currency-context';

interface MethodFormState {
  name: string;
  description: string;
  basePrice: string;
  freeShippingThreshold: string;
  estimatedMinDays: string;
  estimatedMaxDays: string;
  supportedCountries: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: MethodFormState = {
  name: '',
  description: '',
  basePrice: '',
  freeShippingThreshold: '',
  estimatedMinDays: '3',
  estimatedMaxDays: '7',
  supportedCountries: '',
  sortOrder: '0',
  isActive: true,
};

export default function AdminShippingPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMethod, setEditMethod] = useState<ShippingMethod | null>(null);
  const [form, setForm] = useState<MethodFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { formatPrice, currencySymbol } = useCurrency();

  const fetchMethods = useCallback(() => {
    setLoading(true);
    shippingApi
      .listMethods()
      .then((data) => setMethods(data))
      .catch(() => toast('error', 'Failed to load shipping methods'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const openCreate = () => {
    setEditMethod(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (method: ShippingMethod) => {
    setEditMethod(method);
    setForm({
      name: method.name,
      description: method.description ?? '',
      basePrice: String(method.basePrice),
      freeShippingThreshold: method.freeShippingThreshold != null ? String(method.freeShippingThreshold) : '',
      estimatedMinDays: String(method.estimatedMinDays),
      estimatedMaxDays: String(method.estimatedMaxDays),
      supportedCountries: method.supportedCountries ? method.supportedCountries.join(', ') : '',
      sortOrder: String(method.sortOrder),
      isActive: method.isActive,
    });
    setShowForm(true);
  };

  const handleDeactivate = async (method: ShippingMethod) => {
    try {
      await shippingApi.deleteMethod(method.id);
      toast('success', `"${method.name}" deactivated`);
      fetchMethods();
    } catch {
      toast('error', 'Failed to deactivate method');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: Partial<ShippingMethod> = {
      name: form.name,
      description: form.description || null,
      basePrice: Number(form.basePrice),
      freeShippingThreshold: form.freeShippingThreshold ? Number(form.freeShippingThreshold) : null,
      estimatedMinDays: Number(form.estimatedMinDays),
      estimatedMaxDays: Number(form.estimatedMaxDays),
      supportedCountries: form.supportedCountries ? form.supportedCountries.split(',').map((s) => s.trim()).filter(Boolean) : null,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    };
    try {
      if (editMethod) {
        await shippingApi.updateMethod(editMethod.id, payload);
        toast('success', 'Shipping method updated');
      } else {
        await shippingApi.createMethod(payload);
        toast('success', 'Shipping method created');
      }
      setShowForm(false);
      fetchMethods();
    } catch {
      toast('error', 'Failed to save shipping method');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (row: ShippingMethod) => <span className="font-medium">{row.name}</span> },
    { key: 'basePrice', header: 'Price', render: (row: ShippingMethod) => formatPrice(Number(row.basePrice)) },
    { key: 'freeShippingThreshold', header: 'Free Threshold', render: (row: ShippingMethod) => row.freeShippingThreshold ? formatPrice(Number(row.freeShippingThreshold)) : '—' },
    { key: 'days', header: 'Est. Days', render: (row: ShippingMethod) => `${row.estimatedMinDays}–${row.estimatedMaxDays} days` },
    { key: 'countries', header: 'Countries', render: (row: ShippingMethod) => row.supportedCountries?.join(', ') || 'All' },
    { key: 'sortOrder', header: 'Sort', render: (row: ShippingMethod) => row.sortOrder },
    {
      key: 'isActive', header: 'Status',
      render: (row: ShippingMethod) => (
        <Badge variant={row.isActive ? 'success' : 'secondary'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions', header: 'Actions',
      render: (row: ShippingMethod) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>Edit</Button>
          {row.isActive && (
            <Button size="sm" variant="ghost" onClick={() => handleDeactivate(row)} className="text-red-600 hover:text-red-700">Deactivate</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Shipping Methods"
        actions={<Button onClick={openCreate}>+ Create Method</Button>}
      />

      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <h3 className="font-semibold text-neutral-800 mb-4">{editMethod ? 'Edit Shipping Method' : 'New Shipping Method'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                <Input label={`Base Price (${currencySymbol}) *`} type="number" min="0" step="0.01" value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))} required />
                <Input label={`Free Shipping Threshold (${currencySymbol})`} type="number" min="0" step="0.01" value={form.freeShippingThreshold} onChange={(e) => setForm((f) => ({ ...f, freeShippingThreshold: e.target.value }))} placeholder="Leave blank for none" />
                <Input label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                <Input label="Min Days *" type="number" min="0" value={form.estimatedMinDays} onChange={(e) => setForm((f) => ({ ...f, estimatedMinDays: e.target.value }))} required />
                <Input label="Max Days *" type="number" min="0" value={form.estimatedMaxDays} onChange={(e) => setForm((f) => ({ ...f, estimatedMaxDays: e.target.value }))} required />
                <Input label="Supported Countries (comma-separated)" value={form.supportedCountries} onChange={(e) => setForm((f) => ({ ...f, supportedCountries: e.target.value }))} placeholder="NG, GH, KE (blank = all)" />
                <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-indigo-600" />
                <span className="text-sm font-medium text-neutral-700">Active</span>
              </label>
              <div className="flex gap-3">
                <Button type="submit" loading={saving}>Save</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <DataTable columns={columns} data={methods} emptyMessage="No shipping methods configured yet." />
      )}
    </div>
  );
}

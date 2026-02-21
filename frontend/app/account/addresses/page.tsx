'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { addressesApi, type Address, type CreateAddressPayload } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';

const EMPTY_FORM: CreateAddressPayload = {
  label: 'Home',
  firstName: '',
  lastName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  isDefault: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form, setForm] = useState<CreateAddressPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push('/login?redirect=/account/addresses'); return; }
    fetchAddresses();
  }, [isAuthenticated, authLoading]);

  async function fetchAddresses() {
    setLoading(true);
    try {
      const data = await addressesApi.getAll();
      setAddresses(data);
    } catch {
      toast('error', 'Failed to load addresses.');
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditingAddress(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(addr: Address) {
    setEditingAddress(addr);
    setForm({
      label: addr.label,
      firstName: addr.firstName,
      lastName: addr.lastName,
      phone: addr.phone || '',
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state || '',
      country: addr.country,
      postalCode: addr.postalCode || '',
      isDefault: addr.isDefault,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        phone: form.phone || undefined,
        addressLine2: form.addressLine2 || undefined,
        state: form.state || undefined,
        postalCode: form.postalCode || undefined,
      };
      if (editingAddress) {
        await addressesApi.update(editingAddress.id, payload);
        toast('success', 'Updated: Address updated successfully.');
      } else {
        await addressesApi.create(payload);
        toast('success', 'Created: Address added successfully.');
      }
      setShowForm(false);
      await fetchAddresses();
    } catch (err: any) {
      toast('error', err?.response?.data?.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await addressesApi.delete(id);
      toast('success', 'Deleted: Address deleted.');
      await fetchAddresses();
    } catch {
      toast('error', 'Failed to delete address.');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await addressesApi.setDefault(id);
      await fetchAddresses();
      toast('success', 'Default Updated: Default address updated.');
    } catch {
      toast('error', 'Failed to set default address.');
    }
  }

  if (authLoading || loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Address Book</h1>
        <Button onClick={openNew}>+ Add Address</Button>
      </div>

      {addresses.length === 0 && !showForm ? (
        <Card>
          <CardBody>
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📍</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Addresses Saved</h3>
              <p className="text-neutral-600 mb-4">Add an address to speed up checkout.</p>
              <Button onClick={openNew}>Add Address</Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-neutral-900">{addr.label}</span>
                      {addr.isDefault && <Badge variant="success">Default</Badge>}
                    </div>
                    <p className="text-neutral-700">{addr.firstName} {addr.lastName}</p>
                    {addr.phone && <p className="text-neutral-500 text-sm">{addr.phone}</p>}
                    <p className="text-neutral-700">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-neutral-700">{addr.addressLine2}</p>}
                    <p className="text-neutral-700">{[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}</p>
                    <p className="text-neutral-700">{addr.country}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button onClick={() => openEdit(addr)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Edit</button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      disabled={deletingId === addr.id}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      {deletingId === addr.id ? 'Deleting...' : 'Delete'}
                    </button>
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefault(addr.id)} className="text-neutral-500 hover:text-neutral-700 text-sm">
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingAddress ? 'Edit Address' : 'Add Address'}</h2>
              <button onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-neutral-700 text-xl">×</button>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Label</label>
                    <input
                      value={form.label || ''}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                      placeholder="Home, Office..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                    <input
                      value={form.phone || ''}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">First Name *</label>
                    <input
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name *</label>
                    <input
                      required
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Address Line 1 *</label>
                  <input
                    required
                    value={form.addressLine1}
                    onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Address Line 2</label>
                  <input
                    value={form.addressLine2 || ''}
                    onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">City *</label>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">State/Province</label>
                    <input
                      value={form.state || ''}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Country *</label>
                    <input
                      required
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Postal Code</label>
                    <input
                      value={form.postalCode || ''}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={form.isDefault || false}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="rounded border-neutral-300"
                  />
                  Set as default address
                </label>

                <div className="flex gap-3">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

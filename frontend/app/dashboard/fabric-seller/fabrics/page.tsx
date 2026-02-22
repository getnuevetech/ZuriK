'use client';

import React, { useEffect, useState } from 'react';
import { useRequireRole } from '../../../../lib/with-role';
import { fabricsApi } from '../../../../lib/api';
import { useToast } from '../../../../components/ui/Toast';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { Badge } from '../../../../components/ui/Badge';
import { DashboardLayout } from '../../../../components/dashboard/DashboardLayout';
import { ImageUploader } from '../../../../components/dashboard/ImageUploader';
import type { Fabric } from '../../../../types';

const SIDEBAR_ITEMS = [
  { href: '/dashboard/fabric-seller', label: 'Overview', icon: '📊' },
  { href: '/dashboard/fabric-seller/fabrics', label: 'My Fabrics', icon: '🧵' },
  { href: '/dashboard/fabric-seller/orders', label: 'Orders', icon: '📦' },
];

interface FabricFormData {
  name: string;
  description: string;
  customerPrice: string;
  material: string;
  colors: string;
  patterns: string;
  stock: string;
  imageUrl: string;
}

const EMPTY_FORM: FabricFormData = {
  name: '', description: '', customerPrice: '', material: '',
  colors: '', patterns: '', stock: '0', imageUrl: '',
};

export default function FabricSellerFabricsPage() {
  const { user, isLoading } = useRequireRole(['fabric_seller']);
  const { toast } = useToast();

  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFabric, setEditingFabric] = useState<Fabric | null>(null);
  const [form, setForm] = useState<FabricFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [stockUpdating, setStockUpdating] = useState<string | null>(null);
  const [inlineStock, setInlineStock] = useState<Record<string, string>>({});

  const loadFabrics = () => {
    fabricsApi.list().then((res) => setFabrics(res.items)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadFabrics(); }, []);

  const openCreate = () => {
    setEditingFabric(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (f: Fabric) => {
    setEditingFabric(f);
    setForm({
      name: f.name,
      description: f.description || '',
      customerPrice: String(f.customerPrice),
      material: f.material || '',
      colors: f.colors?.join(', ') || '',
      patterns: f.patterns?.join(', ') || '',
      stock: String(f.stock),
      imageUrl: (f.images && f.images[0]) || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        customerPrice: parseFloat(form.customerPrice),
        material: form.material,
        colors: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
        patterns: form.patterns ? form.patterns.split(',').map(p => p.trim()).filter(Boolean) : [],
        stock: parseInt(form.stock, 10),
        images: form.imageUrl ? [form.imageUrl] : [],
      };
      if (editingFabric) {
        await fabricsApi.update(editingFabric.id, payload);
        toast('success', 'Fabric updated');
      } else {
        await fabricsApi.create(payload);
        toast('success', 'Fabric created');
      }
      setModalOpen(false);
      loadFabrics();
    } catch {
      toast('error', 'Failed to save fabric');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fabric?')) return;
    try {
      await fabricsApi.delete(id);
      toast('success', 'Fabric deleted');
      setFabrics((prev) => prev.filter((f) => f.id !== id));
    } catch {
      toast('error', 'Failed to delete fabric');
    }
  };

  const handleUpdateStock = async (id: string) => {
    const newStock = parseInt(inlineStock[id] || '0', 10);
    setStockUpdating(id);
    try {
      await fabricsApi.updateStock(id, newStock);
      setFabrics((prev) => prev.map((f) => f.id === id ? { ...f, stock: newStock } : f));
      setInlineStock((prev) => { const n = { ...prev }; delete n[id]; return n; });
      toast('success', 'Stock updated');
    } catch {
      toast('error', 'Failed to update stock');
    } finally {
      setStockUpdating(null);
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <DashboardLayout sidebarItems={SIDEBAR_ITEMS} userRole={user.role} title="My Fabrics">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>+ Add New Fabric</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-100 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Material</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {fabrics.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-neutral-500">No fabrics yet.</td>
                  </tr>
                ) : fabrics.map((fabric) => (
                  <tr key={fabric.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{fabric.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{fabric.material}</td>
                    <td className="px-4 py-3">${fabric.customerPrice}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={fabric.stock === 0 ? 'danger' : fabric.stock < 10 ? 'warning' : 'success'}>
                          {fabric.stock}
                        </Badge>
                        <input
                          type="number"
                          min="0"
                          className="w-16 border border-neutral-300 rounded px-2 py-1 text-xs"
                          placeholder="New"
                          value={inlineStock[fabric.id] ?? ''}
                          onChange={(e) => setInlineStock((p) => ({ ...p, [fabric.id]: e.target.value }))}
                        />
                        {inlineStock[fabric.id] !== undefined && (
                          <Button
                            size="sm"
                            variant="outline"
                            loading={stockUpdating === fabric.id}
                            onClick={() => handleUpdateStock(fabric.id)}
                          >
                            Update
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={fabric.isActive ? 'success' : 'default'}>
                        {fabric.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(fabric)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(fabric.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fabric Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFabric ? 'Edit Fabric' : 'Add New Fabric'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Fabric Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Customer Price ($)" type="number" step="0.01" value={form.customerPrice} onChange={(e) => setForm((f) => ({ ...f, customerPrice: e.target.value }))} required />
            <Input label="Stock Quantity" type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Material" value={form.material} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))} placeholder="e.g. Cotton" />
            <Input label="Colors (comma-separated)" value={form.colors} onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))} placeholder="e.g. Blue, Red, White" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Patterns (comma-separated)" value={form.patterns} onChange={(e) => setForm((f) => ({ ...f, patterns: e.target.value }))} placeholder="e.g. Kente, Geometric" />
          </div>
          <ImageUploader
            label="Fabric Image"
            currentImageUrl={form.imageUrl}
            onUpload={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} className="flex-1">Save Fabric</Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

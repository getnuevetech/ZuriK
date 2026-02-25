'use client';

import React, { useEffect, useState } from 'react';
import { useRequireRole } from '../../../../lib/with-role';
import { designsApi } from '../../../../lib/api';
import { useToast } from '../../../../components/ui/Toast';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { Badge } from '../../../../components/ui/Badge';
import { DashboardLayout } from '../../../../components/dashboard/DashboardLayout';
import { ImageUploader } from '../../../../components/dashboard/ImageUploader';
import type { Design } from '../../../../types';

const SIDEBAR_ITEMS = [
  { href: '/dashboard/designer', label: 'Overview', icon: '📊' },
  { href: '/dashboard/designer/designs', label: 'My Designs', icon: '🎨' },
  { href: '/dashboard/designer/ready-to-wear', label: 'My Ready-to-Wear', icon: '👗' },
  { href: '/dashboard/designer/orders', label: 'Orders', icon: '📦' },
];

interface ProductFormData {
  name: string;
  description: string;
  customerPrice: string;
  designerPrice: string;
  category: string;
  imageUrl: string;
}

const EMPTY_FORM: ProductFormData = {
  name: '', description: '', customerPrice: '', designerPrice: '',
  category: '', imageUrl: '',
};

export default function DesignerProductsPage() {
  const { user, isLoading } = useRequireRole(['designer']);
  const { toast } = useToast();

  const [products, setProducts] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Design | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadProducts = () => {
    designsApi.list().then((res) => setProducts(res.items)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (p: Design) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description || '',
      customerPrice: String(p.customerPrice),
      designerPrice: String(p.designerPrice || ''),
      category: p.category || '',
      imageUrl: (p.images && p.images[0]) || '',
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
        designerPrice: parseFloat(form.designerPrice),
        category: form.category,
        images: form.imageUrl ? [form.imageUrl] : [],
      };
      if (editingProduct) {
        await designsApi.update(editingProduct.id, payload);
        toast('success', 'Design updated');
      } else {
        await designsApi.create(payload);
        toast('success', 'Design created');
      }
      setModalOpen(false);
      loadProducts();
    } catch {
      toast('error', 'Failed to save design');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this design?')) return;
    try {
      await designsApi.delete(id);
      toast('success', 'Design deleted');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast('error', 'Failed to delete design');
    }
  };

  const handleToggleActive = async (p: Design) => {
    try {
      const updated = await designsApi.update(p.id, { isActive: !p.isActive });
      setProducts((prev) => prev.map((x) => x.id === updated.id ? updated : x));
    } catch {
      toast('error', 'Failed to update design status');
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <DashboardLayout sidebarItems={SIDEBAR_ITEMS} userRole={user.role} title="My Designs">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>+ Add New Design</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 bg-white rounded-xl border border-neutral-200">
          <p className="mb-4">No designs yet.</p>
          <Button onClick={openCreate} variant="outline">Add Your First Design</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              {p.images && p.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0]} alt={p.name} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-neutral-900 text-sm">{p.name}</h3>
                  <Badge variant={p.isActive ? 'success' : 'default'}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{p.category}</p>
                <p className="text-sm font-medium text-neutral-900 mt-2">${p.customerPrice}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggleActive(p)}>
                    {p.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Design Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Design' : 'Add New Design'}
        size="xl"
      >
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: form fields */}
            <div className="space-y-4">
              <Input label="Design Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
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
                <Input label="Designer Price ($)" type="number" step="0.01" value={form.designerPrice} onChange={(e) => setForm((f) => ({ ...f, designerPrice: e.target.value }))} />
              </div>
              <Input label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Dress" />
            </div>
            {/* Right column: image uploader */}
            <div className="flex flex-col">
              <ImageUploader
                label="Design Image"
                currentImageUrl={form.imageUrl}
                onUpload={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4 mt-4 border-t border-neutral-100">
            <Button type="submit" loading={saving} className="flex-1">Save Design</Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

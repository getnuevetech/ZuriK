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

interface DesignFormData {
  name: string;
  description: string;
  customerPrice: string;
  designerPrice: string;
  category: string;
  imageUrl: string;
}

const EMPTY_FORM: DesignFormData = {
  name: '', description: '', customerPrice: '', designerPrice: '',
  category: '', imageUrl: '',
};

export default function DesignerDesignsPage() {
  const { user, isLoading } = useRequireRole(['designer']);
  const { toast } = useToast();

  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<Design | null>(null);
  const [form, setForm] = useState<DesignFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadDesigns = () => {
    designsApi.list().then((res) => setDesigns(res.items)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadDesigns(); }, []);

  const openCreate = () => {
    setEditingDesign(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (d: Design) => {
    setEditingDesign(d);
    setForm({
      name: d.name,
      description: d.description || '',
      customerPrice: String(d.customerPrice),
      designerPrice: String(d.designerPrice || ''),
      category: d.category || '',
      imageUrl: (d.images && d.images[0]) || '',
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
      if (editingDesign) {
        await designsApi.update(editingDesign.id, payload);
        toast('success', 'Design updated');
      } else {
        await designsApi.create(payload);
        toast('success', 'Design created');
      }
      setModalOpen(false);
      loadDesigns();
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
      setDesigns((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast('error', 'Failed to delete design');
    }
  };

  const handleToggleActive = async (d: Design) => {
    try {
      const updated = await designsApi.update(d.id, { isActive: !d.isActive });
      setDesigns((prev) => prev.map((x) => x.id === updated.id ? updated : x));
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
      ) : designs.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 bg-white rounded-xl border border-neutral-200">
          <p className="mb-4">No designs yet.</p>
          <Button onClick={openCreate} variant="outline">Add Your First Design</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {designs.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              {d.images && d.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.images[0]} alt={d.name} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-neutral-900 text-sm">{d.name}</h3>
                  <Badge variant={d.isActive ? 'success' : 'default'}>
                    {d.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{d.category}</p>
                <p className="text-sm font-medium text-neutral-900 mt-2">${d.customerPrice}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(d)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggleActive(d)}>
                    {d.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(d.id)}>Delete</Button>
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
        title={editingDesign ? 'Edit Design' : 'Add New Design'}
      >
        <form onSubmit={handleSave} className="space-y-4">
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
          <div>
            <Input label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Dress" />
          </div>
          <ImageUploader
            label="Design Image"
            currentImageUrl={form.imageUrl}
            onUpload={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} className="flex-1">Save Design</Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

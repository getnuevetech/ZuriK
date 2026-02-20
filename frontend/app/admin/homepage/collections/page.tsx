'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { homepageApi, uploadApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';

interface CollectionDisplay {
  id: string;
  name: string;
  description: string | null;
  displayMode: string;
  image: string | null;
  productIds: string[] | null;
  category: string | null;
  displayOrder: number;
  isActive: boolean;
}

const emptyForm = (): Omit<CollectionDisplay, 'id'> => ({
  name: '',
  description: '',
  displayMode: 'PRODUCT_CARDS',
  image: '',
  productIds: [],
  category: '',
  displayOrder: 0,
  isActive: true,
});

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homepageApi.adminGetCollections();
      setCollections(data as CollectionDisplay[]);
    } catch {
      toast('error', 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (c: CollectionDisplay) => {
    setEditId(c.id);
    setForm({
      name: c.name,
      description: c.description ?? '',
      displayMode: c.displayMode,
      image: c.image ?? '',
      productIds: c.productIds ?? [],
      category: c.category ?? '',
      displayOrder: c.displayOrder,
      isActive: c.isActive,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadApi.uploadImage(file);
      setForm((prev) => ({ ...prev, image: url }));
      toast('success', 'Image uploaded');
    } catch {
      toast('error', 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast('error', 'Name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        description: form.description || undefined,
        image: form.image || undefined,
        category: form.category || undefined,
        productIds: form.productIds?.filter(Boolean).length ? form.productIds.filter(Boolean) : undefined,
      };
      if (editId) {
        await homepageApi.adminUpdateCollection(editId, payload as unknown as Record<string, unknown>);
        toast('success', 'Collection updated');
      } else {
        await homepageApi.adminCreateCollection(payload as unknown as Record<string, unknown>);
        toast('success', 'Collection created');
      }
      setShowForm(false);
      fetchCollections();
    } catch {
      toast('error', 'Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return;
    try {
      await homepageApi.adminDeleteCollection(id);
      toast('success', 'Collection deleted');
      fetchCollections();
    } catch {
      toast('error', 'Failed to delete collection');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Collection Displays" />

      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Collection
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {collections.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500 text-center">No collections yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Name', 'Mode', 'Category', 'Order', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {collections.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-800">{c.name}</td>
                    <td className="px-4 py-3 text-neutral-500">{c.displayMode}</td>
                    <td className="px-4 py-3 text-neutral-500">{c.category || '—'}</td>
                    <td className="px-4 py-3 text-neutral-500">{c.displayOrder}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {c.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button onClick={() => openEdit(c)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold text-neutral-800">
              {editId ? 'Edit Collection' : 'New Collection'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Name *</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Display Mode</label>
                <div className="flex gap-3">
                  {['PRODUCT_CARDS', 'EDITORIAL_BANNER'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setForm({ ...form, displayMode: mode })}
                      className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                        form.displayMode === mode
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-neutral-200 text-neutral-600 hover:border-indigo-300'
                      }`}
                    >
                      {mode === 'PRODUCT_CARDS' ? '🗃️ Product Cards' : '🖼️ Editorial Banner'}
                    </button>
                  ))}
                </div>
              </div>

              {form.displayMode === 'EDITORIAL_BANNER' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Hero Image</label>
                  {form.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={form.image} alt="hero" className="w-full h-32 object-cover rounded-lg mb-2" />
                  )}
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-indigo-400 transition-colors">
                    {uploading ? <Spinner /> : '📷 Upload Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              )}

              {form.displayMode === 'PRODUCT_CARDS' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Product IDs (comma-separated, optional)</label>
                  <input
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={(form.productIds ?? []).join(', ')}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        productIds: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Category (optional)</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={form.category ?? ''}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Display Order</label>
                <input
                  type="number"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-neutral-700">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

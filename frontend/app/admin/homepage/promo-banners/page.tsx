'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { homepageApi, uploadApi } from '../../../../lib/api';
import type { PromoBanner } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';

const LOCATION_OPTIONS = [
  { value: 'AFTER_HERO', label: 'Between Hero Banner & Shop by Country' },
  { value: 'AFTER_RTW', label: 'Between Featured Ready-to-Wear & Featured Designs' },
  { value: 'AFTER_FABRICS', label: 'Between Featured Fabrics & Collections' },
  { value: 'AFTER_HOW_IT_WORKS', label: 'Between How It Works & The Makers' },
  { value: 'AFTER_HERITAGE', label: 'Between Heritage Stories & Newsletter' },
];

const LOCATION_LABELS: Record<string, string> = Object.fromEntries(
  LOCATION_OPTIONS.map((o) => [o.value, o.label]),
);

type BannerForm = {
  title: string;
  subtitle: string;
  location: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  displayOrder: number;
  isActive: boolean;
};

const emptyForm = (): BannerForm => ({
  title: '',
  subtitle: '',
  location: 'AFTER_FABRICS',
  imageUrl: '',
  ctaText: '',
  ctaLink: '',
  displayOrder: 0,
  isActive: true,
});

export default function AdminPromoBannersPage() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homepageApi.adminGetPromoBanners();
      setBanners(data);
    } catch {
      toast('error', 'Failed to load promo banners');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (b: PromoBanner) => {
    setEditId(b.id);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? '',
      location: b.location,
      imageUrl: b.imageUrl,
      ctaText: b.ctaText ?? '',
      ctaLink: b.ctaLink ?? '',
      displayOrder: b.displayOrder,
      isActive: b.isActive,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadApi.uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      toast('success', 'Image uploaded');
    } catch {
      toast('error', 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast('error', 'Title is required');
      return;
    }
    if (!form.location) {
      toast('error', 'Location is required');
      return;
    }
    if (!form.imageUrl.trim()) {
      toast('error', 'Image is required');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        subtitle: form.subtitle || undefined,
        location: form.location,
        imageUrl: form.imageUrl,
        ctaText: form.ctaText || undefined,
        ctaLink: form.ctaLink || undefined,
        displayOrder: form.displayOrder,
        isActive: form.isActive,
      };
      if (editId) {
        await homepageApi.adminUpdatePromoBanner(editId, payload);
        toast('success', 'Banner updated');
      } else {
        await homepageApi.adminCreatePromoBanner(payload);
        toast('success', 'Banner created');
      }
      setShowForm(false);
      fetchBanners();
    } catch {
      toast('error', 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo banner?')) return;
    try {
      await homepageApi.adminDeletePromoBanner(id);
      toast('success', 'Banner deleted');
      fetchBanners();
    } catch {
      toast('error', 'Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Promo Banners" />

      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Banner
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {banners.length === 0 ? (
            <p className="text-sm text-neutral-500 p-6">No promo banners yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Thumbnail</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {banners.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      {b.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.imageUrl} alt={b.title} className="w-16 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-10 bg-neutral-200 rounded" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-800">{b.title}</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs max-w-[200px]">
                      {LOCATION_LABELS[b.location] ?? b.location}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{b.displayOrder}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          b.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {b.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-3">
                      <button onClick={() => openEdit(b)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold text-neutral-800">
              {editId ? 'Edit Promo Banner' : 'New Promo Banner'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Banner title"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Subtitle</label>
                <textarea
                  value={form.subtitle}
                  onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="Optional subtitle"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Location *</label>
                <select
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {LOCATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Image *</label>
                {form.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="Preview" className="w-full h-28 object-cover rounded-lg mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="text-xs text-neutral-600"
                />
                {uploading && <p className="text-xs text-indigo-600 mt-1">Uploading…</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">CTA Text</label>
                <input
                  type="text"
                  value={form.ctaText}
                  onChange={(e) => setForm((p) => ({ ...p, ctaText: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Shop Now →"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">CTA Link</label>
                <input
                  type="text"
                  value={form.ctaLink}
                  onChange={(e) => setForm((p) => ({ ...p, ctaLink: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="/products"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Display Order</label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="rounded border-neutral-300"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-neutral-600">Active</label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex-1 bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Banner'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-neutral-300 text-neutral-700 text-sm py-2 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

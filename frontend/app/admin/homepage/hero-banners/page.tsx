'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { heroBannersApi, uploadApi } from '../../../../lib/api';
import { HeroBanner } from '../../../../types';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';

type BannerForm = Omit<HeroBanner, 'id'>;

const emptyForm = (): BannerForm => ({
  title: '',
  subtitle: '',
  ctaText: '',
  ctaLink: '',
  mediaType: 'image',
  mediaUrl: '',
  mobileMediaUrl: '',
  sortOrder: 0,
  isActive: true,
  textColor: '#ffffff',
  overlayOpacity: 35,
});

export default function AdminHeroBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const { toast } = useToast();

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await heroBannersApi.list();
      setBanners(data);
    } catch {
      toast('error', 'Failed to load hero banners');
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

  const openEdit = (b: HeroBanner) => {
    setEditId(b.id);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? '',
      ctaText: b.ctaText ?? '',
      ctaLink: b.ctaLink ?? '',
      mediaType: b.mediaType,
      mediaUrl: b.mediaUrl,
      mobileMediaUrl: b.mobileMediaUrl ?? '',
      sortOrder: b.sortOrder,
      isActive: b.isActive,
      textColor: b.textColor ?? '#ffffff',
      overlayOpacity: b.overlayOpacity ?? 35,
    });
    setShowForm(true);
  };

  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'mediaUrl' | 'mobileMediaUrl',
    setUploading: (v: boolean) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url, mediaType } = await uploadApi.uploadHeroBannerMedia(file);
      setForm((prev) => ({
        ...prev,
        [field]: url,
        ...(field === 'mediaUrl' ? { mediaType } : {}),
      }));
      toast('success', 'Media uploaded');
    } catch {
      toast('error', 'Media upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast('error', 'Title is required');
      return;
    }
    if (!form.mediaUrl.trim()) {
      toast('error', 'Desktop media is required');
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<HeroBanner> = {
        title: form.title,
        subtitle: form.subtitle || undefined,
        ctaText: form.ctaText || undefined,
        ctaLink: form.ctaLink || undefined,
        mediaType: form.mediaType,
        mediaUrl: form.mediaUrl,
        mobileMediaUrl: form.mobileMediaUrl || undefined,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
        textColor: form.textColor || undefined,
        overlayOpacity: form.overlayOpacity,
      };
      if (editId) {
        await heroBannersApi.update(editId, payload);
        toast('success', 'Banner updated');
      } else {
        await heroBannersApi.create(payload);
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
    if (!confirm('Delete this hero banner?')) return;
    try {
      await heroBannersApi.delete(id);
      toast('success', 'Banner deleted');
      fetchBanners();
    } catch {
      toast('error', 'Failed to delete banner');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await heroBannersApi.toggle(id);
      fetchBanners();
    } catch {
      toast('error', 'Failed to toggle banner');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Hero Banners" />

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
            <p className="p-6 text-sm text-neutral-500 text-center">No hero banners yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Thumbnail', 'Title', 'Subtitle', 'Type', 'Order', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {banners.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      {b.mediaType === 'video' ? (
                        <div className="w-16 h-10 bg-neutral-100 rounded flex items-center justify-center text-xl">🎬</div>
                      ) : b.mediaUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={b.mediaUrl} alt={b.title} className="w-16 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-10 bg-neutral-100 rounded" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-800">{b.title}</td>
                    <td className="px-4 py-3 text-neutral-500 max-w-xs truncate">{b.subtitle || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.mediaType === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {b.mediaType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{b.sortOrder}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(b.id)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}
                      >
                        {b.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
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
              {editId ? 'Edit Hero Banner' : 'New Hero Banner'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Title *</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Subtitle</label>
                <textarea
                  rows={2}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={form.subtitle ?? ''}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">CTA Text</label>
                  <input
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    placeholder="e.g. Shop Now"
                    value={form.ctaText ?? ''}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">CTA Link</label>
                  <input
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    placeholder="e.g. /products"
                    value={form.ctaLink ?? ''}
                    onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Desktop Media *</label>
                {form.mediaUrl && (
                  form.mediaType === 'video' ? (
                    <video src={form.mediaUrl} controls className="w-full h-32 object-cover rounded-lg mb-2" />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={form.mediaUrl} alt="desktop media" className="w-full h-32 object-cover rounded-lg mb-2" />
                  )
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-indigo-400 transition-colors">
                  {uploadingDesktop ? <Spinner /> : '📎 Upload Image or Video'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                    className="hidden"
                    onChange={(e) => handleMediaUpload(e, 'mediaUrl', setUploadingDesktop)}
                    disabled={uploadingDesktop}
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Mobile Media (optional)</label>
                {form.mobileMediaUrl && (
                  form.mediaType === 'video' ? (
                    <video src={form.mobileMediaUrl} controls className="w-full h-24 object-cover rounded-lg mb-2" />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={form.mobileMediaUrl} alt="mobile media" className="w-full h-24 object-cover rounded-lg mb-2" />
                  )
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-indigo-400 transition-colors">
                  {uploadingMobile ? <Spinner /> : '📎 Upload Mobile Image or Video'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                    className="hidden"
                    onChange={(e) => handleMediaUpload(e, 'mobileMediaUrl', setUploadingMobile)}
                    disabled={uploadingMobile}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Text Color</label>
                  <input
                    type="color"
                    className="w-full h-9 border border-neutral-200 rounded-lg px-1 py-1 cursor-pointer"
                    value={form.textColor ?? '#ffffff'}
                    onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Sort Order</label>
                  <input
                    type="number"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Overlay Opacity: {form.overlayOpacity ?? 35}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  className="w-full"
                  value={form.overlayOpacity ?? 35}
                  onChange={(e) => setForm({ ...form, overlayOpacity: Number(e.target.value) })}
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

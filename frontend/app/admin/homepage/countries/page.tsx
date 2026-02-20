'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { homepageApi, uploadApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';

interface CountryHero {
  id: string;
  countryName: string;
  countryCode: string;
  heroImages: string[];
  rotationInterval: number;
  displayOrder: number;
  isActive: boolean;
}

const emptyForm = (): Omit<CountryHero, 'id'> => ({
  countryName: '',
  countryCode: '',
  heroImages: [],
  rotationInterval: 5000,
  displayOrder: 0,
  isActive: true,
});

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState<CountryHero[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homepageApi.adminGetCountries();
      setCountries(data as CountryHero[]);
    } catch {
      toast('error', 'Failed to load countries');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (c: CountryHero) => {
    setEditId(c.id);
    setForm({
      countryName: c.countryName,
      countryCode: c.countryCode,
      heroImages: c.heroImages ?? [],
      rotationInterval: c.rotationInterval,
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
      setForm((prev) => ({ ...prev, heroImages: [...prev.heroImages, url] }));
      toast('success', 'Image uploaded');
    } catch {
      toast('error', 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      heroImages: prev.heroImages.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.countryName.trim() || !form.countryCode.trim()) {
      toast('error', 'Country name and code are required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await homepageApi.adminUpdateCountry(editId, form as unknown as Record<string, unknown>);
        toast('success', 'Country updated');
      } else {
        await homepageApi.adminCreateCountry(form as unknown as Record<string, unknown>);
        toast('success', 'Country created');
      }
      setShowForm(false);
      fetchCountries();
    } catch {
      toast('error', 'Failed to save country');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this country hero?')) return;
    try {
      await homepageApi.adminDeleteCountry(id);
      toast('success', 'Country deleted');
      fetchCountries();
    } catch {
      toast('error', 'Failed to delete country');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Country Category Heroes" />

      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Country
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {countries.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500 text-center">No country heroes yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Country', 'Code', 'Images', 'Interval (ms)', 'Order', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {countries.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-800">{c.countryName}</td>
                    <td className="px-4 py-3 text-neutral-500">{c.countryCode}</td>
                    <td className="px-4 py-3 text-neutral-500">{c.heroImages?.length ?? 0} images</td>
                    <td className="px-4 py-3 text-neutral-500">{c.rotationInterval}</td>
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
              {editId ? 'Edit Country' : 'New Country Hero'}
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Country Name *</label>
                  <input
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={form.countryName}
                    onChange={(e) => setForm({ ...form, countryName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Country Code * (e.g. NG)</label>
                  <input
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={form.countryCode}
                    onChange={(e) => setForm({ ...form, countryCode: e.target.value.toUpperCase() })}
                    maxLength={3}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Hero Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.heroImages.map((url, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="hero" className="w-16 h-16 object-cover rounded-lg" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-indigo-400 transition-colors">
                  {uploading ? <Spinner /> : '📷 Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Rotation Interval (ms)</label>
                  <input
                    type="number"
                    min={1000}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={form.rotationInterval}
                    onChange={(e) => setForm({ ...form, rotationInterval: Number(e.target.value) })}
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

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { homepageApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';

interface FeaturedSection {
  id: string;
  title: string;
  category: string | null;
  selectionMode: string;
  manualProductIds: string[];
  maxRows: number;
  displayOrder: number;
  isActive: boolean;
}

const SELECTION_MODES = ['AUTO_NEWEST', 'AUTO_BEST_SELLING', 'AUTO_HIGHEST_RATED', 'MANUAL'];

const emptyForm = (): Omit<FeaturedSection, 'id'> => ({
  title: '',
  category: '',
  selectionMode: 'AUTO_NEWEST',
  manualProductIds: [],
  maxRows: 4,
  displayOrder: 0,
  isActive: true,
});

export default function AdminFeaturedPage() {
  const [sections, setSections] = useState<FeaturedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homepageApi.adminGetFeatured();
      setSections(data as FeaturedSection[]);
    } catch {
      toast('error', 'Failed to load featured sections');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (s: FeaturedSection) => {
    setEditId(s.id);
    setForm({
      title: s.title,
      category: s.category ?? '',
      selectionMode: s.selectionMode,
      manualProductIds: s.manualProductIds ?? [],
      maxRows: s.maxRows,
      displayOrder: s.displayOrder,
      isActive: s.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast('error', 'Title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        category: form.category || undefined,
        manualProductIds: form.selectionMode === 'MANUAL'
          ? form.manualProductIds.filter(Boolean)
          : [],
      };
      if (editId) {
        await homepageApi.adminUpdateFeatured(editId, payload as unknown as Record<string, unknown>);
        toast('success', 'Section updated');
      } else {
        await homepageApi.adminCreateFeatured(payload as unknown as Record<string, unknown>);
        toast('success', 'Section created');
      }
      setShowForm(false);
      fetchSections();
    } catch {
      toast('error', 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this featured section?')) return;
    try {
      await homepageApi.adminDeleteFeatured(id);
      toast('success', 'Section deleted');
      fetchSections();
    } catch {
      toast('error', 'Failed to delete section');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Featured Product Sections" />

      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Section
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {sections.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500 text-center">No featured sections yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Title', 'Category', 'Mode', 'Rows', 'Order', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sections.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-800">{s.title}</td>
                    <td className="px-4 py-3 text-neutral-500">{s.category || '—'}</td>
                    <td className="px-4 py-3 text-neutral-500">{s.selectionMode}</td>
                    <td className="px-4 py-3 text-neutral-500">{s.maxRows}</td>
                    <td className="px-4 py-3 text-neutral-500">{s.displayOrder}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {s.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button onClick={() => openEdit(s)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline text-xs">Delete</button>
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
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-base font-semibold text-neutral-800">
              {editId ? 'Edit Section' : 'New Featured Section'}
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
                <label className="block text-xs font-medium text-neutral-600 mb-1">Category (optional)</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={form.category ?? ''}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Selection Mode</label>
                <select
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={form.selectionMode}
                  onChange={(e) => setForm({ ...form, selectionMode: e.target.value })}
                >
                  {SELECTION_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {form.selectionMode === 'MANUAL' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Product IDs (comma-separated)</label>
                  <input
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={form.manualProductIds.join(', ')}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        manualProductIds: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Max Rows (1–6)</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={form.maxRows}
                    onChange={(e) => setForm({ ...form, maxRows: Number(e.target.value) })}
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

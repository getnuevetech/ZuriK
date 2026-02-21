'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { homepageApi, uploadApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';

interface HeritageStory {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  country: string | null;
  fabricType: string | null;
  tags: string[] | null;
  displayOrder: number;
  isActive: boolean;
}

const emptyForm = (): Omit<HeritageStory, 'id'> => ({
  title: '',
  excerpt: '',
  body: '',
  coverImage: '',
  country: '',
  fabricType: '',
  tags: [],
  displayOrder: 0,
  isActive: true,
});

export default function AdminHeritageStoriesPage() {
  const [stories, setStories] = useState<HeritageStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homepageApi.adminGetHeritageStories();
      setStories(data as HeritageStory[]);
    } catch {
      toast('error', 'Failed to load heritage stories');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (s: HeritageStory) => {
    setEditId(s.id);
    setForm({
      title: s.title,
      excerpt: s.excerpt ?? '',
      body: s.body ?? '',
      coverImage: s.coverImage ?? '',
      country: s.country ?? '',
      fabricType: s.fabricType ?? '',
      tags: s.tags ?? [],
      displayOrder: s.displayOrder,
      isActive: s.isActive,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadApi.uploadImage(file);
      setForm((prev) => ({ ...prev, coverImage: url }));
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
    setSaving(true);
    try {
      const payload = {
        ...form,
        excerpt: form.excerpt || undefined,
        body: form.body || undefined,
        coverImage: form.coverImage || undefined,
        country: form.country || undefined,
        fabricType: form.fabricType || undefined,
        tags: form.tags?.filter(Boolean).length ? form.tags.filter(Boolean) : undefined,
      };
      if (editId) {
        await homepageApi.adminUpdateHeritageStory(editId, payload as unknown as Record<string, unknown>);
        toast('success', 'Story updated');
      } else {
        await homepageApi.adminCreateHeritageStory(payload as unknown as Record<string, unknown>);
        toast('success', 'Story created');
      }
      setShowForm(false);
      fetchStories();
    } catch {
      toast('error', 'Failed to save story');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this heritage story?')) return;
    try {
      await homepageApi.adminDeleteHeritageStory(id);
      toast('success', 'Story deleted');
      fetchStories();
    } catch {
      toast('error', 'Failed to delete story');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Heritage Stories" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Homepage', href: '/admin/homepage' }, { label: 'Heritage' }]} />

      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Story
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {stories.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500 text-center">No heritage stories yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Title', 'Country', 'Fabric Type', 'Order', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {stories.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-800">{s.title}</td>
                    <td className="px-4 py-3 text-neutral-500">{s.country || '—'}</td>
                    <td className="px-4 py-3 text-neutral-500">{s.fabricType || '—'}</td>
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

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold text-neutral-800">
              {editId ? 'Edit Heritage Story' : 'New Heritage Story'}
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
                <label className="block text-xs font-medium text-neutral-600 mb-1">Country</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="e.g. Ghana"
                  value={form.country ?? ''}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Fabric Type</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="e.g. Kente"
                  value={form.fabricType ?? ''}
                  onChange={(e) => setForm({ ...form, fabricType: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Excerpt</label>
                <textarea
                  rows={2}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={form.excerpt ?? ''}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Body</label>
                <textarea
                  rows={5}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={form.body ?? ''}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Cover Image</label>
                {form.coverImage && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={form.coverImage} alt="cover" className="w-full h-32 object-cover rounded-lg mb-2" />
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-indigo-400 transition-colors">
                  {uploading ? <Spinner /> : '📷 Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Tags (comma-separated)</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="e.g. kente, heritage, ghana"
                  value={(form.tags ?? []).join(', ')}
                  onChange={(e) =>
                    setForm({ ...form, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
                  }
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

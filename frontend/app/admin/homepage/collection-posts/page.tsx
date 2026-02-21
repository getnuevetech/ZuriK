'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { homepageApi, uploadApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';

interface CollectionPost {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  tags: string[] | null;
  displayOrder: number;
  isActive: boolean;
  slug: string | null;
}

const emptyForm = (): Omit<CollectionPost, 'id'> => ({
  title: '',
  excerpt: '',
  body: '',
  coverImage: '',
  tags: [],
  displayOrder: 0,
  isActive: true,
  slug: '',
});

export default function AdminCollectionPostsPage() {
  const [posts, setPosts] = useState<CollectionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homepageApi.adminGetCollectionPosts();
      setPosts(data as CollectionPost[]);
    } catch {
      toast('error', 'Failed to load collection posts');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (p: CollectionPost) => {
    setEditId(p.id);
    setForm({
      title: p.title,
      excerpt: p.excerpt ?? '',
      body: p.body ?? '',
      coverImage: p.coverImage ?? '',
      tags: p.tags ?? [],
      displayOrder: p.displayOrder,
      isActive: p.isActive,
      slug: p.slug ?? '',
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
        slug: form.slug || undefined,
        tags: form.tags?.filter(Boolean).length ? form.tags.filter(Boolean) : undefined,
      };
      if (editId) {
        await homepageApi.adminUpdateCollectionPost(editId, payload as unknown as Record<string, unknown>);
        toast('success', 'Post updated');
      } else {
        await homepageApi.adminCreateCollectionPost(payload as unknown as Record<string, unknown>);
        toast('success', 'Post created');
      }
      setShowForm(false);
      fetchPosts();
    } catch {
      toast('error', 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection post?')) return;
    try {
      await homepageApi.adminDeleteCollectionPost(id);
      toast('success', 'Post deleted');
      fetchPosts();
    } catch {
      toast('error', 'Failed to delete post');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Collection Stories" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Homepage', href: '/admin/homepage' }, { label: 'Collection Posts' }]} />

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
          {posts.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500 text-center">No collection posts yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Title', 'Slug', 'Order', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-800">{p.title}</td>
                    <td className="px-4 py-3 text-neutral-500">{p.slug || '—'}</td>
                    <td className="px-4 py-3 text-neutral-500">{p.displayOrder}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {p.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">Delete</button>
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
              {editId ? 'Edit Collection Story' : 'New Collection Story'}
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
                <label className="block text-xs font-medium text-neutral-600 mb-1">Slug</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="e.g. kente-story"
                  value={form.slug ?? ''}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Excerpt (short description)</label>
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
                  placeholder="e.g. kente, ghana, heritage"
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

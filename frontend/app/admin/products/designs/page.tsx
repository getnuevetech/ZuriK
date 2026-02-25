'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { designsApi } from '../../../../lib/api';
import { Design } from '../../../../types/product';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';
import { useCurrency } from '../../../../lib/currency-context';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

type StatusFilter = 'all' | 'active' | 'inactive';
type FeaturedFilter = 'all' | 'featured' | 'not_featured';

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [designer, setDesigner] = useState('');
  const [category, setCategory] = useState('');
  const [minRating, setMinRating] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>('all');

  // Detail / Edit modal
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Design>>({});

  const { toast } = useToast();
  const { formatPrice, currencySymbol } = useCurrency();

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await designsApi.list({
        search: search || undefined,
        category: category || undefined,
        minRating: minRating ? Number(minRating) : undefined,
        page,
        limit: 20,
        includeInactive: true,
      });
      let items = res.items;
      if (country) {
        items = items.filter((d) =>
          d.designer?.country?.toLowerCase().includes(country.toLowerCase()),
        );
      }
      if (designer) {
        items = items.filter((d) => {
          const name = `${d.designer?.firstName ?? ''} ${d.designer?.lastName ?? ''}`.toLowerCase();
          return name.includes(designer.toLowerCase());
        });
      }
      if (statusFilter === 'active') items = items.filter((d) => d.isActive);
      else if (statusFilter === 'inactive') items = items.filter((d) => !d.isActive);
      if (featuredFilter === 'featured') items = items.filter((d) => d.isFeatured);
      else if (featuredFilter === 'not_featured') items = items.filter((d) => !d.isFeatured);

      setDesigns(items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast('error', 'Failed to load designs');
    } finally {
      setLoading(false);
    }
  }, [search, category, country, designer, minRating, statusFilter, featuredFilter, page, toast]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this design? This cannot be undone.')) return;
    try {
      await designsApi.delete(id);
      toast('success', 'Design deleted');
      fetchDesigns();
    } catch {
      toast('error', 'Failed to delete design');
    }
  };

  const handleToggleActive = async (design: Design) => {
    try {
      await designsApi.update(design.id, { isActive: !design.isActive });
      toast('success', `Design ${design.isActive ? 'deactivated' : 'activated'}`);
      fetchDesigns();
    } catch {
      toast('error', 'Failed to update design');
    }
  };

  const handleToggleFeatured = async (design: Design) => {
    try {
      await designsApi.toggleFeatured(design.id);
      toast('success', `Design ${design.isFeatured ? 'unfeatured' : 'featured'}`);
      fetchDesigns();
    } catch {
      toast('error', 'Failed to toggle featured');
    }
  };

  const openDetail = (design: Design) => {
    setSelectedDesign(design);
    setShowDetail(true);
    setShowEdit(false);
  };

  const openEdit = (design: Design) => {
    setSelectedDesign(design);
    setEditForm({
      name: design.name,
      description: design.description,
      category: design.category,
      tags: design.tags,
      customerPrice: design.customerPrice,
      designerPrice: design.designerPrice,
      isActive: design.isActive,
      isFeatured: design.isFeatured,
    });
    setShowEdit(true);
    setShowDetail(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedDesign) return;
    setSaving(true);
    try {
      await designsApi.update(selectedDesign.id, editForm);
      toast('success', 'Design updated');
      setShowEdit(false);
      fetchDesigns();
    } catch {
      toast('error', 'Failed to update design');
    } finally {
      setSaving(false);
    }
  };

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<Design>>({});

  const openCreate = () => {
    setCreateForm({ name: '', description: '', customerPrice: 0, designerPrice: 0, category: '', tags: [] });
    setShowCreate(true);
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await designsApi.create({
        name: createForm.name ?? '',
        description: createForm.description ?? '',
        customerPrice: createForm.customerPrice ?? 0,
        designerPrice: createForm.designerPrice ?? 0,
        category: createForm.category,
        tags: createForm.tags,
      });
      toast('success', 'Design created');
      setShowCreate(false);
      fetchDesigns();
    } catch {
      toast('error', 'Failed to create design');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Designs Inventory"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: 'Designs' },
        ]}
        actions={
          <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
            + Create
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <input
          className="col-span-2 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <input
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          placeholder="Filter by country…"
          value={country}
          onChange={(e) => { setCountry(e.target.value); setPage(1); }}
        />
        <input
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          placeholder="Filter by designer…"
          value={designer}
          onChange={(e) => { setDesigner(e.target.value); setPage(1); }}
        />
        <input
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          placeholder="Filter by category…"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        />
        <input
          type="number"
          min="0"
          max="5"
          step="0.1"
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          placeholder="Min rating (0–5)…"
          value={minRating}
          onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
        />
        <select
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          value={featuredFilter}
          onChange={(e) => { setFeaturedFilter(e.target.value as FeaturedFilter); setPage(1); }}
        >
          <option value="all">All Featured</option>
          <option value="featured">Featured</option>
          <option value="not_featured">Not Featured</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><Spinner /></div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-x-auto">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <span className="text-sm text-neutral-500">{total} design{total !== 1 ? 's' : ''} total</span>
          </div>
          {designs.length === 0 ? (
            <p className="p-8 text-sm text-neutral-500 text-center">No designs found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['', 'Name', 'Designer', 'Country', 'Category', 'Price', 'Rating', 'Status', 'Featured', 'Uploaded', 'Actions'].map(
                    (h) => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {designs.map((design) => {
                  const designerName = `${design.designer?.firstName ?? ''} ${design.designer?.lastName ?? ''}`.trim() || '—';
                  return (
                    <tr key={design.id} className="hover:bg-neutral-50">
                      <td className="px-3 py-2">
                        {design.images?.[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={design.images[0]}
                            alt={design.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-xl">🎨</div>
                        )}
                      </td>
                      <td className="px-3 py-2 font-medium text-neutral-800 max-w-[140px] truncate">{design.name}</td>
                      <td className="px-3 py-2 text-neutral-500 whitespace-nowrap">{designerName}</td>
                      <td className="px-3 py-2 text-neutral-500">{design.designer?.country || '—'}</td>
                      <td className="px-3 py-2 text-neutral-500">{design.category || '—'}</td>
                      <td className="px-3 py-2 text-neutral-700 whitespace-nowrap">
                        {formatPrice(Number(design.customerPrice))}
                      </td>
                      <td className="px-3 py-2 text-neutral-500 whitespace-nowrap">
                        {design.averageRating ? `⭐ ${design.averageRating.toFixed(1)}` : '—'}
                        {design.totalReviews ? ` (${design.totalReviews})` : ''}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleToggleActive(design)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            design.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {design.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleToggleFeatured(design)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            design.isFeatured ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          {design.isFeatured ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-neutral-400 whitespace-nowrap text-xs" title={formatDate(design.createdAt)}>
                        {timeAgo(design.createdAt)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2 whitespace-nowrap">
                          <button onClick={() => openDetail(design)} className="text-indigo-600 hover:underline text-xs">View</button>
                          <button onClick={() => openEdit(design)} className="text-neutral-600 hover:underline text-xs">Edit</button>
                          <button onClick={() => handleDelete(design.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-50">← Prev</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-50">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedDesign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-800">{selectedDesign.name}</h2>
              <button onClick={() => setShowDetail(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            {selectedDesign.images && selectedDesign.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedDesign.images.map((url, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={i} src={url} alt={`img-${i}`} className="w-20 h-20 object-cover rounded-lg" />
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-neutral-500">Category:</span> <span className="font-medium">{selectedDesign.category || '—'}</span></div>
              <div><span className="text-neutral-500">Customer Price:</span> <span className="font-medium">{formatPrice(Number(selectedDesign.customerPrice))}</span></div>
              <div><span className="text-neutral-500">Designer Price:</span> <span className="font-medium">{selectedDesign.designerPrice ? formatPrice(Number(selectedDesign.designerPrice)) : '—'}</span></div>
              <div><span className="text-neutral-500">Rating:</span> <span className="font-medium">{selectedDesign.averageRating?.toFixed(1) ?? '—'} ({selectedDesign.totalReviews ?? 0} reviews)</span></div>
              <div><span className="text-neutral-500">Tags:</span> <span className="font-medium">{selectedDesign.tags?.join(', ') || '—'}</span></div>
              <div><span className="text-neutral-500">Status:</span> <span className={`font-medium ${selectedDesign.isActive ? 'text-green-600' : 'text-neutral-400'}`}>{selectedDesign.isActive ? 'Active' : 'Inactive'}</span></div>
              <div><span className="text-neutral-500">Featured:</span> <span className="font-medium">{selectedDesign.isFeatured ? 'Yes' : 'No'}</span></div>
              <div><span className="text-neutral-500">Uploaded:</span> <span className="font-medium">{formatDate(selectedDesign.createdAt)}</span></div>
              <div><span className="text-neutral-500">Updated:</span> <span className="font-medium">{formatDate(selectedDesign.updatedAt)}</span></div>
            </div>

            {selectedDesign.description && (
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">Description</p>
                <p className="text-sm text-neutral-700">{selectedDesign.description}</p>
              </div>
            )}

            {selectedDesign.designer && (
              <div className="bg-neutral-50 rounded-lg p-3 space-y-1 text-sm">
                <p className="text-xs font-medium text-neutral-500 uppercase mb-2">Designer Info</p>
                <div><span className="text-neutral-500">Name:</span> <span className="font-medium">{selectedDesign.designer.firstName} {selectedDesign.designer.lastName}</span></div>
                <div><span className="text-neutral-500">Email:</span> <span className="font-medium">{selectedDesign.designer.email}</span></div>
                <div><span className="text-neutral-500">Country:</span> <span className="font-medium">{selectedDesign.designer.country || '—'}</span></div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => openEdit(selectedDesign)} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Edit</button>
              <button onClick={() => setShowDetail(false)} className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && selectedDesign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-800">Edit Design</h2>
              <button onClick={() => setShowEdit(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Name</label>
                <input className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={editForm.name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
                <textarea rows={3} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={editForm.description ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Category</label>
                  <input className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={editForm.category ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Tags (comma-separated)</label>
                  <input className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={editForm.tags?.join(', ') ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Customer Price ({currencySymbol})</label>
                  <input type="number" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={editForm.customerPrice ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, customerPrice: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Designer Price ({currencySymbol})</label>
                  <input type="number" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={editForm.designerPrice ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, designerPrice: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.isActive ?? false} onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-neutral-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.isFeatured ?? false} onChange={(e) => setEditForm((p) => ({ ...p, isFeatured: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-neutral-700">Featured</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-800">Create Design</h2>
              <button onClick={() => setShowCreate(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Name *</label>
                <input className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={createForm.name ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Description *</label>
                <textarea rows={3} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={createForm.description ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Category</label>
                  <input className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={createForm.category ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Tags (comma-separated)</label>
                  <input className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={createForm.tags?.join(', ') ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Customer Price ({currencySymbol}) *</label>
                  <input type="number" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={createForm.customerPrice ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, customerPrice: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Designer Price ({currencySymbol}) *</label>
                  <input type="number" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={createForm.designerPrice ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, designerPrice: Number(e.target.value) }))} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60">{saving ? 'Creating…' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

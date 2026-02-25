'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fabricsApi } from '../../../../lib/api';
import { Fabric } from '../../../../types/fabric';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';

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

function stockLabel(stock: number): { label: string; cls: string } {
  if (stock === 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' };
  if (stock <= 5) return { label: 'Low Stock', cls: 'bg-amber-100 text-amber-700' };
  return { label: 'In Stock', cls: 'bg-green-100 text-green-700' };
}

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
type StatusFilter = 'all' | 'active' | 'inactive';
type FeaturedFilter = 'all' | 'featured' | 'not_featured';

export default function AdminFabricsPage() {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [seller, setSeller] = useState('');
  const [material, setMaterial] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>('all');

  // Detail / Edit modal
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Fabric>>({});

  const { toast } = useToast();

  const fetchFabrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fabricsApi.list({
        search: search || undefined,
        material: material || undefined,
        page,
        limit: 20,
        includeInactive: true,
      });
      // Client-side filtering for fields not supported by API
      let items = res.items;
      if (country) {
        items = items.filter((f) =>
          f.seller?.country?.toLowerCase().includes(country.toLowerCase()),
        );
      }
      if (seller) {
        items = items.filter((f) => {
          const name = `${f.seller?.firstName ?? ''} ${f.seller?.lastName ?? ''}`.toLowerCase();
          return name.includes(seller.toLowerCase());
        });
      }
      if (stockFilter === 'in_stock') items = items.filter((f) => f.stock > 5);
      else if (stockFilter === 'low_stock') items = items.filter((f) => f.stock > 0 && f.stock <= 5);
      else if (stockFilter === 'out_of_stock') items = items.filter((f) => f.stock === 0);
      if (statusFilter === 'active') items = items.filter((f) => f.isActive);
      else if (statusFilter === 'inactive') items = items.filter((f) => !f.isActive);
      if (featuredFilter === 'featured') items = items.filter((f) => f.isFeatured);
      else if (featuredFilter === 'not_featured') items = items.filter((f) => !f.isFeatured);

      setFabrics(items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast('error', 'Failed to load fabrics');
    } finally {
      setLoading(false);
    }
  }, [search, material, country, seller, stockFilter, statusFilter, featuredFilter, page, toast]);

  useEffect(() => {
    fetchFabrics();
  }, [fetchFabrics]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fabric? This cannot be undone.')) return;
    try {
      await fabricsApi.delete(id);
      toast('success', 'Fabric deleted');
      fetchFabrics();
    } catch {
      toast('error', 'Failed to delete fabric');
    }
  };

  const handleToggleActive = async (fabric: Fabric) => {
    try {
      await fabricsApi.update(fabric.id, { isActive: !fabric.isActive });
      toast('success', `Fabric ${fabric.isActive ? 'deactivated' : 'activated'}`);
      fetchFabrics();
    } catch {
      toast('error', 'Failed to update fabric');
    }
  };

  const handleToggleFeatured = async (fabric: Fabric) => {
    try {
      await fabricsApi.toggleFeatured(fabric.id);
      toast('success', `Fabric ${fabric.isFeatured ? 'unfeatured' : 'featured'}`);
      fetchFabrics();
    } catch {
      toast('error', 'Failed to toggle featured');
    }
  };

  const openDetail = (fabric: Fabric) => {
    setSelectedFabric(fabric);
    setShowDetail(true);
    setShowEdit(false);
  };

  const openEdit = (fabric: Fabric) => {
    setSelectedFabric(fabric);
    setEditForm({
      name: fabric.name,
      description: fabric.description,
      type: fabric.type,
      material: fabric.material,
      colors: fabric.colors,
      patterns: fabric.patterns,
      width: fabric.width,
      customerPrice: fabric.customerPrice,
      sellerPrice: fabric.sellerPrice,
      stock: fabric.stock,
      isActive: fabric.isActive,
      isFeatured: fabric.isFeatured,
    });
    setShowEdit(true);
    setShowDetail(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedFabric) return;
    setSaving(true);
    try {
      await fabricsApi.update(selectedFabric.id, editForm);
      toast('success', 'Fabric updated');
      setShowEdit(false);
      fetchFabrics();
    } catch {
      toast('error', 'Failed to update fabric');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Fabrics Inventory"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: 'Fabrics' },
        ]}
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
          placeholder="Filter by seller…"
          value={seller}
          onChange={(e) => { setSeller(e.target.value); setPage(1); }}
        />
        <input
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          placeholder="Filter by material…"
          value={material}
          onChange={(e) => { setMaterial(e.target.value); setPage(1); }}
        />
        <select
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          value={stockFilter}
          onChange={(e) => { setStockFilter(e.target.value as StockFilter); setPage(1); }}
        >
          <option value="all">All Stock</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
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
            <span className="text-sm text-neutral-500">{total} fabric{total !== 1 ? 's' : ''} total</span>
          </div>
          {fabrics.length === 0 ? (
            <p className="p-8 text-sm text-neutral-500 text-center">No fabrics found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['', 'Name', 'Seller', 'Country', 'Material', 'Type', 'Price', 'Stock', 'Status', 'Featured', 'Uploaded', 'Actions'].map(
                    (h) => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {fabrics.map((fabric) => {
                  const { label: stockLbl, cls: stockCls } = stockLabel(fabric.stock);
                  const sellerName = `${fabric.seller?.firstName ?? ''} ${fabric.seller?.lastName ?? ''}`.trim() || '—';
                  return (
                    <tr key={fabric.id} className="hover:bg-neutral-50">
                      <td className="px-3 py-2">
                        {fabric.images?.[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={fabric.images[0]}
                            alt={fabric.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-xl">🧵</div>
                        )}
                      </td>
                      <td className="px-3 py-2 font-medium text-neutral-800 max-w-[140px] truncate">{fabric.name}</td>
                      <td className="px-3 py-2 text-neutral-500 whitespace-nowrap">{sellerName}</td>
                      <td className="px-3 py-2 text-neutral-500">{fabric.seller?.country || '—'}</td>
                      <td className="px-3 py-2 text-neutral-500">{fabric.material || '—'}</td>
                      <td className="px-3 py-2 text-neutral-500">{fabric.type || '—'}</td>
                      <td className="px-3 py-2 text-neutral-700 whitespace-nowrap">
                        ₦{Number(fabric.customerPrice).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stockCls}`}>
                          {stockLbl} ({fabric.stock})
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleToggleActive(fabric)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            fabric.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {fabric.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleToggleFeatured(fabric)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            fabric.isFeatured ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          {fabric.isFeatured ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-neutral-400 whitespace-nowrap text-xs" title={formatDate(fabric.createdAt)}>
                        {timeAgo(fabric.createdAt)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2 whitespace-nowrap">
                          <button
                            onClick={() => openDetail(fabric)}
                            className="text-indigo-600 hover:underline text-xs"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEdit(fabric)}
                            className="text-neutral-600 hover:underline text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(fabric.id)}
                            className="text-red-500 hover:underline text-xs"
                          >
                            Delete
                          </button>
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
              <span className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-50"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedFabric && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-800">{selectedFabric.name}</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            {/* Images */}
            {selectedFabric.images && selectedFabric.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedFabric.images.map((url, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={i} src={url} alt={`img-${i}`} className="w-20 h-20 object-cover rounded-lg" />
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-neutral-500">Material:</span> <span className="font-medium">{selectedFabric.material || '—'}</span></div>
              <div><span className="text-neutral-500">Type:</span> <span className="font-medium">{selectedFabric.type || '—'}</span></div>
              <div><span className="text-neutral-500">Width:</span> <span className="font-medium">{selectedFabric.width ? `${selectedFabric.width}m` : '—'}</span></div>
              <div><span className="text-neutral-500">Colors:</span> <span className="font-medium">{selectedFabric.colors?.join(', ') || '—'}</span></div>
              <div><span className="text-neutral-500">Patterns:</span> <span className="font-medium">{selectedFabric.patterns?.join(', ') || '—'}</span></div>
              <div><span className="text-neutral-500">Customer Price:</span> <span className="font-medium">₦{Number(selectedFabric.customerPrice).toLocaleString()}</span></div>
              <div><span className="text-neutral-500">Seller Price:</span> <span className="font-medium">{selectedFabric.sellerPrice ? `₦${Number(selectedFabric.sellerPrice).toLocaleString()}` : '—'}</span></div>
              <div><span className="text-neutral-500">Stock:</span> <span className="font-medium">{selectedFabric.stock}</span></div>
              <div><span className="text-neutral-500">Status:</span> <span className={`font-medium ${selectedFabric.isActive ? 'text-green-600' : 'text-neutral-400'}`}>{selectedFabric.isActive ? 'Active' : 'Inactive'}</span></div>
              <div><span className="text-neutral-500">Featured:</span> <span className="font-medium">{selectedFabric.isFeatured ? 'Yes' : 'No'}</span></div>
              <div><span className="text-neutral-500">Uploaded:</span> <span className="font-medium">{formatDate(selectedFabric.createdAt)}</span></div>
              <div><span className="text-neutral-500">Updated:</span> <span className="font-medium">{formatDate(selectedFabric.updatedAt)}</span></div>
            </div>

            {selectedFabric.description && (
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">Description</p>
                <p className="text-sm text-neutral-700">{selectedFabric.description}</p>
              </div>
            )}

            {selectedFabric.seller && (
              <div className="bg-neutral-50 rounded-lg p-3 space-y-1 text-sm">
                <p className="text-xs font-medium text-neutral-500 uppercase mb-2">Seller Info</p>
                <div><span className="text-neutral-500">Name:</span> <span className="font-medium">{selectedFabric.seller.firstName} {selectedFabric.seller.lastName}</span></div>
                <div><span className="text-neutral-500">Email:</span> <span className="font-medium">{selectedFabric.seller.email}</span></div>
                <div><span className="text-neutral-500">Country:</span> <span className="font-medium">{selectedFabric.seller.country || '—'}</span></div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => openEdit(selectedFabric)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && selectedFabric && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-800">Edit Fabric</h2>
              <button onClick={() => setShowEdit(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Name</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={editForm.name ?? ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={editForm.description ?? ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Type</label>
                  <input
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={editForm.type ?? ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Material</label>
                  <input
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={editForm.material ?? ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, material: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Customer Price (₦)</label>
                  <input
                    type="number"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={editForm.customerPrice ?? ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, customerPrice: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Seller Price (₦)</label>
                  <input
                    type="number"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={editForm.sellerPrice ?? ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, sellerPrice: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Stock</label>
                  <input
                    type="number"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={editForm.stock ?? ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Width (m)</label>
                  <input
                    type="number"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={editForm.width ?? ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, width: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Colors (comma-separated)</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={editForm.colors?.join(', ') ?? ''}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      colors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Patterns (comma-separated)</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={editForm.patterns?.join(', ') ?? ''}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      patterns: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    }))
                  }
                />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive ?? false}
                    onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-neutral-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isFeatured ?? false}
                    onChange={(e) => setEditForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-neutral-700">Featured</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
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

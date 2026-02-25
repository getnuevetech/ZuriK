'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { readyToWearApi } from '../../../../lib/api';
import { ReadyToWearProduct } from '../../../../types/product';
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

function stockLabel(stock: number): { label: string; cls: string } {
  if (stock === 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' };
  if (stock <= 5) return { label: 'Low Stock', cls: 'bg-amber-100 text-amber-700' };
  return { label: 'In Stock', cls: 'bg-green-100 text-green-700' };
}

const CATEGORIES = ['Dresses', 'Tops', 'Jackets', 'Gowns', 'Sets', 'Accessories', 'Trousers'];

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
type StatusFilter = 'all' | 'active' | 'inactive';
type FeaturedFilter = 'all' | 'featured' | 'not_featured';

export default function AdminReadyToWearPage() {
  const [products, setProducts] = useState<ReadyToWearProduct[]>([]);
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
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>('all');

  // Detail / Edit modal
  const [selectedProduct, setSelectedProduct] = useState<ReadyToWearProduct | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ReadyToWearProduct>>({});

  const { toast } = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const { formatPrice, currencySymbol } = useCurrency();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await readyToWearApi.list({
        search: search || undefined,
        category: category || undefined,
        page,
        limit: 20,
        includeInactive: true,
      });
      let items = res.items;
      if (country) {
        items = items.filter((p) =>
          p.designer?.country?.toLowerCase().includes(country.toLowerCase()),
        );
      }
      if (designer) {
        items = items.filter((p) => {
          const name = `${p.designer?.firstName ?? ''} ${p.designer?.lastName ?? ''}`.toLowerCase();
          return name.includes(designer.toLowerCase());
        });
      }
      const stock = (p: ReadyToWearProduct) => p.stock ?? 0;
      if (stockFilter === 'in_stock') items = items.filter((p) => stock(p) > 5);
      else if (stockFilter === 'low_stock') items = items.filter((p) => stock(p) > 0 && stock(p) <= 5);
      else if (stockFilter === 'out_of_stock') items = items.filter((p) => stock(p) === 0);
      if (statusFilter === 'active') items = items.filter((p) => p.isActive);
      else if (statusFilter === 'inactive') items = items.filter((p) => !p.isActive);
      if (featuredFilter === 'featured') items = items.filter((p) => p.isFeatured);
      else if (featuredFilter === 'not_featured') items = items.filter((p) => !p.isFeatured);

      setProducts(items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toastRef.current('error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, category, country, designer, stockFilter, statusFilter, featuredFilter, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await readyToWearApi.delete(id);
      toast('success', 'Product deleted');
      fetchProducts();
    } catch {
      toast('error', 'Failed to delete product');
    }
  };

  const handleToggleActive = async (product: ReadyToWearProduct) => {
    try {
      await readyToWearApi.update(product.id, { isActive: !product.isActive });
      toast('success', `Product ${product.isActive ? 'deactivated' : 'activated'}`);
      fetchProducts();
    } catch {
      toast('error', 'Failed to update product');
    }
  };

  const handleToggleFeatured = async (product: ReadyToWearProduct) => {
    try {
      await readyToWearApi.toggleFeatured(product.id);
      toast('success', `Product ${product.isFeatured ? 'unfeatured' : 'featured'}`);
      fetchProducts();
    } catch {
      toast('error', 'Failed to toggle featured');
    }
  };

  const openDetail = (product: ReadyToWearProduct) => {
    setSelectedProduct(product);
    setShowDetail(true);
    setShowEdit(false);
  };

  const openEdit = (product: ReadyToWearProduct) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      category: product.category,
      tags: product.tags,
      customerPrice: product.customerPrice,
      designerPrice: product.designerPrice,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      trackInventory: product.trackInventory,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
    setShowEdit(true);
    setShowDetail(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    try {
      await readyToWearApi.update(selectedProduct.id, editForm);
      toast('success', 'Product updated');
      setShowEdit(false);
      fetchProducts();
    } catch {
      toast('error', 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<ReadyToWearProduct>>({});

  const openCreate = () => {
    setCreateForm({ name: '', description: '', customerPrice: 0, designerPrice: 0, category: '', tags: [], stock: 0 });
    setShowCreate(true);
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await readyToWearApi.create({
        name: createForm.name ?? '',
        description: createForm.description ?? '',
        customerPrice: createForm.customerPrice ?? 0,
        designerPrice: createForm.designerPrice ?? 0,
        category: createForm.category,
        tags: createForm.tags,
        stock: createForm.stock,
      });
      toast('success', 'Product created');
      setShowCreate(false);
      fetchProducts();
    } catch {
      toast('error', 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Ready-to-Wear Inventory"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: 'Ready-to-Wear' },
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
        <select
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
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
            <span className="text-sm text-neutral-500">{total} product{total !== 1 ? 's' : ''} total</span>
          </div>
          {products.length === 0 ? (
            <p className="p-8 text-sm text-neutral-500 text-center">No products found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['', 'Name', 'Designer', 'Country', 'Category', 'Price', 'Stock', 'Status', 'Featured', 'Uploaded', 'Actions'].map(
                    (h) => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((product) => {
                  const stockVal = product.stock ?? 0;
                  const { label: stockLbl, cls: stockCls } = stockLabel(stockVal);
                  const designerName = `${product.designer?.firstName ?? ''} ${product.designer?.lastName ?? ''}`.trim() || '—';
                  return (
                    <tr key={product.id} className="hover:bg-neutral-50">
                      <td className="px-3 py-2">
                        {product.images?.[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-xl">👗</div>
                        )}
                      </td>
                      <td className="px-3 py-2 font-medium text-neutral-800 max-w-[140px] truncate">{product.name}</td>
                      <td className="px-3 py-2 text-neutral-500 whitespace-nowrap">{designerName}</td>
                      <td className="px-3 py-2 text-neutral-500">{product.designer?.country || '—'}</td>
                      <td className="px-3 py-2 text-neutral-500">{product.category || '—'}</td>
                      <td className="px-3 py-2 text-neutral-700 whitespace-nowrap">
                        {formatPrice(Number(product.customerPrice))}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stockCls}`}>
                          {stockLbl} ({stockVal})
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            product.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            product.isFeatured ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          {product.isFeatured ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-neutral-400 whitespace-nowrap text-xs" title={formatDate(product.createdAt)}>
                        {timeAgo(product.createdAt)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2 whitespace-nowrap">
                          <button onClick={() => openDetail(product)} className="text-indigo-600 hover:underline text-xs">View</button>
                          <button onClick={() => openEdit(product)} className="text-neutral-600 hover:underline text-xs">Edit</button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:underline text-xs">Delete</button>
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
      {showDetail && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-800">{selectedProduct.name}</h2>
              <button onClick={() => setShowDetail(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            {selectedProduct.images && selectedProduct.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedProduct.images.map((url, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={i} src={url} alt={`img-${i}`} className="w-20 h-20 object-cover rounded-lg" />
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-neutral-500">Category:</span> <span className="font-medium">{selectedProduct.category || '—'}</span></div>
              <div><span className="text-neutral-500">Customer Price:</span> <span className="font-medium">{formatPrice(Number(selectedProduct.customerPrice))}</span></div>
              <div><span className="text-neutral-500">Designer Price:</span> <span className="font-medium">{selectedProduct.designerPrice ? formatPrice(Number(selectedProduct.designerPrice)) : '—'}</span></div>
              <div><span className="text-neutral-500">Stock:</span> <span className="font-medium">{selectedProduct.stock ?? 0}</span></div>
              <div><span className="text-neutral-500">Low Stock At:</span> <span className="font-medium">{selectedProduct.lowStockThreshold ?? '—'}</span></div>
              <div><span className="text-neutral-500">Track Inventory:</span> <span className="font-medium">{selectedProduct.trackInventory ? 'Yes' : 'No'}</span></div>
              <div><span className="text-neutral-500">Rating:</span> <span className="font-medium">{selectedProduct.averageRating?.toFixed(1) ?? '—'} ({selectedProduct.totalReviews ?? 0} reviews)</span></div>
              <div><span className="text-neutral-500">Status:</span> <span className={`font-medium ${selectedProduct.isActive ? 'text-green-600' : 'text-neutral-400'}`}>{selectedProduct.isActive ? 'Active' : 'Inactive'}</span></div>
              <div><span className="text-neutral-500">Featured:</span> <span className="font-medium">{selectedProduct.isFeatured ? 'Yes' : 'No'}</span></div>
              <div><span className="text-neutral-500">Tags:</span> <span className="font-medium">{selectedProduct.tags?.join(', ') || '—'}</span></div>
              <div><span className="text-neutral-500">Uploaded:</span> <span className="font-medium">{formatDate(selectedProduct.createdAt)}</span></div>
              <div><span className="text-neutral-500">Updated:</span> <span className="font-medium">{formatDate(selectedProduct.updatedAt)}</span></div>
            </div>

            {selectedProduct.description && (
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">Description</p>
                <p className="text-sm text-neutral-700">{selectedProduct.description}</p>
              </div>
            )}

            {selectedProduct.designer && (
              <div className="bg-neutral-50 rounded-lg p-3 space-y-1 text-sm">
                <p className="text-xs font-medium text-neutral-500 uppercase mb-2">Designer Info</p>
                <div><span className="text-neutral-500">Name:</span> <span className="font-medium">{selectedProduct.designer.firstName} {selectedProduct.designer.lastName}</span></div>
                <div><span className="text-neutral-500">Email:</span> <span className="font-medium">{selectedProduct.designer.email}</span></div>
                <div><span className="text-neutral-500">Country:</span> <span className="font-medium">{selectedProduct.designer.country || '—'}</span></div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => openEdit(selectedProduct)} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Edit</button>
              <button onClick={() => setShowDetail(false)} className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-800">Edit Ready-to-Wear</h2>
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
                  <select className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={editForm.category ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}>
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Stock</label>
                  <input type="number" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={editForm.stock ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, stock: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Low Stock Threshold</label>
                  <input type="number" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={editForm.lowStockThreshold ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, lowStockThreshold: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.trackInventory ?? false} onChange={(e) => setEditForm((p) => ({ ...p, trackInventory: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-neutral-700">Track Inventory</span>
                </label>
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
              <h2 className="text-base font-semibold text-neutral-800">Create Ready-to-Wear</h2>
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
                  <select className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={createForm.category ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}>
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Stock</label>
                  <input type="number" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={createForm.stock ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, stock: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Low Stock Threshold</label>
                  <input type="number" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" value={createForm.lowStockThreshold ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, lowStockThreshold: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={createForm.trackInventory ?? false} onChange={(e) => setCreateForm((p) => ({ ...p, trackInventory: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-neutral-700">Track Inventory</span>
                </label>
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

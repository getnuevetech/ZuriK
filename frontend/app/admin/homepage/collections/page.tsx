'use client';

import React, { useEffect, useState } from 'react';
import { homepageAdminApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useToast } from '../../../../components/ui/Toast';

interface Collection {
  id: string;
  collectionName: string;
  description: string | null;
  displayMode: string;
  editorialImage: string | null;
  editorialOverlayText: string | null;
  productIds: string[];
  category: string | null;
  maxProducts: number;
  displayOrder: number;
  isActive: boolean;
}

const DISPLAY_MODES = [
  { value: 'PRODUCT_CARDS', label: 'Product Cards' },
  { value: 'EDITORIAL_BANNER', label: 'Editorial Banner' },
];

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMode, setNewMode] = useState('PRODUCT_CARDS');
  const [newCategory, setNewCategory] = useState('');
  const [newMaxProducts, setNewMaxProducts] = useState(8);
  const [newEditorialImage, setNewEditorialImage] = useState('');
  const [newEditorialText, setNewEditorialText] = useState('');
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    homepageAdminApi
      .getCollections()
      .then((r) => setCollections(r.data ?? []))
      .catch(() => toast('error', 'Failed to load collections'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await homepageAdminApi.createCollection({
        collectionName: newName,
        description: newDescription || undefined,
        displayMode: newMode,
        category: newCategory || undefined,
        maxProducts: newMaxProducts,
        editorialImage: newEditorialImage || undefined,
        editorialOverlayText: newEditorialText || undefined,
      });
      setNewName(''); setNewDescription(''); setNewCategory('');
      setNewMode('PRODUCT_CARDS'); setNewMaxProducts(8);
      setNewEditorialImage(''); setNewEditorialText('');
      toast('success', 'Collection created');
      load();
    } catch {
      toast('error', 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (collection: Collection) => {
    try {
      await homepageAdminApi.updateCollection(collection.id, { isActive: !collection.isActive });
      load();
    } catch {
      toast('error', 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return;
    try {
      await homepageAdminApi.deleteCollection(id);
      toast('success', 'Deleted');
      load();
    } catch {
      toast('error', 'Failed to delete');
    }
  };

  const handleReorder = async (list: Collection[]) => {
    await homepageAdminApi.reorderCollections(list.map((c) => c.id));
    load();
  };

  const moveCollection = (index: number, dir: 'up' | 'down') => {
    const next = [...collections];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setCollections(next);
    handleReorder(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Collections" />

      {/* Create form */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-neutral-800">Add New Collection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Collection Name" value={newName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)} placeholder="e.g. Summer Collection" />
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Display Mode</label>
            <select
              value={newMode}
              onChange={(e) => setNewMode(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DISPLAY_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <Input label="Description (optional)" value={newDescription} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDescription(e.target.value)} placeholder="Brief description..." />
          <Input label="Category filter (optional)" value={newCategory} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)} placeholder="e.g. Dresses" />

          {newMode === 'PRODUCT_CARDS' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700">Max Products</label>
              <input
                type="number"
                min={1}
                value={newMaxProducts}
                onChange={(e) => setNewMaxProducts(Number(e.target.value))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {newMode === 'EDITORIAL_BANNER' && (
            <>
              <Input label="Editorial Image URL" value={newEditorialImage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEditorialImage(e.target.value)} placeholder="https://..." />
              <Input label="Overlay Text" value={newEditorialText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEditorialText(e.target.value)} placeholder="Shop the Look" />
            </>
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="primary" size="md" loading={creating} onClick={handleCreate}>Add Collection</Button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-3">
        <h2 className="text-base font-semibold text-neutral-800">Collections</h2>
        {collections.length === 0 && (
          <p className="text-sm text-neutral-500">No collections yet. Add one above.</p>
        )}
        {collections.map((collection, index) => (
          <div key={collection.id} className="flex items-center gap-3 border border-neutral-200 rounded-lg px-4 py-3 bg-neutral-50">
            {collection.displayMode === 'EDITORIAL_BANNER' && collection.editorialImage && (
              <img src={collection.editorialImage} alt={collection.collectionName} className="h-12 w-16 object-cover rounded" />
            )}
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-neutral-800 truncate">{collection.collectionName}</span>
              <span className="block text-xs text-neutral-500 mt-0.5">
                {collection.displayMode === 'EDITORIAL_BANNER' ? '🎨 Editorial' : '🃏 Product Cards'}
                {collection.category ? ` · ${collection.category}` : ''}
                {collection.displayMode === 'PRODUCT_CARDS' ? ` · ${collection.maxProducts} products max` : ''}
              </span>
            </div>

            <button
              role="switch"
              aria-checked={collection.isActive}
              onClick={() => handleToggle(collection)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${collection.isActive ? 'bg-indigo-600' : 'bg-neutral-300'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${collection.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>

            <div className="flex gap-1">
              <button onClick={() => moveCollection(index, 'up')} disabled={index === 0} className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 text-neutral-500">▲</button>
              <button onClick={() => moveCollection(index, 'down')} disabled={index === collections.length - 1} className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 text-neutral-500">▼</button>
            </div>

            <button onClick={() => handleDelete(collection.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

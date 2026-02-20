'use client';

import React, { useEffect, useState } from 'react';
import { homepageAdminApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
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

const MODES = ['AUTO_NEWEST', 'AUTO_BESTSELLING', 'AUTO_HIGHEST_RATED', 'MANUAL'];

export default function AdminFeaturedPage() {
  const [sections, setSections] = useState<FeaturedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMode, setNewMode] = useState('AUTO_NEWEST');
  const [newCategory, setNewCategory] = useState('');
  const [newMaxRows, setNewMaxRows] = useState(2);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    homepageAdminApi
      .getFeaturedSections()
      .then((r) => setSections(r.data ?? []))
      .catch(() => toast('error', 'Failed to load featured sections'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await homepageAdminApi.createFeaturedSection({
        title: newTitle,
        selectionMode: newMode,
        category: newCategory || undefined,
        maxRows: newMaxRows,
      });
      setNewTitle('');
      setNewCategory('');
      setNewMode('AUTO_NEWEST');
      setNewMaxRows(2);
      toast('success', 'Section created');
      load();
    } catch {
      toast('error', 'Failed to create section');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (section: FeaturedSection) => {
    try {
      await homepageAdminApi.updateFeaturedSection(section.id, { isActive: !section.isActive });
      load();
    } catch {
      toast('error', 'Failed to update section');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    try {
      await homepageAdminApi.deleteFeaturedSection(id);
      toast('success', 'Section deleted');
      load();
    } catch {
      toast('error', 'Failed to delete section');
    }
  };

  const handleReorder = async (sections: FeaturedSection[]) => {
    await homepageAdminApi.reorderFeaturedSections(sections.map((s) => s.id));
    load();
  };

  const moveSection = (index: number, dir: 'up' | 'down') => {
    const next = [...sections];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
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
      <AdminPageHeader title="Featured Sections" />

      {/* Create new section */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-neutral-800">Add New Section</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Section Title"
            value={newTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
            placeholder="e.g. Trending Ankara Dresses"
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Selection Mode</label>
            <select
              value={newMode}
              onChange={(e) => setNewMode(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {MODES.map((m) => (
                <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <Input
            label="Category (optional)"
            value={newCategory}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
            placeholder="e.g. Dresses"
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Max Rows</label>
            <input
              type="number"
              min={1}
              max={10}
              value={newMaxRows}
              onChange={(e) => setNewMaxRows(Number(e.target.value))}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="primary" size="md" loading={creating} onClick={handleCreate}>
            Add Section
          </Button>
        </div>
      </div>

      {/* Sections list */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-3">
        <h2 className="text-base font-semibold text-neutral-800">Sections</h2>
        {sections.length === 0 && (
          <p className="text-sm text-neutral-500">No featured sections yet. Add one above.</p>
        )}
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="flex items-center gap-3 border border-neutral-200 rounded-lg px-4 py-3 bg-neutral-50"
          >
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-neutral-800 truncate">{section.title}</span>
              <span className="block text-xs text-neutral-500 mt-0.5">
                {section.selectionMode.replace(/_/g, ' ')}
                {section.category ? ` · ${section.category}` : ''} · {section.maxRows} row{section.maxRows !== 1 ? 's' : ''}
              </span>
            </span>

            {/* Toggle active */}
            <button
              role="switch"
              aria-checked={section.isActive}
              onClick={() => handleToggle(section)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                section.isActive ? 'bg-indigo-600' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  section.isActive ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>

            {/* Reorder */}
            <div className="flex gap-1">
              <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 text-neutral-500">▲</button>
              <button onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1} className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 text-neutral-500">▼</button>
            </div>

            <button
              onClick={() => handleDelete(section.id)}
              className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

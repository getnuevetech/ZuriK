'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { homepageApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';

interface HeroStat {
  id: string;
  label: string;
  value: string;
  displayOrder: number;
  isActive: boolean;
}

type StatForm = Omit<HeroStat, 'id'>;

const emptyForm = (): StatForm => ({
  label: '',
  value: '',
  displayOrder: 0,
  isActive: true,
});

export default function AdminHeroStatsPage() {
  const [stats, setStats] = useState<HeroStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<StatForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homepageApi.adminGetHeroStats();
      setStats(data);
    } catch {
      toast('error', 'Failed to load hero stats');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (s: HeroStat) => {
    setEditId(s.id);
    setForm({
      label: s.label,
      value: s.value,
      displayOrder: s.displayOrder,
      isActive: s.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.label.trim()) {
      toast('error', 'Label is required');
      return;
    }
    if (!form.value.trim()) {
      toast('error', 'Value is required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await homepageApi.adminUpdateHeroStat(editId, { ...form });
        toast('success', 'Stat updated');
      } else {
        await homepageApi.adminCreateHeroStat({ ...form });
        toast('success', 'Stat created');
      }
      setShowForm(false);
      fetchStats();
    } catch {
      toast('error', 'Failed to save stat');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this hero stat?')) return;
    try {
      await homepageApi.adminDeleteHeroStat(id);
      toast('success', 'Stat deleted');
      fetchStats();
    } catch {
      toast('error', 'Failed to delete stat');
    }
  };

  const handleToggle = async (s: HeroStat) => {
    try {
      await homepageApi.adminUpdateHeroStat(s.id, { isActive: !s.isActive });
      fetchStats();
    } catch {
      toast('error', 'Failed to toggle stat');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Hero Stats" />

      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Stat
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {stats.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500 text-center">No hero stats yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Label', 'Value', 'Display Order', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {stats.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-800">{s.label}</td>
                    <td className="px-4 py-3 text-neutral-600">{s.value}</td>
                    <td className="px-4 py-3 text-neutral-500">{s.displayOrder}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(s)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}
                      >
                        {s.isActive ? 'Active' : 'Hidden'}
                      </button>
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
          <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-neutral-800">
              {editId ? 'Edit Hero Stat' : 'New Hero Stat'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Label *</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="e.g. Countries"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Value *</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="e.g. 150"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
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

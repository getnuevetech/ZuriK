'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { homepageApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { useToast } from '../../../../components/ui/Toast';

interface HowItWorksStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}

const emptyForm = (): Omit<HowItWorksStep, 'id'> => ({
  stepNumber: 1,
  title: '',
  description: '',
  icon: '✦',
  isActive: true,
  displayOrder: 0,
});

export default function AdminHowItWorksPage() {
  const [steps, setSteps] = useState<HowItWorksStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSteps = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homepageApi.adminGetHowItWorksSteps();
      setSteps(data as HowItWorksStep[]);
    } catch {
      toast('error', 'Failed to load steps');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (step: HowItWorksStep) => {
    setEditId(step.id);
    setForm({
      stepNumber: step.stepNumber,
      title: step.title,
      description: step.description,
      icon: step.icon || '✦',
      isActive: step.isActive,
      displayOrder: step.displayOrder,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast('error', 'Title and description are required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await homepageApi.adminUpdateHowItWorksStep(editId, form as Record<string, unknown>);
        toast('success', 'Step updated');
      } else {
        await homepageApi.adminCreateHowItWorksStep(form as Record<string, unknown>);
        toast('success', 'Step created');
      }
      setShowForm(false);
      fetchSteps();
    } catch {
      toast('error', 'Failed to save step');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this step?')) return;
    try {
      await homepageApi.adminDeleteHowItWorksStep(id);
      toast('success', 'Step deleted');
      fetchSteps();
    } catch {
      toast('error', 'Failed to delete step');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <AdminPageHeader
        title="How It Works"
        actions={<Button onClick={openCreate}>+ Add Step</Button>}
      />

      {showForm && (
        <div className="mb-8 p-6 bg-white border border-neutral-200 rounded-xl shadow-sm">
          <h3 className="font-semibold text-neutral-900 mb-4">{editId ? 'Edit Step' : 'New Step'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Step Number</label>
              <input
                type="number"
                min={1}
                value={form.stepNumber}
                onChange={(e) => setForm((f) => ({ ...f, stepNumber: Number(e.target.value) }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B3A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Icon (emoji)</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B3A]"
                placeholder="e.g. 🔍"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B3A]"
                placeholder="Step title"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B3A]"
                placeholder="Step description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Display Order</label>
              <input
                type="number"
                min={0}
                value={form.displayOrder}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B3A]"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm text-neutral-700">Active</label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : steps.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">No steps yet. Add your first step.</div>
      ) : (
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-xl">
              <div className="w-10 h-10 flex items-center justify-center rounded-full text-xl flex-shrink-0" style={{ backgroundColor: '#C97B3A1a' }}>
                {step.icon || step.stepNumber}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: '#C97B3A' }}>0{step.stepNumber}</span>
                  <span className="font-semibold text-neutral-900 text-sm">{step.title}</span>
                  {!step.isActive && <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">Inactive</span>}
                </div>
                <p className="text-sm text-neutral-500 truncate">{step.description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => openEdit(step)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(step.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

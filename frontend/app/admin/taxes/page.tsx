'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/ui/Toast';
import api from '../../../lib/api';

interface TaxConfiguration {
  id: string;
  country: string;
  state: string | null;
  taxName: string;
  baseTaxRate: number;
  adminMarkupRate: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TaxPreviewResult {
  taxAmount?: number;
  totalAmount?: number;
  taxRate?: number;
  [key: string]: unknown;
}

const emptyForm = () => ({
  country: '',
  state: '',
  taxName: '',
  baseTaxRate: 0,
  adminMarkupRate: 0,
  description: '',
  isActive: true,
});

export default function AdminTaxesPage() {
  const [taxes, setTaxes] = useState<TaxConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [previewSubtotal, setPreviewSubtotal] = useState('');
  const [previewCountry, setPreviewCountry] = useState('');
  const [previewResult, setPreviewResult] = useState<TaxPreviewResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const { toast } = useToast();

  const fetchTaxes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/taxes');
      setTaxes(res.data ?? []);
    } catch {
      toast('error', 'Failed to load tax configurations');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (tax: TaxConfiguration) => {
    setEditId(tax.id);
    setForm({
      country: tax.country,
      state: tax.state ?? '',
      taxName: tax.taxName,
      baseTaxRate: tax.baseTaxRate,
      adminMarkupRate: tax.adminMarkupRate,
      description: tax.description ?? '',
      isActive: tax.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.country.trim() || !form.taxName.trim()) {
      toast('error', 'Country and tax name are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        state: form.state || null,
        description: form.description || null,
        baseTaxRate: Number(form.baseTaxRate),
        adminMarkupRate: Number(form.adminMarkupRate),
      };
      if (editId) {
        await api.patch(`/admin/taxes/${editId}`, payload);
        toast('success', 'Tax configuration updated');
      } else {
        await api.post('/admin/taxes', payload);
        toast('success', 'Tax configuration created');
      }
      setShowModal(false);
      fetchTaxes();
    } catch {
      toast('error', 'Failed to save tax configuration');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!previewSubtotal || !previewCountry) {
      toast('error', 'Enter subtotal and select a country');
      return;
    }
    setPreviewing(true);
    setPreviewResult(null);
    try {
      const res = await api.get('/admin/taxes/preview', {
        params: { subtotal: previewSubtotal, country: previewCountry },
      });
      setPreviewResult(res.data);
    } catch {
      toast('error', 'Failed to calculate tax preview');
    } finally {
      setPreviewing(false);
    }
  };

  const uniqueCountries = Array.from(new Set(taxes.map((t) => t.country)));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tax Configuration"
        actions={
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Add Tax Config
          </button>
        }
      />

      {/* Tax table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {taxes.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500 text-center">No tax configurations yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Country', 'State', 'Tax Name', 'Base Rate', 'Markup', 'Total Rate', 'Status', 'Actions'].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {taxes.map((tax) => (
                  <tr key={tax.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-800">{tax.country}</td>
                    <td className="px-4 py-3 text-neutral-500">{tax.state ?? '—'}</td>
                    <td className="px-4 py-3 text-neutral-700">{tax.taxName}</td>
                    <td className="px-4 py-3 text-neutral-600">{tax.baseTaxRate}%</td>
                    <td className="px-4 py-3 text-neutral-600">{tax.adminMarkupRate}%</td>
                    <td className="px-4 py-3 font-semibold text-neutral-800">
                      {(Number(tax.baseTaxRate) + Number(tax.adminMarkupRate)).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tax.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {tax.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(tax)}
                        className="text-xs px-2 py-1 rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tax preview calculator */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-800">Tax Preview Calculator</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-neutral-600 mb-1">Subtotal (₦)</label>
            <input
              type="number"
              min="0"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              placeholder="e.g. 50000"
              value={previewSubtotal}
              onChange={(e) => setPreviewSubtotal(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-neutral-600 mb-1">Country</label>
            <select
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              value={previewCountry}
              onChange={(e) => setPreviewCountry(e.target.value)}
            >
              <option value="">Select country</option>
              {uniqueCountries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handlePreview}
              disabled={previewing}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {previewing ? 'Calculating…' : 'Calculate'}
            </button>
          </div>
        </div>
        {previewResult && (
          <div className="bg-neutral-50 rounded-lg p-4 text-sm text-neutral-700 space-y-1">
            {previewResult.taxRate !== undefined && (
              <p>Tax Rate: <strong>{previewResult.taxRate}%</strong></p>
            )}
            {previewResult.taxAmount !== undefined && (
              <p>Tax Amount: <strong>₦{Number(previewResult.taxAmount).toLocaleString()}</strong></p>
            )}
            {previewResult.totalAmount !== undefined && (
              <p>Total (inc. tax): <strong>₦{Number(previewResult.totalAmount).toLocaleString()}</strong></p>
            )}
          </div>
        )}
      </div>

      {/* Modal form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold text-neutral-800">
              {editId ? 'Edit Tax Configuration' : 'Add Tax Configuration'}
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Country *</label>
                  <input
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    placeholder="e.g. Nigeria"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">State (optional)</label>
                  <input
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    placeholder="e.g. Lagos"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Tax Name *</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="e.g. VAT"
                  value={form.taxName}
                  onChange={(e) => setForm({ ...form, taxName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Base Tax Rate (%) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={form.baseTaxRate}
                    onChange={(e) => setForm({ ...form, baseTaxRate: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Admin Markup Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={form.adminMarkupRate}
                    onChange={(e) => setForm({ ...form, adminMarkupRate: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Description (optional)</label>
                <textarea
                  rows={2}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none"
                  placeholder="Additional notes about this tax"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
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

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api, { adminApi } from '../../../lib/api';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/ui/Toast';

interface PlatformSettings {
  id: string;
  key: string;
  percentageFee: number;
  currency: string;
  description: string | null;
  isActive: boolean;
  showFeaturedReadyToWear: boolean;
  showFeaturedDesigns: boolean;
  showFeaturedFabrics: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeePreview {
  subtotal: number;
  platformFee: number;
  total: number;
}

type ToggleableField = 'showFeaturedReadyToWear' | 'showFeaturedDesigns' | 'showFeaturedFabrics' | 'isActive';

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR', 'EGP', 'MAD', 'XOF'];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Platform fee edit state
  const [editingFee, setEditingFee] = useState(false);
  const [feeValue, setFeeValue] = useState('');

  // Currency edit state
  const [editingCurrency, setEditingCurrency] = useState(false);
  const [currencyValue, setCurrencyValue] = useState('');

  // Description / key edit state
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ key: '', description: '' });

  // Fee preview calculator
  const [designPrice, setDesignPrice] = useState('');
  const [fabricPrice, setFabricPrice] = useState('');
  const [feePreview, setFeePreview] = useState<FeePreview | null>(null);
  const [calculatingFee, setCalculatingFee] = useState(false);

  // Create initial settings
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    key: 'default',
    percentageFee: 10,
    currency: 'USD',
    description: 'Default platform settings',
  });
  const [creating, setCreating] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data: PlatformSettings[] = await adminApi.getSettings();
      const active = data.find((s) => s.isActive) ?? data[0] ?? null;
      setSettings(active);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const patchSettings = async (id: string, data: Partial<PlatformSettings>) => {
    setSaving(true);
    try {
      const { data: updated } = await api.patch<PlatformSettings>(`/admin/settings/${id}`, data);
      setSettings(updated);
      toast('success', 'Settings saved');
    } catch {
      toast('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Platform fee handlers
  const startEditFee = () => {
    setFeeValue(String(settings?.percentageFee ?? 10));
    setEditingFee(true);
  };
  const saveFee = async () => {
    if (!settings) return;
    const val = parseFloat(feeValue);
    if (isNaN(val) || val < 0 || val > 100) {
      toast('error', 'Fee must be between 0 and 100');
      return;
    }
    await patchSettings(settings.id, { percentageFee: val });
    setEditingFee(false);
  };

  // Currency handlers
  const startEditCurrency = () => {
    setCurrencyValue(settings?.currency ?? 'USD');
    setEditingCurrency(true);
  };
  const saveCurrency = async () => {
    if (!settings) return;
    if (!currencyValue.trim()) {
      toast('error', 'Currency is required');
      return;
    }
    await patchSettings(settings.id, { currency: currencyValue });
    setEditingCurrency(false);
  };

  // Homepage toggle handlers
  const handleToggle = async (field: ToggleableField) => {
    if (!settings) return;
    await patchSettings(settings.id, { [field]: !settings[field] });
  };

  // Info (key/description) handlers
  const startEditInfo = () => {
    setInfoForm({ key: settings?.key ?? '', description: settings?.description ?? '' });
    setEditingInfo(true);
  };
  const saveInfo = async () => {
    if (!settings) return;
    if (!infoForm.key.trim()) {
      toast('error', 'Key is required');
      return;
    }
    await patchSettings(settings.id, { key: infoForm.key, description: infoForm.description });
    setEditingInfo(false);
  };

  // Fee preview calculator
  const calculateFee = async () => {
    const dp = parseFloat(designPrice);
    const fp = parseFloat(fabricPrice);
    if (isNaN(dp) || isNaN(fp) || dp < 0 || fp < 0) {
      toast('error', 'Enter valid prices');
      return;
    }
    setCalculatingFee(true);
    try {
      const { data: result } = await api.get<FeePreview>('/admin/settings/preview-fee', {
        params: { designPrice: dp, fabricPrice: fp },
      });
      setFeePreview(result);
    } catch {
      toast('error', 'Failed to calculate fee');
    } finally {
      setCalculatingFee(false);
    }
  };

  // Create initial settings
  const handleCreate = async () => {
    if (!createForm.key.trim()) {
      toast('error', 'Key is required');
      return;
    }
    setCreating(true);
    try {
      const { data: created } = await api.post<PlatformSettings>('/admin/settings', createForm);
      setSettings(created);
      setShowCreateForm(false);
      toast('success', 'Settings created');
    } catch {
      toast('error', 'Failed to create settings');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Platform Settings" />
        <div className="bg-white rounded-xl border border-neutral-200 p-10 text-center space-y-3">
          <p className="text-neutral-500">Failed to load settings.</p>
          <button
            onClick={fetchSettings}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!settings && !showCreateForm) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Platform Settings" />
        <div className="bg-white rounded-xl border border-neutral-200 p-10 text-center space-y-4">
          <p className="text-neutral-500">No settings found. Create the initial platform settings to get started.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Initial Settings
          </button>
        </div>
      </div>
    );
  }

  if (!settings && showCreateForm) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Platform Settings" />
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4 max-w-lg">
          <h2 className="text-base font-semibold text-neutral-800">Create Initial Settings</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Key *</label>
              <input
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                value={createForm.key}
                onChange={(e) => setCreateForm({ ...createForm, key: e.target.value })}
                placeholder="default"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Platform Fee (%) *</label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                value={createForm.percentageFee}
                onChange={(e) => setCreateForm({ ...createForm, percentageFee: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Currency *</label>
              <select
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                value={createForm.currency}
                onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
              <input
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Default platform settings"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Platform Settings" />

      {/* 1. Platform Fee Configuration */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-800">Platform Fee Configuration</h2>
          {!editingFee && (
            <button
              onClick={startEditFee}
              className="text-xs px-3 py-1.5 rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
        {editingFee ? (
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Platform Commission (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 w-36"
                value={feeValue}
                onChange={(e) => setFeeValue(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveFee}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditingFee(false)}
                className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-3xl font-bold text-indigo-600">
            {settings!.percentageFee}%
            <span className="text-sm font-normal text-neutral-500 ml-2">commission on orders</span>
          </p>
        )}
      </div>

      {/* 2. Fee Preview Calculator */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-base font-semibold text-neutral-800 mb-4">Fee Preview Calculator</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Design Price</label>
            <input
              type="number"
              min={0}
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 w-36"
              value={designPrice}
              onChange={(e) => setDesignPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Fabric Price</label>
            <input
              type="number"
              min={0}
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 w-36"
              value={fabricPrice}
              onChange={(e) => setFabricPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <button
            onClick={calculateFee}
            disabled={calculatingFee}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
          >
            {calculatingFee ? <Spinner /> : null}
            Calculate
          </button>
        </div>
        {feePreview && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-neutral-50 rounded-lg p-3 text-center">
              <p className="text-xs text-neutral-500 mb-1">Subtotal</p>
              <p className="text-lg font-semibold text-neutral-800">
                {settings!.currency} {Number(feePreview.subtotal).toFixed(2)}
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-xs text-neutral-500 mb-1">Platform Fee</p>
              <p className="text-lg font-semibold text-amber-700">
                {settings!.currency} {Number(feePreview.platformFee).toFixed(2)}
              </p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 text-center">
              <p className="text-xs text-neutral-500 mb-1">Total</p>
              <p className="text-lg font-semibold text-indigo-700">
                {settings!.currency} {Number(feePreview.total).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Default Currency */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-800">Default Currency</h2>
          {!editingCurrency && (
            <button
              onClick={startEditCurrency}
              className="text-xs px-3 py-1.5 rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
        {editingCurrency ? (
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Currency</label>
              <select
                className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                value={currencyValue}
                onChange={(e) => setCurrencyValue(e.target.value)}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveCurrency}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditingCurrency(false)}
                className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-2xl font-bold text-neutral-800">
            {settings!.currency}
          </p>
        )}
      </div>

      {/* 4. Homepage Feature Toggles */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-base font-semibold text-neutral-800 mb-4">Homepage Feature Toggles</h2>
        <div className="space-y-4">
          {(
            [
              { field: 'showFeaturedReadyToWear', label: 'Show Featured Ready-to-Wear section' },
              { field: 'showFeaturedDesigns', label: 'Show Featured Designs section' },
              { field: 'showFeaturedFabrics', label: 'Show Featured Fabrics section' },
            ] as const
          ).map(({ field, label }) => (
            <label key={field} className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-neutral-700 group-hover:text-neutral-900">{label}</span>
              <button
                role="switch"
                aria-checked={settings![field]}
                onClick={() => handleToggle(field)}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60 ${
                  settings![field] ? 'bg-indigo-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings![field] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* 5. Settings Entry Management */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-800">Settings Entry</h2>
          {!editingInfo && (
            <button
              onClick={startEditInfo}
              className="text-xs px-3 py-1.5 rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {editingInfo ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Key *</label>
              <input
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                value={infoForm.key}
                onChange={(e) => setInfoForm({ ...infoForm, key: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
              <input
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                value={infoForm.description}
                onChange={(e) => setInfoForm({ ...infoForm, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setEditingInfo(false)}
                className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={saveInfo}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs font-medium text-neutral-500 mb-0.5">Key</dt>
              <dd className="font-mono text-neutral-800">{settings!.key}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-neutral-500 mb-0.5">Description</dt>
              <dd className="text-neutral-800">{settings!.description || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-neutral-500 mb-0.5">Status</dt>
              <dd>
                <button
                  onClick={() => handleToggle('isActive')}
                  disabled={saving}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors disabled:opacity-60 ${
                    settings!.isActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                  }`}
                >
                  {settings!.isActive ? 'Active' : 'Inactive'}
                </button>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-neutral-500 mb-0.5">Entry ID</dt>
              <dd className="font-mono text-xs text-neutral-500">{settings!.id}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-neutral-500 mb-0.5">Created</dt>
              <dd className="text-neutral-600">{new Date(settings!.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-neutral-500 mb-0.5">Last Updated</dt>
              <dd className="text-neutral-600">{new Date(settings!.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}

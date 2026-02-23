'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { homepageApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { useToast } from '../../../../components/ui/Toast';

interface TryOnConfig {
  id?: string;
  apiEndpoint: string;
  apiKey: string;
  isEnabled: boolean;
  configVariables: Record<string, string>;
}

const emptyConfig = (): TryOnConfig => ({
  apiEndpoint: '',
  apiKey: '',
  isEnabled: false,
  configVariables: {},
});

export default function AdminTryOnPage() {
  const [config, setConfig] = useState<TryOnConfig>(emptyConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extraKey, setExtraKey] = useState('');
  const [extraValue, setExtraValue] = useState('');
  const { toast } = useToast();

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homepageApi.adminGetTryOnConfig();
      if (data) {
        setConfig({
          id: data.id,
          apiEndpoint: data.apiEndpoint || '',
          apiKey: data.apiKey || '',
          isEnabled: data.isEnabled ?? false,
          configVariables: data.configVariables || {},
        });
      }
    } catch {
      // Config may not exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        apiEndpoint: config.apiEndpoint,
        apiKey: config.apiKey,
        isEnabled: config.isEnabled,
        configVariables: config.configVariables,
      };
      await homepageApi.adminUpdateTryOnConfig(payload);
      toast('success', 'TryOn configuration saved');
    } catch {
      toast('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const addConfigVar = () => {
    if (!extraKey.trim()) return;
    setConfig((c) => ({
      ...c,
      configVariables: { ...c.configVariables, [extraKey.trim()]: extraValue },
    }));
    setExtraKey('');
    setExtraValue('');
  };

  const removeConfigVar = (key: string) => {
    setConfig((c) => {
      const updated = { ...c.configVariables };
      delete updated[key];
      return { ...c, configVariables: updated };
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <AdminPageHeader
        title="Virtual Try-On Integration"
      />

      <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
        {/* Enable toggle */}
        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
          <div>
            <div className="font-semibold text-neutral-900 text-sm">Enable TryOn Feature</div>
            <div className="text-xs text-neutral-500 mt-0.5">Show the virtual try-on section on the homepage</div>
          </div>
          <button
            onClick={() => setConfig((c) => ({ ...c, isEnabled: !c.isEnabled }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${config.isEnabled ? '' : 'bg-neutral-300'}`}
            style={config.isEnabled ? { backgroundColor: '#C97B3A' } : {}}
            aria-label="Toggle TryOn feature"
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.isEnabled ? 'translate-x-7' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* API Endpoint */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">API Endpoint URL</label>
          <input
            type="url"
            value={config.apiEndpoint}
            onChange={(e) => setConfig((c) => ({ ...c, apiEndpoint: e.target.value }))}
            placeholder="https://api.tryon-service.com/v1"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B3A]"
          />
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">API Key / Authentication</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig((c) => ({ ...c, apiKey: e.target.value }))}
            placeholder="sk-••••••••"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B3A]"
          />
          <p className="text-xs text-neutral-400 mt-1">Stored securely. Leave blank to keep the current key.</p>
        </div>

        {/* Config Variables */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Integration Variables</label>
          {Object.entries(config.configVariables).length > 0 && (
            <div className="space-y-2 mb-3">
              {Object.entries(config.configVariables).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
                  <span className="text-sm font-mono text-neutral-700 flex-1">{k}</span>
                  <span className="text-sm text-neutral-500 flex-1">{String(v)}</span>
                  <button onClick={() => removeConfigVar(k)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={extraKey}
              onChange={(e) => setExtraKey(e.target.value)}
              placeholder="Variable name"
              className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B3A]"
            />
            <input
              type="text"
              value={extraValue}
              onChange={(e) => setExtraValue(e.target.value)}
              placeholder="Value"
              className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C97B3A]"
            />
            <button
              onClick={addConfigVar}
              className="px-3 py-2 text-sm font-medium text-white rounded-lg"
              style={{ backgroundColor: '#C97B3A' }}
            >
              Add
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </div>
  );
}

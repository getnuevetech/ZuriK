'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../lib/api';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';

interface PlatformSettings {
  id: string;
  percentageFee: number;
  isActive: boolean;
  [key: string]: unknown;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [percentageFee, setPercentageFee] = useState('');
  const [isActive, setIsActive] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    adminApi
      .getSettings()
      .then((data: PlatformSettings | PlatformSettings[]) => {
        const setting = Array.isArray(data) ? data[0] : data;
        if (setting) {
          setSettings(setting);
          setPercentageFee(String(setting.percentageFee ?? 0));
          setIsActive(setting.isActive ?? true);
        }
      })
      .catch(() => toast('error', 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateSettings({
        id: settings.id,
        percentageFee: parseFloat(percentageFee),
        isActive,
      });
      const setting = Array.isArray(updated) ? updated[0] : updated;
      if (setting) {
        setSettings(setting);
        setPercentageFee(String(setting.percentageFee ?? 0));
        setIsActive(setting.isActive ?? true);
      }
      toast('success', 'Settings saved');
    } catch {
      toast('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
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
      <AdminPageHeader title="Platform Settings" />

      <div className="bg-white rounded-xl border border-neutral-200 p-6 max-w-lg space-y-6">
        <div className="space-y-4">
          <Input
            label="Platform Fee (%)"
            type="number"
            value={percentageFee}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPercentageFee(e.target.value)}
            placeholder="e.g. 10"
          />
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-neutral-700" htmlFor="platform-active">
              Platform Active
            </label>
            <button
              id="platform-active"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive((v: boolean) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                isActive ? 'bg-indigo-600' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-neutral-500">{isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

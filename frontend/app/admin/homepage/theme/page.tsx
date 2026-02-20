'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { homepageApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';

interface ThemePreset {
  name: string;
  key: string;
  colors: Record<string, string>;
}

const COLOR_LABELS: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  dark: 'Dark',
  lightBg: 'Light Background',
  text: 'Text',
  textLight: 'Text Light',
  buttonText: 'Button Text',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

export default function AdminThemePage() {
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>('BOLD_VIBRANT');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [presetsData, themeData] = await Promise.all([
        homepageApi.adminGetThemePresets(),
        homepageApi.adminGetTheme(),
      ]);
      setPresets(presetsData as ThemePreset[]);
      setActiveTheme((themeData as { activeTheme: string }).activeTheme);
    } catch {
      toast('error', 'Failed to load theme data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await homepageApi.adminUpdateTheme({ activeTheme });
      toast('success', 'Theme saved');
    } catch {
      toast('error', 'Failed to save theme');
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

  const selectedPreset = presets.find((p) => p.key === activeTheme);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Theme Settings" />

      {/* Theme preset selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const isSelected = preset.key === activeTheme;
          return (
            <button
              key={preset.key}
              onClick={() => setActiveTheme(preset.key)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-indigo-500 shadow-md'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm text-neutral-800">{preset.name}</span>
                {isSelected && (
                  <span className="text-indigo-600 text-xs font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              {/* Color swatches */}
              <div className="flex gap-1 flex-wrap">
                {['primary', 'secondary', 'accent', 'dark', 'lightBg'].map((key) => (
                  <div
                    key={key}
                    title={`${key}: ${preset.colors[key]}`}
                    className="w-7 h-7 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: preset.colors[key] }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Theme'}
        </button>
      </div>

      {/* Live preview */}
      {selectedPreset && (
        <div
          className="rounded-xl border border-neutral-200 overflow-hidden"
          style={{ backgroundColor: selectedPreset.colors.lightBg }}
        >
          <div className="p-4 border-b border-neutral-200 bg-white">
            <h2 className="text-sm font-semibold text-neutral-700">Live Preview — {selectedPreset.name}</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: selectedPreset.colors.primary, color: selectedPreset.colors.buttonText }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: selectedPreset.colors.secondary, color: selectedPreset.colors.buttonText }}
              >
                Secondary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
                style={{ borderColor: selectedPreset.colors.accent, color: selectedPreset.colors.accent, backgroundColor: 'transparent' }}
              >
                Accent Outline
              </button>
            </div>

            {/* Sample card */}
            <div
              className="rounded-xl p-4 max-w-xs shadow-sm"
              style={{ backgroundColor: '#ffffff', borderColor: selectedPreset.colors.accent, borderWidth: 1 }}
            >
              <div
                className="w-full h-24 rounded-lg mb-3"
                style={{ backgroundColor: selectedPreset.colors.primary, opacity: 0.15 }}
              />
              <p className="font-semibold text-sm mb-1" style={{ color: selectedPreset.colors.text }}>
                Sample Product Card
              </p>
              <p className="text-xs mb-2" style={{ color: selectedPreset.colors.textLight }}>
                Product description goes here
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm" style={{ color: selectedPreset.colors.primary }}>
                  $49.99
                </span>
                <button
                  className="px-3 py-1 rounded text-xs font-semibold"
                  style={{ backgroundColor: selectedPreset.colors.secondary, color: selectedPreset.colors.buttonText }}
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Color palette grid */}
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2">Color Palette</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(selectedPreset.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded flex-shrink-0 border border-neutral-200"
                      style={{ backgroundColor: value }}
                    />
                    <div>
                      <p className="text-xs font-medium text-neutral-700">{COLOR_LABELS[key] ?? key}</p>
                      <p className="text-xs text-neutral-400 font-mono">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

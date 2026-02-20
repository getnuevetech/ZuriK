'use client';

import React, { useEffect, useState } from 'react';
import { homepageAdminApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { useToast } from '../../../../components/ui/Toast';

interface ThemePreset {
  name: string;
  description: string;
  colors: Record<string, string>;
}

interface ThemePresets {
  BOLD_VIBRANT_AFRICAN: ThemePreset;
  WARM_EARTHY_LUXE: ThemePreset;
  MODERN_PUNCHY: ThemePreset;
}

const THEME_KEYS = ['BOLD_VIBRANT_AFRICAN', 'WARM_EARTHY_LUXE', 'MODERN_PUNCHY'] as const;
type ThemeKey = typeof THEME_KEYS[number];

const THEME_ICONS: Record<ThemeKey, string> = {
  BOLD_VIBRANT_AFRICAN: '🌍',
  WARM_EARTHY_LUXE: '🔥',
  MODERN_PUNCHY: '⚡',
};

export default function AdminThemePage() {
  const [presets, setPresets] = useState<ThemePresets | null>(null);
  const [activeTheme, setActiveTheme] = useState<ThemeKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<ThemeKey | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      homepageAdminApi.getThemePresets(),
      homepageAdminApi.getTheme(),
    ])
      .then(([presetsRes, themeRes]) => {
        setPresets(presetsRes.data);
        // Find active theme key by matching name
        const currentColors = themeRes.data?.colors;
        const currentName = themeRes.data?.name;
        const found = THEME_KEYS.find((k) => presetsRes.data?.[k]?.name === currentName);
        setActiveTheme(found ?? 'BOLD_VIBRANT_AFRICAN');
        setPendingTheme(found ?? 'BOLD_VIBRANT_AFRICAN');
        void currentColors;
      })
      .catch(() => toast('error', 'Failed to load theme settings'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleApply = async () => {
    if (!pendingTheme) return;
    setSaving(true);
    try {
      await homepageAdminApi.updateTheme(pendingTheme);
      setActiveTheme(pendingTheme);
      toast('success', `Theme applied: ${presets?.[pendingTheme]?.name}`);
    } catch {
      toast('error', 'Failed to apply theme');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !presets) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Theme Settings" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {THEME_KEYS.map((key) => {
          const preset = presets[key];
          const isActive = key === activeTheme;
          const isPending = key === pendingTheme;

          return (
            <button
              key={key}
              onClick={() => setPendingTheme(key)}
              className={`text-left rounded-xl border-2 p-5 transition-all ${
                isPending
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-neutral-200 bg-white hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{THEME_ICONS[key]}</span>
                {isActive && (
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
                {!isActive && isPending && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-neutral-900 mb-1">{preset.name}</h3>
              <p className="text-xs text-neutral-500 mb-4">{preset.description}</p>

              {/* Color swatches */}
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(preset.colors)
                  .filter(([k]) => ['primary', 'secondary', 'accent', 'dark', 'lightBg'].includes(k))
                  .map(([colorKey, colorValue]) => (
                    <div
                      key={colorKey}
                      className="h-6 w-6 rounded-full border border-white shadow-sm ring-1 ring-neutral-200"
                      style={{ backgroundColor: colorValue }}
                      title={`${colorKey}: ${colorValue}`}
                    />
                  ))}
              </div>

              {/* Hex codes for key colors */}
              <div className="mt-3 space-y-1">
                {['primary', 'secondary', 'accent'].map((colorKey) => (
                  <div key={colorKey} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: preset.colors[colorKey] }}
                    />
                    <span className="text-xs text-neutral-500 capitalize">{colorKey}</span>
                    <span className="text-xs text-neutral-400 font-mono ml-auto">{preset.colors[colorKey]}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Preview panel */}
      {pendingTheme && presets[pendingTheme] && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-base font-semibold text-neutral-800 mb-4">
            Preview: {presets[pendingTheme].name}
          </h2>
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ backgroundColor: presets[pendingTheme].colors.lightBg }}
          >
            <div
              className="inline-block px-6 py-3 rounded-lg font-semibold text-sm"
              style={{
                backgroundColor: presets[pendingTheme].colors.primary,
                color: presets[pendingTheme].colors.buttonText,
              }}
            >
              Shop Now
            </div>
            <div
              className="inline-block ml-3 px-6 py-3 rounded-lg font-semibold text-sm"
              style={{
                backgroundColor: presets[pendingTheme].colors.secondary,
                color: presets[pendingTheme].colors.buttonText,
              }}
            >
              Explore Designers
            </div>
            <p className="text-sm font-medium" style={{ color: presets[pendingTheme].colors.text }}>
              African Fashion Marketplace — Connecting Designers &amp; Customers
            </p>
            <p className="text-xs" style={{ color: presets[pendingTheme].colors.textLight }}>
              Discover authentic African fashion from talented designers across the continent.
            </p>
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: presets[pendingTheme].colors.accent,
                color: presets[pendingTheme].colors.dark,
              }}
            >
              New Collection
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {activeTheme && presets[activeTheme]
            ? `Currently active: ${presets[activeTheme].name}`
            : 'No theme active'}
        </p>
        <Button
          variant="primary"
          size="md"
          loading={saving}
          onClick={handleApply}
          disabled={pendingTheme === activeTheme}
        >
          Apply Theme
        </Button>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { homepageApi } from '../../../lib/api';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/ui/Toast';

interface LayoutSection {
  id: string;
  sectionType: string;
  sectionId: string | null;
  displayOrder: number;
  isActive: boolean;
}

const SECTION_LABELS: Record<string, string> = {
  HERO_BANNER: '🖼️ Hero Banner',
  FEATURED_PRODUCTS: '⭐ Featured Products',
  COUNTRY_CATEGORIES: '🌍 Country Categories',
  COLLECTIONS: '👗 Collections',
};

export default function AdminHomepagePage() {
  const [layout, setLayout] = useState<LayoutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeKey, setThemeKey] = useState<string>('BOLD_VIBRANT');
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [layoutData, themeData] = await Promise.all([
        homepageApi.adminGetLayout(),
        homepageApi.adminGetTheme(),
      ]);
      setLayout(
        [...(layoutData as LayoutSection[])].sort((a, b) => a.displayOrder - b.displayOrder),
      );
      setThemeKey((themeData as { activeTheme: string }).activeTheme);
    } catch {
      toast('error', 'Failed to load homepage settings');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= layout.length) return;
    setLayout((prev) => {
      const newLayout = [...prev];
      [newLayout[index], newLayout[target]] = [newLayout[target], newLayout[index]];
      return newLayout.map((s, i) => ({ ...s, displayOrder: i }));
    });
  };

  const toggleActive = (id: string) => {
    setLayout((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
    );
  };

  const saveLayout = async () => {
    setSaving(true);
    try {
      await homepageApi.adminUpdateLayout(layout as unknown as Record<string, unknown>[]);
      toast('success', 'Layout saved');
    } catch {
      toast('error', 'Failed to save layout');
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

  const THEME_LABELS: Record<string, { label: string; color: string }> = {
    BOLD_VIBRANT: { label: 'Bold & Vibrant', color: '#D4A017' },
    WARM_EARTHY: { label: 'Warm & Earthy', color: '#E07A2F' },
    MODERN_PUNCHY: { label: 'Modern & Punchy', color: '#1B4965' },
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Homepage Management" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Homepage' }]} />

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: '/admin/homepage/featured', label: 'Featured Products', icon: '⭐' },
          { href: '/admin/homepage/countries', label: 'Country Categories', icon: '🌍' },
          { href: '/admin/homepage/collections', label: 'Collections', icon: '👗' },
          { href: '/admin/homepage/theme', label: 'Theme Settings', icon: '🎨' },
          { href: '/admin/homepage/collection-posts', label: 'Collection Stories', icon: '📝' },
          { href: '/admin/homepage/heritage', label: 'Heritage Stories', icon: '🏺' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col items-center gap-2 hover:border-indigo-300 hover:shadow-sm transition-all text-center"
          >
            <span className="text-3xl">{item.icon}</span>
            <span className="text-sm font-medium text-neutral-700">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Active theme badge */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-4">
        <span className="text-sm font-medium text-neutral-600">Active Theme:</span>
        <span
          className="px-3 py-1 rounded-full text-white text-sm font-semibold"
          style={{ backgroundColor: THEME_LABELS[themeKey]?.color ?? '#6B7280' }}
        >
          {THEME_LABELS[themeKey]?.label ?? themeKey}
        </span>
        <Link href="/admin/homepage/theme" className="text-sm text-indigo-600 hover:underline ml-auto">
          Change theme →
        </Link>
      </div>

      {/* Layout ordering */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-800">Homepage Section Order</h2>
          <button
            onClick={saveLayout}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Order'}
          </button>
        </div>

        {layout.length === 0 ? (
          <p className="text-sm text-neutral-500">No layout sections configured yet.</p>
        ) : (
          <ul className="space-y-2">
            {layout.map((section, index) => (
              <li
                key={section.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-neutral-100 bg-neutral-50"
              >
                <span className="text-neutral-400 text-sm w-6 text-center">{index + 1}</span>
                <span className="flex-1 text-sm font-medium text-neutral-700">
                  {SECTION_LABELS[section.sectionType] ?? section.sectionType}
                </span>
                <button
                  onClick={() => toggleActive(section.id)}
                  className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                    section.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {section.isActive ? 'Active' : 'Hidden'}
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 transition-colors"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    disabled={index === layout.length - 1}
                    className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 transition-colors"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { homepageAdminApi } from '../../../lib/api';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

interface LayoutSection {
  type: string;
  isActive: boolean;
  order: number;
}

const SECTION_LABELS: Record<string, string> = {
  HERO_BANNER: '🖼️ Hero Banner',
  FEATURED_PRODUCTS: '⭐ Featured Products',
  COUNTRY_CATEGORIES: '🌍 Country Categories',
  COLLECTIONS: '👗 Collections',
  NEWSLETTER: '📧 Newsletter',
};

const ADMIN_LINKS = [
  { href: '/admin/homepage/theme', label: '🎨 Theme Settings' },
  { href: '/admin/homepage/featured', label: '⭐ Featured Products' },
  { href: '/admin/homepage/countries', label: '🌍 Country Heroes' },
  { href: '/admin/homepage/collections', label: '👗 Collections' },
];

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<LayoutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    homepageAdminApi
      .getLayout()
      .then((r) => {
        const data = r.data;
        const raw: LayoutSection[] = Array.isArray(data?.sections) ? data.sections : Array.isArray(data) ? data : [];
        setSections([...raw].sort((a, b) => a.order - b.order));
      })
      .catch(() => toast('error', 'Failed to load layout'))
      .finally(() => setLoading(false));
  }, [toast]);

  const toggleSection = (type: string) => {
    setSections((prev) =>
      prev.map((s) => (s.type === type ? { ...s, isActive: !s.isActive } : s)),
    );
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    setSections((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await homepageAdminApi.updateLayout(sections as unknown as Record<string, unknown>[]);
      toast('success', 'Homepage layout saved');
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

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Homepage Manager" />

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ADMIN_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-center gap-2 bg-white border border-neutral-200 rounded-xl p-4 text-sm font-medium text-neutral-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Layout order */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-neutral-800">Section Order &amp; Visibility</h2>
        <p className="text-sm text-neutral-500">Drag sections or use arrows to reorder. Toggle to show/hide.</p>

        <div className="space-y-2">
          {sections.map((section, index) => (
            <div
              key={section.type}
              className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3"
            >
              <span className="text-neutral-400 font-mono text-xs w-5">{section.order}</span>
              <span className="flex-1 text-sm font-medium text-neutral-800">
                {SECTION_LABELS[section.type] ?? section.type}
              </span>

              {/* Active toggle */}
              <button
                role="switch"
                aria-checked={section.isActive}
                onClick={() => toggleSection(section.type)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                  section.isActive ? 'bg-indigo-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    section.isActive ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>

              {/* Move buttons */}
              <div className="flex gap-1">
                <button
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 text-neutral-500"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === sections.length - 1}
                  className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 text-neutral-500"
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
            Save Layout
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { fabricsApi, designsApi, readyToWearApi } from '../../../lib/api';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/ui/Toast';

interface CountSummary {
  fabrics: number;
  readyToWear: number;
  designs: number;
}

export default function AdminProductsPage() {
  const [counts, setCounts] = useState<CountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    try {
      const [fabricsRes, rtwRes, designsRes] = await Promise.all([
        fabricsApi.list({ limit: 1, includeInactive: true }),
        readyToWearApi.list({ limit: 1, includeInactive: true }),
        designsApi.list({ limit: 1, includeInactive: true }),
      ]);
      setCounts({
        fabrics: fabricsRes.total,
        readyToWear: rtwRes.total,
        designs: designsRes.total,
      });
    } catch {
      toast('error', 'Failed to load product counts');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const sections = [
    {
      href: '/admin/products/fabrics',
      label: 'Fabrics',
      icon: '🧵',
      count: counts?.fabrics,
      description: 'Manage fabric inventory uploaded by fabric sellers',
    },
    {
      href: '/admin/products/ready-to-wear',
      label: 'Ready-to-Wear',
      icon: '👗',
      count: counts?.readyToWear,
      description: 'Manage ready-to-wear products uploaded by designers',
    },
    {
      href: '/admin/products/designs',
      label: 'Designs',
      icon: '🎨',
      count: counts?.designs,
      description: 'Manage custom designs uploaded by designers',
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Products' }]}
      />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="bg-white rounded-xl border border-neutral-200 p-6 flex flex-col items-center gap-3 hover:border-indigo-300 hover:shadow-sm transition-all text-center"
            >
              <span className="text-4xl">{s.icon}</span>
              <span className="text-lg font-semibold text-neutral-800">{s.label}</span>
              {s.count !== undefined && (
                <span className="text-3xl font-bold text-indigo-600">{s.count.toLocaleString()}</span>
              )}
              <span className="text-sm text-neutral-500">{s.description}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

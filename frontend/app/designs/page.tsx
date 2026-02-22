'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { designsApi } from '../../lib/api';
import { Spinner } from '../../components/ui/Spinner';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import type { Design } from '../../types';

const CATEGORIES = ['All', 'Dresses', 'Tops', 'Jackets', 'Gowns', 'Sets', 'Accessories', 'Trousers'];

export default function DesignsBrowsePage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const loadDesigns = () => {
    setLoading(true);
    designsApi.list({ search: search || undefined, category: category || undefined, page, limit })
      .then((res) => { setDesigns(res.items); setTotal(res.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDesigns(); }, [search, category, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-2">Designs</h1>
          <p className="text-neutral-500">Browse custom design templates — order to have one made to your measurements.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search designs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat === 'All' ? '' : cat); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                (cat === 'All' && !category) || category === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">No designs found.</div>
        ) : (
          <>
            <p className="text-sm text-neutral-500 mb-4">{total} design{total !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {designs.map((design) => (
                <Link
                  key={design.id}
                  href={`/designs/${design.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[3/4] bg-neutral-50 overflow-hidden">
                    {design.images?.[0] ? (
                      <img
                        src={design.images[0]}
                        alt={design.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🎨</div>
                    )}
                  </div>
                  <div className="p-4">
                    {design.category && (
                      <Badge variant="secondary" className="mb-2">{design.category}</Badge>
                    )}
                    <h3 className="font-semibold text-neutral-900 text-sm leading-tight mb-1 line-clamp-2">{design.name}</h3>
                    <PriceDisplay amount={design.customerPrice} className="text-indigo-600 font-bold text-sm" />
                    {design.designer && (
                      <p className="text-xs text-neutral-400 mt-1">by {design.designer.firstName} {design.designer.lastName}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <span className="px-4 py-2 text-sm text-neutral-600">Page {page} of {totalPages}</span>
                <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

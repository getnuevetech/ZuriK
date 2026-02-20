'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchApi } from '../../lib/api';
import { useCart } from '../../lib/cart-context';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Spinner';
import { ProductCard } from '../../components/products/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { FilterSidebar } from '../../components/search/FilterSidebar';
import { SortDropdown } from '../../components/search/SortDropdown';
import { ActiveFilters } from '../../components/search/ActiveFilters';
import type { Product, SearchFilters, AvailableFilters } from '../../types';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtersFromParams = useCallback((): SearchFilters => {
    const sizes = searchParams.get('sizes');
    return {
      q: searchParams.get('q') ?? searchParams.get('search') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      fabricType: searchParams.get('fabricType') ?? undefined,
      region: searchParams.get('region') ?? undefined,
      designerId: searchParams.get('designerId') ?? undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
      inStock: searchParams.get('inStock') === 'true' ? true : undefined,
      sizes: sizes ? sizes.split(',') : undefined,
      sortBy: (searchParams.get('sortBy') as SearchFilters['sortBy']) ?? 'newest',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: 20,
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<SearchFilters>(filtersFromParams);

  useEffect(() => {
    setFilters(filtersFromParams());
  }, [filtersFromParams]);

  useEffect(() => {
    setLoading(true);
    searchApi.searchProducts(filters)
      .then((data) => {
        setProducts(data.products);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setAvailableFilters(data.filters);
      })
      .catch(() => toast('error', 'Failed to load products'))
      .finally(() => setLoading(false));
  }, [filters, toast]);

  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    const next: SearchFilters = { ...filters, ...updates, page: 1 };
    const params = new URLSearchParams();
    const add = (k: string, v: string | undefined) => { if (v) params.set(k, v); };
    add('q', next.q);
    add('category', next.category);
    add('fabricType', next.fabricType);
    add('region', next.region);
    add('designerId', next.designerId);
    if (next.minPrice !== undefined) params.set('minPrice', String(next.minPrice));
    if (next.maxPrice !== undefined) params.set('maxPrice', String(next.maxPrice));
    if (next.rating !== undefined) params.set('rating', String(next.rating));
    if (next.inStock) params.set('inStock', 'true');
    if (next.sizes && next.sizes.length > 0) params.set('sizes', next.sizes.join(','));
    if (next.sortBy && next.sortBy !== 'newest') params.set('sortBy', next.sortBy);
    if (next.page && next.page > 1) params.set('page', String(next.page));
    router.replace(`/products${params.toString() ? `?${params}` : ''}`, { scroll: false });
  }, [filters, router]);

  const handleClearFilters = () => {
    router.replace('/products', { scroll: false });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.customerPrice,
      quantity: 1,
      type: 'ready-to-wear',
      image: product.images?.[0],
      designId: product.id,
    });
    toast('success', `${product.name} added to cart`);
  };

  const currentPage = filters.page ?? 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-1">Products</h1>
        <p className="text-neutral-500">Explore our collection of authentic African fashion</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterSidebar
            filters={filters}
            available={availableFilters}
            onChange={updateFilters}
            onClear={handleClearFilters}
          />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-neutral-300 rounded-lg hover:border-primary-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters
              </button>
              <p className="text-sm text-neutral-500">
                {loading ? '...' : `${total} product${total !== 1 ? 's' : ''}`}
              </p>
            </div>
            <SortDropdown value={filters.sortBy} onChange={(sortBy) => updateFilters({ sortBy })} />
          </div>

          {/* Active filters */}
          <div className="mb-4">
            <ActiveFilters filters={filters} onChange={updateFilters} onClear={handleClearFilters} />
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              message="Try adjusting your filters or search term"
              icon="👗"
              actionLabel="Clear Filters"
              actionHref="/products"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 mt-10">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-2 text-sm rounded-lg border border-neutral-300 disabled:opacity-40 hover:border-primary-400 transition-colors"
                  >
                    ‹ Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const pg = i + 1;
                    return (
                      <button
                        key={pg}
                        onClick={() => handlePageChange(pg)}
                        className={[
                          'px-3 py-2 text-sm rounded-lg border transition-colors',
                          pg === currentPage
                            ? 'bg-primary-600 text-white border-primary-600 font-medium'
                            : 'border-neutral-300 hover:border-primary-400',
                        ].join(' ')}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  {totalPages > 7 && <span className="px-2 text-neutral-400">…</span>}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-2 text-sm rounded-lg border border-neutral-300 disabled:opacity-40 hover:border-primary-400 transition-colors"
                  >
                    Next ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full bg-white h-full overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <span className="font-semibold text-neutral-800">Filters</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
                aria-label="Close filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar
                filters={filters}
                available={availableFilters}
                onChange={(f) => { updateFilters(f); setMobileFiltersOpen(false); }}
                onClear={() => { handleClearFilters(); setMobileFiltersOpen(false); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner size="lg" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

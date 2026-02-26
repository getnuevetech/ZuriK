'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fabricsApi } from '../../lib/api';
import { useCart } from '../../lib/cart-context';
import { useToast } from '../../components/ui/Toast';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { Select } from '../../components/ui/Select';
import { FabricCard } from '../../components/fabrics/FabricCard';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterPanel } from '../../components/common/FilterPanel';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { ActiveFilters, FilterTag } from '../../components/common/ActiveFilters';
import type { Fabric } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { useCurrency } from '../../lib/currency-context';

const MATERIALS = ['Cotton', 'Silk', 'Ankara', 'Kente', 'Adire', 'Aso-oke', 'Linen', 'Velvet', 'Other'];
const PATTERNS = ['Plain', 'Printed', 'Woven', 'Embroidered', 'Batik', 'Tie-dye', 'Geometric', 'Floral'];
const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Senegal', 'Ethiopia', 'Tanzania', 'Egypt', 'Morocco'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name_asc', label: 'Name: A → Z' },
];

const FILTER_CONFIGS = [
  { key: 'material', label: 'Material', type: 'select' as const, options: MATERIALS.map((m) => ({ value: m, label: m })) },
  { key: 'pattern', label: 'Pattern', type: 'select' as const, options: PATTERNS.map((p) => ({ value: p, label: p })) },
  { key: 'price', label: 'Price Range', type: 'range' as const },
  { key: 'inStock', label: 'In Stock Only', type: 'checkbox' as const },
];


function FabricsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { currencySymbol } = useCurrency();

  const [items, setItems] = useState<Fabric[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
  const [filterValues, setFilterValues] = useState<Record<string, string | number | boolean>>({
    material: searchParams.get('material') ?? '',
    pattern: searchParams.get('pattern') ?? '',
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : '',
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : '',
    inStock: searchParams.get('inStock') === 'true',
  });

  const debouncedSearch = useDebounce(search, 300);

  const fetchFabrics = useCallback(() => {
    setLoading(true);
    fabricsApi.list({
      search: debouncedSearch || undefined,
      material: filterValues.material ? String(filterValues.material) : undefined,
      pattern: filterValues.pattern ? String(filterValues.pattern) : undefined,
      minPrice: filterValues.priceMin !== '' ? Number(filterValues.priceMin) : undefined,
      maxPrice: filterValues.priceMax !== '' ? Number(filterValues.priceMax) : undefined,
      inStock: filterValues.inStock ? true : undefined,
      sort: sort || undefined,
      page,
      limit: 20,
    })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(() => toast('error', 'Failed to load fabrics'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, filterValues, sort, page, toast]);

  useEffect(() => {
    fetchFabrics();
  }, [fetchFabrics]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (sort && sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    if (filterValues.material) params.set('material', String(filterValues.material));
    if (filterValues.pattern) params.set('pattern', String(filterValues.pattern));
    if (filterValues.inStock) params.set('inStock', 'true');
    if (filterValues.priceMin !== '') params.set('priceMin', String(filterValues.priceMin));
    if (filterValues.priceMax !== '') params.set('priceMax', String(filterValues.priceMax));
    router.replace(`/fabrics${params.toString() ? `?${params}` : ''}`, { scroll: false });
  }, [debouncedSearch, sort, page, filterValues, router]);

  const handleOrder = (fabric: Fabric) => {
    addToCart({
      id: fabric.id,
      name: fabric.name,
      price: fabric.customerPrice,
      quantity: 1,
      type: 'fabric-only',
      image: fabric.images?.[0],
      fabricId: fabric.id,
    });
    toast('success', `${fabric.name} added to cart`);
  };

  const handleFilterChange = (key: string, value: string | number | boolean) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterValues({ material: '', pattern: '', priceMin: '', priceMax: '', inStock: false });
    setSearch('');
    setSort('newest');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build active filter tags
  const activeTags: FilterTag[] = [];
  if (filterValues.material) activeTags.push({ key: 'material', label: 'Material', value: String(filterValues.material) });
  if (filterValues.pattern) activeTags.push({ key: 'pattern', label: 'Pattern', value: String(filterValues.pattern) });
  if (filterValues.priceMin !== '') activeTags.push({ key: 'priceMin', label: 'Min Price', value: `${currencySymbol}${filterValues.priceMin}` });
  if (filterValues.priceMax !== '') activeTags.push({ key: 'priceMax', label: 'Max Price', value: `${currencySymbol}${filterValues.priceMax}` });

  const handleRemoveFilter = (key: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: key === 'inStock' ? false : '' }));
    setPage(1);
  };

  return (
    <div className="catalog-shell">
      <div className="catalog-hero mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-primary)]/70 font-semibold mb-2">
          Textile Library
        </p>
        <h1 className="catalog-hero-title font-heading font-semibold mb-2">Premium Fabrics</h1>
        <p className="catalog-hero-copy">Authentic African textiles — Ankara, Kente, Adire and more.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search fabrics..." initialValue={search} />
        </div>
        <div className="w-full sm:w-48">
          <Select options={SORT_OPTIONS} value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} placeholder="Sort by" />
        </div>
      </div>

      <div className="mb-4">
        <FilterPanel filters={FILTER_CONFIGS} values={filterValues} onChange={handleFilterChange} onClear={handleClearFilters} />
      </div>

      <ActiveFilters filters={activeTags} onRemove={handleRemoveFilter} onClearAll={handleClearFilters} />

      {loading ? (
        <SkeletonGrid count={6} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No fabrics found"
          message={activeTags.length === 0 && !debouncedSearch ? 'Fabric sellers are coming soon!' : 'Try adjusting your filters or search term'}
          icon="🧵"
          actionLabel={activeTags.length > 0 || debouncedSearch ? 'Clear Filters' : undefined}
          actionHref={activeTags.length > 0 || debouncedSearch ? '/fabrics' : undefined}
        />
      ) : (
        <>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            {total} fabric{total !== 1 ? 's' : ''} found
            {totalPages > 1 && ` — page ${page} of ${totalPages}`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((fabric) => (
              <FabricCard key={fabric.id} fabric={fabric} onOrder={handleOrder} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} disabled={loading} />
        </>
      )}
    </div>
  );
}

export default function FabricsPage() {
  return (
    <Suspense fallback={<div className="catalog-shell"><SkeletonGrid count={6} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" /></div>}>
      <FabricsContent />
    </Suspense>
  );
}

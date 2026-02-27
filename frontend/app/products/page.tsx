'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productsApi, recentlyViewedApi } from '../../lib/api';
import { useCart } from '../../lib/cart-context';
import { useToast } from '../../components/ui/Toast';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { Select } from '../../components/ui/Select';
import { ProductCard } from '../../components/products/ProductCard';
import { RecentlyViewedCarousel } from '../../components/products/RecentlyViewedCarousel';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterPanel } from '../../components/common/FilterPanel';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { ActiveFilters, FilterTag } from '../../components/common/ActiveFilters';
import { useAuth } from '../../lib/auth-context';
import { getLocalRecentlyViewed, clearLocalRecentlyViewed } from '../../lib/recently-viewed-local';
import type { Product } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { useCurrency } from '../../lib/currency-context';

const CATEGORIES = ['Ankara', 'Kente', 'Dashiki', 'Kaftan', 'Agbada', 'Boubou', 'Aso-oke', 'Other'];
const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Senegal', 'Ethiopia', 'Tanzania', 'Egypt', 'Morocco', 'Cameroon', 'Ivory Coast', 'Mali', 'DR Congo'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name_asc', label: 'Name: A → Z' },
  { value: 'rating_desc', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const FILTER_CONFIGS = [
  { key: 'category', label: 'Category', type: 'select' as const, options: CATEGORIES.map((c) => ({ value: c, label: c })) },
  { key: 'country', label: 'Country', type: 'select' as const, options: COUNTRIES.map((c) => ({ value: c, label: c })) },
  { key: 'price', label: 'Price Range', type: 'range' as const },
];

const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '4', label: '4+ stars' },
  { value: '3', label: '3+ stars' },
  { value: '2', label: '2+ stars' },
];


function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { currencySymbol } = useCurrency();

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
  const [minRating, setMinRating] = useState(searchParams.get('minRating') ?? '');
  const [filterValues, setFilterValues] = useState<Record<string, string | number | boolean>>({
    category: searchParams.get('category') ?? '',
    country: searchParams.get('country') ?? '',
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : '',
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : '',
  });

  const debouncedSearch = useDebounce(search, 300);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productsApi.list({
      search: debouncedSearch || undefined,
      category: filterValues.category ? String(filterValues.category) : undefined,
      country: filterValues.country ? String(filterValues.country) : undefined,
      minPrice: filterValues.priceMin !== '' ? Number(filterValues.priceMin) : undefined,
      maxPrice: filterValues.priceMax !== '' ? Number(filterValues.priceMax) : undefined,
      sort: sort || undefined,
      minRating: minRating ? Number(minRating) : undefined,
      page,
      limit: 20,
    })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(() => toast('error', 'Failed to load products'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, filterValues, sort, minRating, page, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Load recently viewed products
  useEffect(() => {
    if (isAuthenticated) {
      recentlyViewedApi.list(10).then(setRecentlyViewed).catch(() => {});
    } else {
      const localIds = getLocalRecentlyViewed();
      if (localIds.length > 0) {
        Promise.all(localIds.slice(0, 10).map((id) => productsApi.get(id).catch(() => null)))
          .then((results) => setRecentlyViewed(results.filter(Boolean) as Product[]))
          .catch(() => {});
      }
    }
  }, [isAuthenticated]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (sort && sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    if (minRating) params.set('minRating', minRating);
    if (filterValues.category) params.set('category', String(filterValues.category));
    if (filterValues.country) params.set('country', String(filterValues.country));
    if (filterValues.priceMin !== '') params.set('priceMin', String(filterValues.priceMin));
    if (filterValues.priceMax !== '') params.set('priceMax', String(filterValues.priceMax));
    router.replace(`/products${params.toString() ? `?${params}` : ''}`, { scroll: false });
  }, [debouncedSearch, sort, page, minRating, filterValues, router]);

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

  const handleFilterChange = (key: string, value: string | number | boolean) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterValues({ category: '', country: '', priceMin: '', priceMax: '' });
    setSearch('');
    setSort('newest');
    setMinRating('');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build active filter tags
  const activeTags: FilterTag[] = [];
  if (filterValues.category) activeTags.push({ key: 'category', label: 'Category', value: String(filterValues.category) });
  if (filterValues.country) activeTags.push({ key: 'country', label: 'Country', value: String(filterValues.country) });
  if (filterValues.priceMin !== '') activeTags.push({ key: 'priceMin', label: 'Min Price', value: `${currencySymbol}${filterValues.priceMin}` });
  if (filterValues.priceMax !== '') activeTags.push({ key: 'priceMax', label: 'Max Price', value: `${currencySymbol}${filterValues.priceMax}` });
  if (minRating) activeTags.push({ key: 'minRating', label: 'Min Rating', value: `${minRating}★` });

  const handleRemoveFilter = (key: string) => {
    if (key === 'minRating') {
      setMinRating('');
    } else {
      setFilterValues((prev) => ({ ...prev, [key]: '' }));
    }
    setPage(1);
  };

  return (
    <div className="catalog-shell">
      <div className="catalog-hero mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-primary)]/70 font-semibold mb-2">
          Ready-to-Wear Collection
        </p>
        <h1 className="catalog-hero-title font-heading font-semibold mb-2">Products</h1>
        <p className="catalog-hero-copy">Explore our collection of authentic African fashion curated with premium craft.</p>
      </div>

      {/* Search + Sort + Rating bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search products..." initialValue={search} />
        </div>
        <div className="w-full sm:w-40">
          <Select
            options={RATING_OPTIONS}
            value={minRating}
            onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
            placeholder="Min rating"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={SORT_OPTIONS}
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            placeholder="Sort by"
          />
        </div>
      </div>

      {/* Filter panel */}
      <div className="mb-4">
        <FilterPanel
          filters={FILTER_CONFIGS}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      </div>

      {/* Active filter tags */}
      <ActiveFilters filters={activeTags} onRemove={handleRemoveFilter} onClearAll={handleClearFilters} />

      {/* Recently viewed section */}
      {recentlyViewed.length > 0 && (
        <div className="mb-8">
          <RecentlyViewedCarousel
            products={recentlyViewed}
            onClear={() => {
              if (isAuthenticated) {
                recentlyViewedApi.clear().catch(() => {});
              } else {
                clearLocalRecentlyViewed();
              }
              setRecentlyViewed([]);
            }}
          />
        </div>
      )}

      {loading ? (
        <SkeletonGrid count={8} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No products found"
          message={activeTags.length === 0 && !debouncedSearch ? 'Check back soon for new arrivals' : 'Try adjusting your filters or search term'}
          icon="👗"
          actionLabel={activeTags.length > 0 || debouncedSearch ? 'Clear Filters' : undefined}
          actionHref={activeTags.length > 0 || debouncedSearch ? '/products' : undefined}
        />
      ) : (
        <>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            {total} product{total !== 1 ? 's' : ''} found
            {totalPages > 1 && ` — page ${page} of ${totalPages}`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} disabled={loading} />
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="catalog-shell"><SkeletonGrid count={8} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

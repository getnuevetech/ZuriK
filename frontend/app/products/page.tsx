'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productsApi } from '../../lib/api';
import { useCart } from '../../lib/cart-context';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Spinner';
import { Select } from '../../components/ui/Select';
import { ProductCard } from '../../components/products/ProductCard';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterPanel } from '../../components/common/FilterPanel';
import { EmptyState } from '../../components/common/EmptyState';
import type { Product } from '../../types';

const CATEGORIES = ['Ankara', 'Kente', 'Dashiki', 'Kaftan', 'Agbada', 'Boubou', 'Aso-oke', 'Other'];
const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Senegal', 'Ethiopia', 'Tanzania', 'Egypt', 'Morocco'];

const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name_asc', label: 'Name: A → Z' },
];

const FILTER_CONFIGS = [
  { key: 'category', label: 'Category', type: 'select' as const, options: CATEGORIES.map((c) => ({ value: c, label: c })) },
  { key: 'country', label: 'Country', type: 'select' as const, options: COUNTRIES.map((c) => ({ value: c, label: c })) },
  { key: 'price', label: 'Price Range', type: 'range' as const },
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? '');
  const [filterValues, setFilterValues] = useState<Record<string, string | number | boolean>>({
    category: searchParams.get('category') ?? '',
    country: searchParams.get('country') ?? '',
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : '',
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : '',
  });

  useEffect(() => {
    setLoading(true);
    productsApi.list()
      .then((data) => setProducts(data))
      .catch(() => toast('error', 'Failed to load products'))
      .finally(() => setLoading(false));
  }, [toast]);

  const applyFilters = useCallback(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (filterValues.category) result = result.filter((p) => p.category === filterValues.category);
    if (filterValues.country) result = result.filter((p) => p.country === filterValues.country);
    if (filterValues.priceMin !== '' && filterValues.priceMin !== undefined) {
      result = result.filter((p) => p.customerPrice >= Number(filterValues.priceMin));
    }
    if (filterValues.priceMax !== '' && filterValues.priceMax !== undefined) {
      result = result.filter((p) => p.customerPrice <= Number(filterValues.priceMax));
    }

    if (sort === 'price_asc') result.sort((a, b) => a.customerPrice - b.customerPrice);
    else if (sort === 'price_desc') result.sort((a, b) => b.customerPrice - a.customerPrice);
    else if (sort === 'name_asc') result.sort((a, b) => a.name.localeCompare(b.name));
    else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFiltered(result);
  }, [products, search, filterValues, sort]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    if (filterValues.category) params.set('category', String(filterValues.category));
    if (filterValues.country) params.set('country', String(filterValues.country));
    if (filterValues.priceMin !== '') params.set('priceMin', String(filterValues.priceMin));
    if (filterValues.priceMax !== '') params.set('priceMax', String(filterValues.priceMax));
    router.replace(`/products${params.toString() ? `?${params}` : ''}`, { scroll: false });
  }, [search, sort, filterValues, router]);

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
  };

  const handleClearFilters = () => {
    setFilterValues({ category: '', country: '', priceMin: '', priceMax: '' });
    setSearch('');
    setSort('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-2">Products</h1>
        <p className="text-neutral-500">Explore our collection of authentic African fashion</p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar onSearch={setSearch} placeholder="Search products..." initialValue={search} />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={SORT_OPTIONS}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            placeholder="Sort by"
          />
        </div>
      </div>

      {/* Filter panel */}
      <div className="mb-6">
        <FilterPanel
          filters={FILTER_CONFIGS}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          message={products.length === 0 ? 'Check back soon for new arrivals' : 'Try adjusting your filters or search term'}
          icon="👗"
          actionLabel={products.length > 0 ? 'Clear Filters' : undefined}
          actionHref={products.length > 0 ? '/products' : undefined}
        />
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </>
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

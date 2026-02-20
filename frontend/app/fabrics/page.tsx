'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fabricsApi } from '../../lib/api';
import { useCart } from '../../lib/cart-context';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Spinner';
import { Select } from '../../components/ui/Select';
import { FabricCard } from '../../components/fabrics/FabricCard';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterPanel } from '../../components/common/FilterPanel';
import { EmptyState } from '../../components/common/EmptyState';
import type { Fabric } from '../../types';

const MATERIALS = ['Cotton', 'Silk', 'Ankara', 'Kente', 'Adire', 'Aso-oke', 'Linen', 'Velvet', 'Other'];
const PATTERNS = ['Plain', 'Printed', 'Woven', 'Embroidered', 'Batik', 'Tie-dye', 'Geometric', 'Floral'];
const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Senegal', 'Ethiopia', 'Tanzania', 'Egypt', 'Morocco'];

const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name_asc', label: 'Name: A → Z' },
];

const FILTER_CONFIGS = [
  { key: 'material', label: 'Material', type: 'select' as const, options: MATERIALS.map((m) => ({ value: m, label: m })) },
  { key: 'pattern', label: 'Pattern', type: 'select' as const, options: PATTERNS.map((p) => ({ value: p, label: p })) },
  { key: 'country', label: 'Country', type: 'select' as const, options: COUNTRIES.map((c) => ({ value: c, label: c })) },
  { key: 'price', label: 'Price Range', type: 'range' as const },
  { key: 'inStock', label: 'In Stock Only', type: 'checkbox' as const },
];

function FabricsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [filtered, setFiltered] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? '');
  const [filterValues, setFilterValues] = useState<Record<string, string | number | boolean>>({
    material: searchParams.get('material') ?? '',
    pattern: searchParams.get('pattern') ?? '',
    country: searchParams.get('country') ?? '',
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : '',
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : '',
    inStock: searchParams.get('inStock') === 'true',
  });

  useEffect(() => {
    setLoading(true);
    fabricsApi.list()
      .then((data) => setFabrics(data))
      .catch(() => toast('error', 'Failed to load fabrics'))
      .finally(() => setLoading(false));
  }, [toast]);

  const applyFilters = useCallback(() => {
    let result = [...fabrics];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q));
    }
    if (filterValues.material) result = result.filter((f) => f.material === filterValues.material);
    if (filterValues.pattern) result = result.filter((f) => f.pattern === filterValues.pattern);
    if (filterValues.country) result = result.filter((f) => f.country === filterValues.country);
    if (filterValues.inStock) result = result.filter((f) => f.stock > 0);
    if (filterValues.priceMin !== '' && filterValues.priceMin !== undefined) {
      result = result.filter((f) => f.customerPrice >= Number(filterValues.priceMin));
    }
    if (filterValues.priceMax !== '' && filterValues.priceMax !== undefined) {
      result = result.filter((f) => f.customerPrice <= Number(filterValues.priceMax));
    }

    if (sort === 'price_asc') result.sort((a, b) => a.customerPrice - b.customerPrice);
    else if (sort === 'price_desc') result.sort((a, b) => b.customerPrice - a.customerPrice);
    else if (sort === 'name_asc') result.sort((a, b) => a.name.localeCompare(b.name));
    else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFiltered(result);
  }, [fabrics, search, filterValues, sort]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    if (filterValues.material) params.set('material', String(filterValues.material));
    if (filterValues.pattern) params.set('pattern', String(filterValues.pattern));
    if (filterValues.country) params.set('country', String(filterValues.country));
    if (filterValues.inStock) params.set('inStock', 'true');
    if (filterValues.priceMin !== '') params.set('priceMin', String(filterValues.priceMin));
    if (filterValues.priceMax !== '') params.set('priceMax', String(filterValues.priceMax));
    router.replace(`/fabrics${params.toString() ? `?${params}` : ''}`, { scroll: false });
  }, [search, sort, filterValues, router]);

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
  };

  const handleClearFilters = () => {
    setFilterValues({ material: '', pattern: '', country: '', priceMin: '', priceMax: '', inStock: false });
    setSearch('');
    setSort('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-2">Premium Fabrics</h1>
        <p className="text-neutral-500">Authentic African textiles — Ankara, Kente, Adire and more</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar onSearch={setSearch} placeholder="Search fabrics..." initialValue={search} />
        </div>
        <div className="w-full sm:w-48">
          <Select options={SORT_OPTIONS} value={sort} onChange={(e) => setSort(e.target.value)} placeholder="Sort by" />
        </div>
      </div>

      <div className="mb-6">
        <FilterPanel filters={FILTER_CONFIGS} values={filterValues} onChange={handleFilterChange} onClear={handleClearFilters} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No fabrics found"
          message={fabrics.length === 0 ? 'Fabric sellers are coming soon!' : 'Try adjusting your filters or search term'}
          icon="🧵"
          actionLabel={fabrics.length > 0 ? 'Clear Filters' : undefined}
          actionHref={fabrics.length > 0 ? '/fabrics' : undefined}
        />
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-4">{filtered.length} fabric{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((fabric) => (
              <FabricCard key={fabric.id} fabric={fabric} onOrder={handleOrder} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function FabricsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner size="lg" /></div>}>
      <FabricsContent />
    </Suspense>
  );
}

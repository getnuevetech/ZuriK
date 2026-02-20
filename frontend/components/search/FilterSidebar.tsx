'use client';

import React from 'react';
import type { SearchFilters, AvailableFilters } from '../../types';

interface FilterSidebarProps {
  filters: SearchFilters;
  available: AvailableFilters | null;
  onChange: (filters: Partial<SearchFilters>) => void;
  onClear: () => void;
}

const FABRIC_TYPES = ['Ankara', 'Kente', 'Adire', 'Aso-Oke', 'Dashiki', 'Kanga', 'Bogolan', 'Shweshwe'];
const REGIONS = ['West Africa', 'East Africa', 'Southern Africa', 'North Africa', 'Central Africa'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const RATING_OPTIONS = [4, 3, 2];

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-neutral-700 hover:text-primary-600 transition-colors"
      >
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export function FilterSidebar({ filters, available, onChange, onClear }: FilterSidebarProps) {
  const activeCount = [
    filters.category, filters.fabricType, filters.region,
    filters.minPrice !== undefined, filters.maxPrice !== undefined,
    filters.rating !== undefined, filters.inStock,
    filters.sizes && filters.sizes.length > 0,
  ].filter(Boolean).length;

  const handleSize = (size: string, checked: boolean) => {
    const current = filters.sizes ?? [];
    onChange({ sizes: checked ? [...current, size] : current.filter((s) => s !== size) });
  };

  const categories = available?.categories?.length
    ? available.categories
    : [];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <span className="font-semibold text-neutral-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="bg-primary-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">{activeCount}</span>
          )}
        </span>
        {activeCount > 0 && (
          <button type="button" onClick={onClear} className="text-xs text-neutral-500 hover:text-primary-600 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <Section title="Category">
        <div className="space-y-1.5">
          {(categories.length > 0 ? categories : []).map(({ name, count }) => (
            <label key={name} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.category === name}
                  onChange={(e) => onChange({ category: e.target.checked ? name : undefined })}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700 group-hover:text-primary-600 transition-colors">{name}</span>
              </div>
              <span className="text-xs text-neutral-400">{count}</span>
            </label>
          ))}
          {categories.length === 0 && (
            <p className="text-xs text-neutral-400 italic">No categories available</p>
          )}
        </div>
      </Section>

      {/* Price Range */}
      <Section title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            min="0"
          />
          <span className="text-neutral-400 text-sm shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            min="0"
          />
        </div>
        {available?.priceRange && (
          <p className="mt-1.5 text-xs text-neutral-400">
            Range: ₦{available.priceRange.min.toLocaleString()} – ₦{available.priceRange.max.toLocaleString()}
          </p>
        )}
      </Section>

      {/* Fabric Type */}
      <Section title="Fabric Type">
        <div className="space-y-1.5">
          {FABRIC_TYPES.map((ft) => {
            const count = available?.fabricTypes?.find((f) => f.name === ft)?.count;
            return (
              <label key={ft} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.fabricType === ft}
                    onChange={(e) => onChange({ fabricType: e.target.checked ? ft : undefined })}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700 group-hover:text-primary-600 transition-colors">{ft}</span>
                </div>
                {count !== undefined && <span className="text-xs text-neutral-400">{count}</span>}
              </label>
            );
          })}
        </div>
      </Section>

      {/* Region */}
      <Section title="Region / Origin" defaultOpen={false}>
        <div className="space-y-1.5">
          {REGIONS.map((r) => {
            const count = available?.regions?.find((x) => x.name === r)?.count;
            return (
              <label key={r} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.region === r}
                    onChange={(e) => onChange({ region: e.target.checked ? r : undefined })}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700 group-hover:text-primary-600 transition-colors">{r}</span>
                </div>
                {count !== undefined && <span className="text-xs text-neutral-400">{count}</span>}
              </label>
            );
          })}
        </div>
      </Section>

      {/* Sizes */}
      <Section title="Size" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const active = filters.sizes?.includes(size) ?? false;
            return (
              <button
                key={size}
                type="button"
                onClick={() => handleSize(size, !active)}
                className={[
                  'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                  active
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400',
                ].join(' ')}
              >
                {size}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Rating */}
      <Section title="Rating" defaultOpen={false}>
        <div className="space-y-1.5">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ rating: filters.rating === r ? undefined : r })}
              className={[
                'w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors',
                filters.rating === r
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'hover:bg-neutral-50 text-neutral-700',
              ].join(' ')}
            >
              {'★'.repeat(r)}{'☆'.repeat(5 - r)}
              <span className="text-neutral-500">&amp; up</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Availability */}
      <Section title="Availability" defaultOpen={false}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock === true}
            onChange={(e) => onChange({ inStock: e.target.checked ? true : undefined })}
            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-700">In Stock Only</span>
        </label>
      </Section>
    </div>
  );
}

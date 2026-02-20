'use client';

import React from 'react';
import type { SearchFilters } from '../../types';

interface ActiveFiltersProps {
  filters: SearchFilters;
  onChange: (filters: Partial<SearchFilters>) => void;
  onClear: () => void;
}

interface Chip {
  label: string;
  onRemove: () => void;
}

export function ActiveFilters({ filters, onChange, onClear }: ActiveFiltersProps) {
  const chips: Chip[] = [];

  if (filters.q) chips.push({ label: `Search: "${filters.q}"`, onRemove: () => onChange({ q: undefined }) });
  if (filters.category) chips.push({ label: `Category: ${filters.category}`, onRemove: () => onChange({ category: undefined }) });
  if (filters.fabricType) chips.push({ label: `Fabric: ${filters.fabricType}`, onRemove: () => onChange({ fabricType: undefined }) });
  if (filters.region) chips.push({ label: `Region: ${filters.region}`, onRemove: () => onChange({ region: undefined }) });
  if (filters.designerId) chips.push({ label: 'Designer filter', onRemove: () => onChange({ designerId: undefined }) });
  if (filters.minPrice !== undefined) chips.push({ label: `Min: ₦${filters.minPrice.toLocaleString()}`, onRemove: () => onChange({ minPrice: undefined }) });
  if (filters.maxPrice !== undefined) chips.push({ label: `Max: ₦${filters.maxPrice.toLocaleString()}`, onRemove: () => onChange({ maxPrice: undefined }) });
  if (filters.rating !== undefined) chips.push({ label: `${filters.rating}★ & up`, onRemove: () => onChange({ rating: undefined }) });
  if (filters.inStock) chips.push({ label: 'In Stock', onRemove: () => onChange({ inStock: undefined }) });
  if (filters.sizes && filters.sizes.length > 0) {
    filters.sizes.forEach((s) =>
      chips.push({
        label: `Size: ${s}`,
        onRemove: () => onChange({ sizes: filters.sizes?.filter((x) => x !== s) }),
      })
    );
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full border border-primary-200"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="ml-0.5 hover:text-primary-900 transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            ✕
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-xs text-neutral-500 hover:text-neutral-700 underline transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}

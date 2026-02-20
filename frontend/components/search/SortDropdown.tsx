'use client';

import React from 'react';
import type { SearchFilters } from '../../types';

const SORT_OPTIONS: { value: NonNullable<SearchFilters['sortBy']>; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'name_asc', label: 'Name: A–Z' },
  { value: 'name_desc', label: 'Name: Z–A' },
];

interface SortDropdownProps {
  value: SearchFilters['sortBy'];
  onChange: (sortBy: SearchFilters['sortBy']) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-neutral-600 whitespace-nowrap hidden sm:block">Sort by:</label>
      <select
        value={value ?? 'newest'}
        onChange={(e) => onChange(e.target.value as SearchFilters['sortBy'])}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

'use client';

import React from 'react';

export interface FilterTag {
  key: string;
  label: string;
  value: string;
}

interface ActiveFiltersProps {
  filters: FilterTag[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-neutral-500 font-medium">Active filters:</span>
      {filters.map((f) => (
        <span
          key={f.key}
          className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100"
        >
          {f.label}: {f.value}
          <button
            onClick={() => onRemove(f.key)}
            aria-label={`Remove ${f.label} filter`}
            className="ml-1 hover:text-indigo-900 transition-colors leading-none"
          >
            ×
          </button>
        </span>
      ))}
      {filters.length >= 2 && (
        <button
          onClick={onClearAll}
          className="text-sm text-neutral-500 hover:text-neutral-700 underline transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

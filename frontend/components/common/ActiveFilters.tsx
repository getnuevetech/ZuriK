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
      <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)] font-semibold">Active filters</span>
      {filters.map((f) => (
        <span
          key={f.key}
          className="inline-flex items-center gap-1 px-3 py-1 bg-[#f3e9db] text-[#5e4c37] rounded-full text-xs font-semibold uppercase tracking-[0.1em] border border-[#dfccb5]"
        >
          {f.label}: <span className="normal-case tracking-normal text-[11px] font-medium">{f.value}</span>
          <button
            onClick={() => onRemove(f.key)}
            aria-label={`Remove ${f.label} filter`}
            className="ml-1 hover:text-[#352b20] transition-colors leading-none text-sm"
          >
            ×
          </button>
        </span>
      ))}
      {filters.length >= 2 && (
        <button
          onClick={onClearAll}
          className="text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]/75 hover:text-[var(--color-primary)] underline transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

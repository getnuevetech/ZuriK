'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'checkbox' | 'range';
  options?: FilterOption[];
}

interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, string | number | boolean>;
  onChange: (key: string, value: string | number | boolean) => void;
  onClear: () => void;
}

export function FilterPanel({ filters, values, onChange, onClear }: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  const hasActiveFilters = Object.values(values).some((v) => v !== '' && v !== undefined && v !== false);

  return (
    <div className="catalog-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#efe5d8]">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 font-medium text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="bg-[var(--color-primary)] text-white text-xs rounded-full px-1.5 py-0.5">•</span>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-[var(--color-text-muted)]">
            Clear all
          </Button>
        )}
      </div>

      {/* Filter content */}
      {open && (
        <div className="p-4 space-y-4">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]/75 mb-1.5">{filter.label}</label>
              {filter.type === 'select' && filter.options && (
                <select
                  value={String(values[filter.key] ?? '')}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="w-full rounded-md border border-[#d9cdbd] bg-[#fffdf9] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-700"
                >
                  <option value="">All</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}
              {filter.type === 'range' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={String(values[`${filter.key}Min`] ?? '')}
                    onChange={(e) => onChange(`${filter.key}Min`, e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-md border border-[#d9cdbd] bg-[#fffdf9] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-700"
                    min="0"
                  />
                  <span className="text-[var(--color-text-muted)] text-sm">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={String(values[`${filter.key}Max`] ?? '')}
                    onChange={(e) => onChange(`${filter.key}Max`, e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-md border border-[#d9cdbd] bg-[#fffdf9] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-700"
                    min="0"
                  />
                </div>
              )}
              {filter.type === 'checkbox' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(values[filter.key])}
                    onChange={(e) => onChange(filter.key, e.target.checked)}
                    className="rounded border-[#d9cdbd] text-primary-700 focus:ring-primary-500"
                  />
                  <span className="text-sm text-[var(--color-text)]">{filter.label}</span>
                </label>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

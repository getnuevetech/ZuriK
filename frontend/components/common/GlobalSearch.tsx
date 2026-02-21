'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { searchApi } from '../../lib/api';
import type { Product } from '../../types';
import type { Fabric } from '../../types';
import { getUserDisplayName } from '../../lib/utils';

interface DesignerResult {
  id: string;
  name: string;
  country: string;
}

interface SearchResults {
  products: Product[];
  fabrics: Fabric[];
  designers: DesignerResult[];
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface GlobalSearchProps {
  onClose?: () => void;
  autoFocus?: boolean;
}

export function GlobalSearch({ onClose, autoFocus }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('search_history');
      if (stored) setSearchHistory(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      setOpen(false);
      return;
    }
    setLoading(true);
    searchApi.search(debouncedQuery, 'all', 8)
      .then(({ products, fabrics }) => {
        // Extract designers from products
        const designerMap = new Map<string, DesignerResult>();
        for (const p of products) {
          if (p.designer && !designerMap.has(p.designer.id)) {
            designerMap.set(p.designer.id, {
              id: p.designer.id,
              name: getUserDisplayName(p.designer),
              country: p.country || '',
            });
          }
        }
        setResults({
          products: products.slice(0, 4),
          fabrics: fabrics.slice(0, 4),
          designers: Array.from(designerMap.values()).slice(0, 3),
        });
        setOpen(true);
        setActiveIndex(-1);
      })
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        inputRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Build flat list of navigation targets for keyboard nav
  const allItems = results
    ? [
        ...results.products.map((p) => ({ type: 'product', id: p.id, label: p.name, href: `/products/${p.id}` })),
        ...results.fabrics.map((f) => ({ type: 'fabric', id: f.id, label: f.name, href: `/fabrics/${f.id}` })),
        ...results.designers.map((d) => ({ type: 'designer', id: d.id, label: d.name, href: `/designers/${d.id}` })),
      ]
    : [];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        onClose?.();
        return;
      }
      if (!open || allItems.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % allItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + allItems.length) % allItems.length);
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && allItems[activeIndex]) {
          router.push(allItems[activeIndex].href);
          setOpen(false);
          onClose?.();
        } else if (query.trim()) {
          router.push(`/products?search=${encodeURIComponent(query.trim())}`);
          setOpen(false);
          onClose?.();
        }
      }
    },
    [open, allItems, activeIndex, query, router, onClose]
  );

  const navigate = (href: string) => {
    if (query.trim()) {
      const updated = [query.trim(), ...searchHistory.filter((h) => h !== query.trim())].slice(0, 5);
      setSearchHistory(updated);
      try { localStorage.setItem('search_history', JSON.stringify(updated)); } catch {}
    }
    router.push(href);
    setOpen(false);
    setQuery('');
    onClose?.();
  };

  const totalResults = results
    ? results.products.length + results.fabrics.length + results.designers.length
    : 0;

  return (
    <div className="relative w-full">
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results || (!query && searchHistory.length > 0)) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search designs, fabrics, designers..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>

      {open && results && totalResults > 0 && (
        <div
          ref={dropdownRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-modal z-50 max-h-96 overflow-y-auto"
        >
          <div className="p-3 border-b border-neutral-100 text-xs text-neutral-400">
            🔍 Results for &quot;{query}&quot;
          </div>

          {results.products.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">👗 Products</div>
              {results.products.map((p, i) => {
                const globalIndex = i;
                return (
                  <button
                    key={p.id}
                    role="option"
                    aria-selected={activeIndex === globalIndex}
                    onClick={() => navigate(`/products/${p.id}`)}
                    className={[
                      'w-full text-left px-3 py-2 text-sm flex justify-between items-center hover:bg-neutral-50 transition-colors',
                      activeIndex === globalIndex ? 'bg-primary-50' : '',
                    ].join(' ')}
                  >
                    <span className="text-neutral-800">{p.name}</span>
                    <span className="text-primary-600 font-medium text-xs">₦{p.customerPrice?.toLocaleString()}</span>
                  </button>
                );
              })}
            </div>
          )}

          {results.fabrics.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider border-t border-neutral-50">🧵 Fabrics</div>
              {results.fabrics.map((f, i) => {
                const globalIndex = results.products.length + i;
                return (
                  <button
                    key={f.id}
                    role="option"
                    aria-selected={activeIndex === globalIndex}
                    onClick={() => navigate(`/fabrics/${f.id}`)}
                    className={[
                      'w-full text-left px-3 py-2 text-sm flex justify-between items-center hover:bg-neutral-50 transition-colors',
                      activeIndex === globalIndex ? 'bg-primary-50' : '',
                    ].join(' ')}
                  >
                    <span className="text-neutral-800">{f.name}</span>
                    <span className="text-secondary-600 font-medium text-xs">₦{f.customerPrice?.toLocaleString()}</span>
                  </button>
                );
              })}
            </div>
          )}

          {results.designers.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider border-t border-neutral-50">🎨 Designers</div>
              {results.designers.map((d, i) => {
                const globalIndex = results.products.length + results.fabrics.length + i;
                return (
                  <button
                    key={d.id}
                    role="option"
                    aria-selected={activeIndex === globalIndex}
                    onClick={() => navigate(`/designers/${d.id}`)}
                    className={[
                      'w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors',
                      activeIndex === globalIndex ? 'bg-primary-50' : '',
                    ].join(' ')}
                  >
                    <span className="text-neutral-800">{d.name}</span>
                    {d.country && <span className="text-neutral-400 text-xs ml-2">({d.country})</span>}
                  </button>
                );
              })}
            </div>
          )}

          <div className="px-3 py-2.5 border-t border-neutral-100">
            <button
              onClick={() => navigate(`/products?search=${encodeURIComponent(query.trim())}`)}
              className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              View all results for &quot;{query}&quot; →
            </button>
          </div>
        </div>
      )}

      {open && results && totalResults === 0 && !loading && (
        <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-modal z-50 p-6 text-center text-sm text-neutral-400">
          No results found for &quot;{query}&quot;
        </div>
      )}

      {open && !query && searchHistory.length > 0 && !results && (
        <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-modal z-50 max-h-64 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-100">
            Recent searches
          </div>
          {searchHistory.map((h) => (
            <button
              key={h}
              onClick={() => { setQuery(h); }}
              className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors"
            >
              <span className="text-neutral-400">🕐</span>
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

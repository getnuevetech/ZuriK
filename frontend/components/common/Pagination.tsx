'use client';

import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

function getPageNumbers(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | '...')[] = [];
  pages.push(1);
  if (page > 3) pages.push('...');
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    pages.push(i);
  }
  if (page < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
}

export function Pagination({ page, totalPages, onPageChange, disabled }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Previous page"
        className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] rounded-md border border-[#ddcfbf] text-[var(--color-primary)]/80 hover:bg-[#f8f1e7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>

      <div className="hidden sm:flex items-center gap-1">
        {pageNumbers.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 py-2 text-[var(--color-text-muted)] text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              disabled={disabled}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              className={[
                'w-9 h-9 text-sm font-medium rounded-md transition-colors',
                p === page
                  ? 'bg-[var(--color-primary)] text-white border border-[var(--color-primary)]'
                  : 'border border-[#ddcfbf] text-[var(--color-primary)]/80 hover:bg-[#f8f1e7]',
                disabled ? 'opacity-40 cursor-not-allowed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {p}
            </button>
          )
        )}
      </div>

      <span className="sm:hidden text-sm text-[var(--color-text-muted)] px-3">
        {page} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label="Next page"
        className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] rounded-md border border-[#ddcfbf] text-[var(--color-primary)]/80 hover:bg-[#f8f1e7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </nav>
  );
}

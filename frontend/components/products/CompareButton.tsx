'use client';

import React from 'react';
import { useComparison } from '../../lib/comparison-context';
import type { Product } from '../../types';

interface CompareButtonProps {
  product: Product;
  size?: 'sm' | 'md';
  className?: string;
}

export function CompareButton({ product, size = 'sm', className = '' }: CompareButtonProps) {
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const inComparison = isInComparison(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inComparison) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product);
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <button
      onClick={handleClick}
      aria-label={inComparison ? 'Remove from comparison' : 'Add to comparison'}
      className={[
        'inline-flex items-center gap-1 font-medium rounded-md border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 uppercase tracking-[0.08em]',
        sizeClasses,
        inComparison
          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
          : 'border-[#ccd5ea] text-[var(--color-primary)] hover:bg-[#edf1fa]',
        className,
      ].join(' ')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      {inComparison ? 'Remove' : 'Compare'}
    </button>
  );
}

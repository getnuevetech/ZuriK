'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useComparison } from '../../lib/comparison-context';

export function ComparisonBar() {
  const { comparisonItems, removeFromComparison, clearComparison } = useComparison();
  const router = useRouter();

  if (comparisonItems.length === 0) return null;

  const handleCompareNow = () => {
    const ids = comparisonItems.map((p) => p.id).join(',');
    router.push(`/products/compare?ids=${ids}`);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-lg transition-transform duration-300"
      style={{ bottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Selected count */}
        <span className="text-sm font-medium text-neutral-600 shrink-0">
          {comparisonItems.length} of 4 selected
        </span>

        {/* Product thumbnails */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {comparisonItems.map((product) => (
            <div
              key={product.id}
              className="relative flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1.5 shrink-0"
            >
              <div className="relative w-8 h-8 rounded overflow-hidden bg-neutral-100 shrink-0">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-sm">👗</span>
                )}
              </div>
              <span className="text-xs font-medium text-neutral-700 max-w-[80px] truncate">
                {product.name}
              </span>
              <button
                onClick={() => removeFromComparison(product.id)}
                aria-label={`Remove ${product.name} from comparison`}
                className="text-neutral-400 hover:text-neutral-700 ml-1 shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearComparison}
            className="text-sm text-neutral-500 hover:text-neutral-700 underline"
          >
            Clear All
          </button>
          <button
            onClick={handleCompareNow}
            disabled={comparisonItems.length < 2}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Compare Now
          </button>
        </div>
      </div>
    </div>
  );
}

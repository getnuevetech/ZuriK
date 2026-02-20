'use client';

import React from 'react';
import { StarRating } from './StarRating';
import type { RatingSummary as RatingSummaryType } from '../../types';

interface RatingSummaryProps {
  summary: RatingSummaryType;
}

export function RatingSummary({ summary }: RatingSummaryProps) {
  const { averageRating, totalReviews, ratingDistribution } = summary;
  const max = Math.max(...Object.values(ratingDistribution), 1);

  return (
    <div className="flex flex-col sm:flex-row gap-8 bg-neutral-50 rounded-xl p-6 border border-neutral-200">
      {/* Average */}
      <div className="flex flex-col items-center justify-center min-w-[100px]">
        <span className="text-5xl font-bold text-neutral-900">{averageRating.toFixed(1)}</span>
        <StarRating rating={averageRating} size="md" />
        <span className="text-sm text-neutral-500 mt-1">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
      </div>

      {/* Distribution */}
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingDistribution[star] ?? 0;
          const pct = max > 0 ? (count / max) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-4 text-neutral-600 text-right">{star}</span>
              <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="flex-1 bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-2 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-neutral-500 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

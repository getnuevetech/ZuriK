'use client';

import React, { useState } from 'react';
import { getSizeChart, getRecommendedSize, SizeRecommendation } from '../../lib/size-recommendation';
import { Badge } from '../ui/Badge';

interface SizeRecommendationDisplayProps {
  chest?: number;
  waist?: number;
  hips?: number;
  unit?: 'cm' | 'inches';
}

const confidenceColors: Record<SizeRecommendation['confidence'], string> = {
  perfect: 'bg-green-100 text-green-800 border-green-200',
  'between-up': 'bg-secondary-100 text-secondary-800 border-secondary-200',
  'between-down': 'bg-secondary-100 text-secondary-800 border-secondary-200',
  outside: 'bg-accent-100 text-accent-800 border-accent-200',
};

export function SizeRecommendationDisplay({
  chest,
  waist,
  hips,
  unit = 'cm',
}: SizeRecommendationDisplayProps) {
  const [showChart, setShowChart] = useState(false);

  const recommendation = getRecommendedSize({ chest, waist, hips, unit });
  const chart = getSizeChart();

  const hasAny = chest || waist || hips;

  return (
    <div className="space-y-4">
      {/* Recommendation result */}
      {hasAny && recommendation ? (
        <div className={`rounded-xl border p-4 ${confidenceColors[recommendation.confidence]}`}>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl font-bold font-heading">{recommendation.size}</span>
            <span className="text-sm font-medium">{recommendation.message}</span>
          </div>
          {(recommendation.sizeDown || recommendation.sizeUp) && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {recommendation.sizeDown && (
                <Badge variant="secondary" className="text-xs">Size down: {recommendation.sizeDown}</Badge>
              )}
              {recommendation.sizeUp && (
                <Badge variant="secondary" className="text-xs">Size up: {recommendation.sizeUp}</Badge>
              )}
            </div>
          )}
        </div>
      ) : hasAny ? null : (
        <p className="text-sm text-neutral-500 italic">Enter your measurements above to get a size recommendation.</p>
      )}

      {/* Size chart toggle */}
      <button
        type="button"
        onClick={() => setShowChart((v) => !v)}
        className="text-sm text-primary-600 hover:underline font-medium flex items-center gap-1"
      >
        {showChart ? '▲ Hide' : '▼ View'} full size chart
      </button>

      {showChart && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-200 px-2 py-1 text-left font-semibold">Size</th>
                <th className="border border-neutral-200 px-2 py-1">Chest ({unit})</th>
                <th className="border border-neutral-200 px-2 py-1">Waist ({unit})</th>
                <th className="border border-neutral-200 px-2 py-1">Hips ({unit})</th>
              </tr>
            </thead>
            <tbody>
              {chart.map((entry) => {
                const ranges = unit === 'cm' ? entry.cm : entry.inches;
                const isRecommended = recommendation?.size === entry.label;
                return (
                  <tr
                    key={entry.label}
                    className={isRecommended ? 'bg-primary-50 font-semibold' : 'hover:bg-neutral-50'}
                  >
                    <td className="border border-neutral-200 px-2 py-1 font-medium">
                      {entry.label}
                      {isRecommended && <span className="ml-1 text-primary-600">✓</span>}
                    </td>
                    <td className="border border-neutral-200 px-2 py-1 text-center">
                      {ranges.chest.min}–{ranges.chest.max}
                    </td>
                    <td className="border border-neutral-200 px-2 py-1 text-center">
                      {ranges.waist.min}–{ranges.waist.max}
                    </td>
                    <td className="border border-neutral-200 px-2 py-1 text-center">
                      {ranges.hips.min}–{ranges.hips.max}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

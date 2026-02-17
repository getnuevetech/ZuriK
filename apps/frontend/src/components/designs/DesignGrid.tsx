import React from 'react';
import { Design } from '@/types';
import DesignCard from './DesignCard';

interface DesignGridProps {
  designs: Design[];
}

export default function DesignGrid({ designs }: DesignGridProps) {
  if (designs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No designs found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {designs.map((design) => (
        <DesignCard key={design.id} design={design} />
      ))}
    </div>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { mockDesigns } from '@/data/mockDesigns';
import { DesignFilters } from '@/types';
import DesignFilter from '@/components/designs/DesignFilter';
import DesignGrid from '@/components/designs/DesignGrid';
import { FiSliders } from 'react-icons/fi';
import Button from '@/components/ui/Button';

function DesignsPageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<DesignFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const country = searchParams.get('country');
    const search = searchParams.get('search');

    setFilters({
      ...(category && { category }),
      ...(country && { country }),
      ...(search && { search }),
    });
  }, [searchParams]);

  // Filter and sort designs
  const filteredDesigns = mockDesigns.filter((design) => {
    if (filters.category && design.category !== filters.category) return false;
    if (filters.country && design.country !== filters.country) return false;
    if (filters.designer && design.designer.name !== filters.designer) return false;
    if (filters.minPrice && design.price < filters.minPrice) return false;
    if (filters.maxPrice && design.price > filters.maxPrice) return false;
    if (filters.inStock && !design.inStock) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        design.name.toLowerCase().includes(searchLower) ||
        design.description.toLowerCase().includes(searchLower) ||
        design.designer.name.toLowerCase().includes(searchLower) ||
        design.tags.some((tag) => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }
    return true;
  });

  // Sort designs
  const sortedDesigns = [...filteredDesigns].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'featured':
      default:
        return b.featured === a.featured ? 0 : b.featured ? -1 : 1;
    }
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-african-dark mb-4">
            Discover African Designs
          </h1>
          <p className="text-gray-600">
            Browse our collection of {mockDesigns.length} authentic African fashion pieces
          </p>
        </div>

        {/* Filters and Results */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <DesignFilter filters={filters} onFilterChange={setFilters} />
          </aside>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="w-full mb-4"
            >
              <FiSliders className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {showFilters && (
              <div className="mb-4">
                <DesignFilter filters={filters} onFilterChange={setFilters} />
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Count */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-gray-600">
                <span className="font-semibold text-african-dark">
                  {sortedDesigns.length}
                </span>{' '}
                designs found
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Design Grid */}
            <DesignGrid designs={sortedDesigns} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesignsPage() {
  return (
    <Suspense fallback={
      <div className="bg-gray-50 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading designs...</p>
        </div>
      </div>
    }>
      <DesignsPageContent />
    </Suspense>
  );
}

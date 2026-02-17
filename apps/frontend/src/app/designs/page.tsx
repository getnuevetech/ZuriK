'use client';

import { useState, useMemo } from 'react';
import { Header, Footer } from '@/components/common';
import { DesignGrid, DesignFilter } from '@/components/designs';
import { mockDesigns } from '@/data/mockDesigns';
import { DesignFilters } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';

const ITEMS_PER_PAGE = 12;

export default function DesignsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<DesignFilters>({
    sortBy: 'newest',
    sortOrder: 'desc',
  });

  // Filter and sort designs
  const filteredDesigns = useMemo(() => {
    let result = [...mockDesigns];

    // Apply category filter
    if (filters.category) {
      result = result.filter((design) => design.category === filters.category);
    }

    // Apply country filter
    if (filters.country) {
      result = result.filter((design) => design.country === filters.country);
    }

    // Apply fabric type filter
    if (filters.fabricType) {
      result = result.filter((design) =>
        design.compatibleFabrics.some(
          (fabric) => fabric.fabricType === filters.fabricType
        )
      );
    }

    // Apply price range filter
    if (filters.minPrice !== undefined) {
      const minPrice = filters.minPrice;
      result = result.filter((design) => design.price >= minPrice);
    }
    if (filters.maxPrice !== undefined) {
      const maxPrice = filters.maxPrice;
      result = result.filter((design) => design.price <= maxPrice);
    }

    // Apply sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'rating':
            comparison = a.rating - b.rating;
            break;
          case 'newest':
            comparison = b.createdAt.getTime() - a.createdAt.getTime();
            break;
          case 'popular':
            comparison = b.reviewCount - a.reviewCount;
            break;
        }

        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [filters]);

  // Pagination
  const totalPages = Math.ceil(filteredDesigns.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDesigns = filteredDesigns.slice(startIndex, endIndex);

  const handleFilterChange = (newFilters: DesignFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      sortBy: 'newest',
      sortOrder: 'desc',
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-dark mb-2">
              Explore Designs
            </h1>
            <p className="text-gray-600 text-lg">
              Discover unique African-inspired fashion designs from talented designers
            </p>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filters */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="sticky top-24">
                <DesignFilter
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </aside>

            {/* Main Area - Design Grid */}
            <div className="flex-1">
              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredDesigns.length)} of{' '}
                  {filteredDesigns.length} designs
                </p>
              </div>

              {/* Design Grid */}
              <DesignGrid designs={paginatedDesigns} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first, last, current, and pages around current
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1;

                      if (!showPage) {
                        // Show ellipsis for gaps
                        if (page === 2 || page === totalPages - 1) {
                          return (
                            <span key={page} className="px-3 py-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          variant={currentPage === page ? 'primary' : 'outline'}
                          size="sm"
                          className={
                            currentPage === page
                              ? 'bg-gold text-dark hover:bg-gold-dark'
                              : ''
                          }
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

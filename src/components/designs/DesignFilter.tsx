'use client';

import React from 'react';
import { DesignFilters } from '@/types';
import { DESIGN_CATEGORIES, AFRICAN_COUNTRIES, PRICE_RANGES } from '@/utils/constants';
import Button from '@/components/ui/Button';

interface DesignFilterProps {
  filters: DesignFilters;
  onFilterChange: (filters: DesignFilters) => void;
}

export default function DesignFilter({ filters, onFilterChange }: DesignFilterProps) {
  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category: filters.category === category ? undefined : category,
    });
  };

  const handleCountryChange = (country: string) => {
    onFilterChange({
      ...filters,
      country: filters.country === country ? undefined : country,
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onFilterChange({
      ...filters,
      minPrice: min,
      maxPrice: max === Infinity ? undefined : max,
    });
  };

  const handleStockChange = () => {
    onFilterChange({
      ...filters,
      inStock: filters.inStock ? undefined : true,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-african-dark">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gold hover:text-gold-dark"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Category</h4>
        <div className="space-y-2">
          {DESIGN_CATEGORIES.slice(0, 6).map((category) => (
            <label
              key={category}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.category === category}
                onChange={() => handleCategoryChange(category)}
                className="mr-2 text-gold focus:ring-gold"
              />
              <span className="text-sm text-gray-600 group-hover:text-gold">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Country Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Country</h4>
        <div className="space-y-2">
          {AFRICAN_COUNTRIES.slice(0, 6).map((country) => (
            <label
              key={country}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.country === country}
                onChange={() => handleCountryChange(country)}
                className="mr-2 text-gold focus:ring-gold"
              />
              <span className="text-sm text-gray-600 group-hover:text-gold">
                {country}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h4>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <label
              key={range.label}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="radio"
                name="priceRange"
                checked={filters.minPrice === range.min && (filters.maxPrice === range.max || (range.max === Infinity && !filters.maxPrice))}
                onChange={() => handlePriceRangeChange(range.min, range.max)}
                className="mr-2 text-gold focus:ring-gold"
              />
              <span className="text-sm text-gray-600 group-hover:text-gold">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Stock Filter */}
      <div className="mb-6">
        <label className="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.inStock || false}
            onChange={handleStockChange}
            className="mr-2 text-gold focus:ring-gold"
          />
          <span className="text-sm text-gray-600 group-hover:text-gold">
            In Stock Only
          </span>
        </label>
      </div>

      {/* Apply Filters Button (Mobile) */}
      <div className="md:hidden">
        <Button className="w-full">Apply Filters</Button>
      </div>
    </div>
  );
}

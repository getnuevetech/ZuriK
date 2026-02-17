'use client';

import { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button, Select, Input } from '@/components/ui';
import { AFRICAN_COUNTRIES, DESIGN_CATEGORIES, FABRIC_TYPES } from '@/utils/constants';
import { DesignFilters } from '@/types';

interface DesignFilterProps {
  filters: DesignFilters;
  onFilterChange: (filters: DesignFilters) => void;
  onClearFilters: () => void;
}

export default function DesignFilter({
  filters,
  onFilterChange,
  onClearFilters,
}: DesignFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.category ? [filters.category] : []
  );

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onFilterChange({
      ...filters,
      [type === 'min' ? 'minPrice' : 'maxPrice']: numValue,
    });
  };

  const handleCountryChange = (value: string) => {
    onFilterChange({
      ...filters,
      country: value === 'all' ? undefined : value,
    });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(newCategories);
    onFilterChange({
      ...filters,
      category: newCategories.length === 1 ? newCategories[0] : undefined,
    });
  };

  const handleFabricTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      fabricType: value === 'all' ? undefined : value,
    });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    onFilterChange({
      ...filters,
      sortBy: sortBy as DesignFilters['sortBy'],
      sortOrder: sortOrder as 'asc' | 'desc',
    });
  };

  const getCurrentSortValue = () => {
    if (!filters.sortBy) return 'newest-desc';
    return `${filters.sortBy}-${filters.sortOrder || 'asc'}`;
  };

  const sortOptions = [
    { value: 'newest-desc', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'popular-desc', label: 'Most Popular' },
  ];

  const countryOptions = [
    { value: 'all', label: 'All Countries' },
    ...AFRICAN_COUNTRIES.map((country) => ({ value: country, label: country })),
  ];

  const fabricOptions = [
    { value: 'all', label: 'All Fabrics' },
    ...FABRIC_TYPES.map((type) => ({ value: type, label: type })),
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-cream-dark p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-dark" />
          <h2 className="text-lg font-semibold text-dark">Filters</h2>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden text-gray-500 hover:text-dark"
        >
          {isExpanded ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
        </button>
      </div>

      {/* Filter Content */}
      <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Sort By</label>
          <Select
            value={getCurrentSortValue()}
            onChange={(e) => handleSortChange(e.target.value)}
            options={sortOptions}
            className="w-full"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Price Range</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice?.toString() || ''}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-full"
              min="0"
              step="10"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice?.toString() || ''}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-full"
              min="0"
              step="10"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Country</label>
          <Select
            value={filters.country || 'all'}
            onChange={(e) => handleCountryChange(e.target.value)}
            options={countryOptions}
            className="w-full"
          />
        </div>

        {/* Category Checkboxes */}
        <div>
          <label className="block text-sm font-medium text-dark mb-3">Category</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {DESIGN_CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer hover:bg-cream p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold focus:ring-2"
                />
                <span className="text-sm text-dark">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fabric Type */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Fabric Type</label>
          <Select
            value={filters.fabricType || 'all'}
            onChange={(e) => handleFabricTypeChange(e.target.value)}
            options={fabricOptions}
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-2 border-t border-cream-dark">
          <Button onClick={onClearFilters} variant="outline" className="w-full">
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

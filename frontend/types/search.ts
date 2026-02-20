import type { Product } from './product';

export interface SearchFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  fabricType?: string;
  designerId?: string;
  region?: string;
  sizes?: string[];
  rating?: number;
  inStock?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popularity' | 'name_asc' | 'name_desc';
  page?: number;
  limit?: number;
}

export interface FilterOption {
  name: string;
  count: number;
}

export interface AvailableFilters {
  categories: FilterOption[];
  fabricTypes: FilterOption[];
  regions: FilterOption[];
  priceRange: { min: number; max: number };
  sizes: FilterOption[];
}

export interface SearchResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: AvailableFilters;
}

export interface SearchSuggestion {
  products: { id: string; name: string; image: string | null; price: number }[];
  categories: string[];
  designers: { id: string; name: string }[];
}

import { Designer } from './user';

export interface Design {
  id: string;
  name: string;
  description: string;
  customerPrice: number;
  designerPrice?: number;
  category?: string;
  images?: string[];
  tags?: string[];
  isActive: boolean;
  isFeatured?: boolean;
  designer?: Designer;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReadyToWearProduct {
  id: string;
  name: string;
  description: string;
  customerPrice: number;
  designerPrice?: number;
  category?: string;
  images?: string[];
  tags?: string[];
  isActive: boolean;
  isFeatured?: boolean;
  designer?: Designer;
  stock?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated Use Design or ReadyToWearProduct instead */
export type Product = Design;

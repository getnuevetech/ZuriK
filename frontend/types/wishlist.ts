import { Product } from './product';

export interface WishlistItem {
  id: string;
  product: Product;
  createdAt: string;
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

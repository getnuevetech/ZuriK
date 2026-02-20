export interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    averageRating?: number;
    totalReviews?: number;
  };
  createdAt: string;
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

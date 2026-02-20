export interface Review {
  id: string;
  user: { id: string; firstName: string; lastName: string };
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  product?: { id: string; name: string; images?: string[] };
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

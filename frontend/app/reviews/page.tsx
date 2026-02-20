'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { reviewsApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../components/ui/Toast';
import { StarRating } from '../../components/reviews/StarRating';
import { ReviewForm } from '../../components/reviews/ReviewForm';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import type { Review, ReviewsResponse } from '../../types';

const STATUS_BADGE: Record<string, 'primary' | 'secondary' | 'danger'> = {
  PENDING: 'secondary',
  APPROVED: 'primary',
  REJECTED: 'danger',
};

export default function MyReviewsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewsApi.getMyReviews({ limit: 50 });
      const data = res.data as ReviewsResponse;
      setReviews(data.reviews);
    } catch {
      toast('error', 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await reviewsApi.deleteReview(reviewId);
      toast('success', 'Review deleted');
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      toast('error', 'Failed to delete review');
    }
  };

  const handleEditSubmit = async (data: { rating: number; title?: string; comment: string; images?: string[] }) => {
    if (!editingReview) return;
    setEditLoading(true);
    try {
      await reviewsApi.updateReview(editingReview.id, data);
      toast('success', 'Review updated');
      setEditingReview(null);
      await fetchReviews();
    } catch {
      toast('error', 'Failed to update review');
    } finally {
      setEditLoading(false);
    }
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        {authLoading ? (
          <Spinner size="lg" />
        ) : (
          <>
            <p className="text-neutral-600 mb-4">Please log in to see your reviews.</p>
            <Link href="/login"><Button>Log In</Button></Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-2xl font-bold text-neutral-900 mb-8">My Reviews</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <p className="text-lg">You haven&apos;t written any reviews yet.</p>
          <Link href="/products" className="mt-4 inline-block">
            <Button variant="outline">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex gap-4">
                {/* Product thumbnail */}
                {review.product && (
                  <Link href={`/products/${review.product.id}`} className="flex-shrink-0">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100">
                      {review.product.images?.[0] ? (
                        <Image
                          src={review.product.images[0]}
                          alt={review.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-2xl">👗</div>
                      )}
                    </div>
                  </Link>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      {review.product && (
                        <Link
                          href={`/products/${review.product.id}`}
                          className="text-sm font-medium text-primary-600 hover:underline"
                        >
                          {review.product.name}
                        </Link>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <StarRating rating={review.rating} size="sm" />
                        {review.title && <span className="text-sm font-semibold text-neutral-800">{review.title}</span>}
                      </div>
                    </div>
                    <Badge variant={STATUS_BADGE[review.status] ?? 'secondary'}>{review.status}</Badge>
                  </div>
                  <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{review.comment}</p>
                  {review.status === 'REJECTED' && (review as any).adminNote && (
                    <p className="text-xs text-red-500 mt-1">Reason: {(review as any).adminNote}</p>
                  )}
                  <div className="flex gap-3 mt-3">
                    <Button size="sm" variant="ghost" onClick={() => setEditingReview(review)}>Edit</Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(review.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingReview && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Review</h3>
            <ReviewForm
              initialData={{
                rating: editingReview.rating,
                title: editingReview.title,
                comment: editingReview.comment,
                images: editingReview.images,
              }}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingReview(null)}
              loading={editLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

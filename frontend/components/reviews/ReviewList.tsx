'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { Spinner } from '../ui/Spinner';
import { reviewsApi } from '../../lib/api';
import type { Review, ReviewsResponse } from '../../types';

interface ReviewListProps {
  productId: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
  { value: 'helpful', label: 'Most Helpful' },
];

const LIMIT = 10;

export function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchReviews = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const res = await reviewsApi.getItemReviews(productId, { page: p, limit: LIMIT, sort: s });
      const data = res.data as ReviewsResponse;
      setReviews(data.reviews);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews(page, sort);
  }, [fetchReviews, page, sort]);

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  const handleHelpfulUpdate = (updated: Review) => {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await reviewsApi.deleteReview(reviewId);
      await fetchReviews(page, sort);
    } catch {
      // ignore
    }
  };

  const handleEditSubmit = async (data: { rating: number; title?: string; comment: string; images?: string[] }) => {
    if (!editingReview) return;
    setEditLoading(true);
    try {
      await reviewsApi.updateReview(editingReview.id, data);
      setEditingReview(null);
      await fetchReviews(page, sort);
    } catch {
      // ignore
    } finally {
      setEditLoading(false);
    }
  };

  if (loading && reviews.length === 0) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  if (!loading && reviews.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-500">
        <p className="text-lg">No reviews yet.</p>
        <p className="text-sm mt-1">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-neutral-500">{total} review{total !== 1 ? 's' : ''}</span>
        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Sort reviews"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <ReviewCard
            key={r.id}
            review={r}
            onEdit={setEditingReview}
            onDelete={handleDelete}
            onHelpfulUpdate={handleHelpfulUpdate}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-neutral-600">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
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


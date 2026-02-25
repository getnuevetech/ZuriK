'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/ui/Toast';
import api from '../../../lib/api';

interface ReviewUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  itemId: string;
  itemType: string;
  userId: string;
  helpfulCount: number;
  createdAt: string;
  user?: ReviewUser;
}

interface ReviewStats {
  total?: number;
  averageRating?: number;
  pending?: number;
  approved?: number;
  [key: string]: unknown;
}

const MAX_COMMENT_DISPLAY_LENGTH = 80;

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending:  { label: 'Pending',  className: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-sm">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const limit = 20;

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/reviews/stats');
      setStats(res.data);
    } catch {
      // stats are optional, ignore failure
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/reviews', { params });
      const data = res.data;
      if (Array.isArray(data)) {
        setReviews(data);
        setTotal(data.length);
        setTotalPages(1);
      } else {
        setReviews(data.items ?? data.data ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? Math.ceil((data.total ?? 0) / limit));
      }
    } catch {
      toast('error', 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/reviews/${id}/status`, { status });
      toast('success', `Review ${status}`);
      fetchReviews();
      fetchStats();
    } catch {
      toast('error', 'Failed to update review status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Reviews Management" />

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Reviews', value: stats.total ?? '—' },
            { label: 'Average Rating', value: stats.averageRating != null ? `${Number(stats.averageRating).toFixed(1)} ★` : '—' },
            { label: 'Pending', value: stats.pending ?? '—' },
            { label: 'Approved', value: stats.approved ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500 mb-1">{label}</p>
              <p className="text-2xl font-semibold text-neutral-800">{String(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter + table */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <select
            className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <p className="text-sm text-neutral-500 ml-auto">{total} review{total !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-8">No reviews found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    {['Reviewer', 'Rating', 'Comment', 'Item Type', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {reviews.map((review) => {
                    const badge = STATUS_BADGE[review.status] ?? STATUS_BADGE.pending;
                    return (
                      <tr key={review.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-neutral-800">
                            {review.user ? `${review.user.firstName} ${review.user.lastName}` : '—'}
                          </p>
                          <p className="text-xs text-neutral-400">{review.user?.email ?? ''}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StarRating rating={review.rating} />
                          <span className="ml-1 text-xs text-neutral-500">({review.rating})</span>
                        </td>
                        <td className="px-4 py-3 max-w-xs text-neutral-600">
                          {review.comment.length > MAX_COMMENT_DISPLAY_LENGTH ? `${review.comment.slice(0, MAX_COMMENT_DISPLAY_LENGTH)}…` : review.comment}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 capitalize">{review.itemType ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {review.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatusChange(review.id, 'approved')}
                                disabled={updatingId === review.id}
                                className="text-xs px-2 py-1 rounded border border-green-200 text-green-600 hover:bg-green-50 disabled:opacity-50 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(review.id, 'rejected')}
                                disabled={updatingId === review.id}
                                className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-neutral-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-xs px-3 py-1.5 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-xs px-3 py-1.5 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

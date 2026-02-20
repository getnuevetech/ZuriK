'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StarRating } from './StarRating';
import { ReviewImageModal } from './ReviewImageModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { reviewsApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../ui/Toast';
import type { Review } from '../../types';

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onHelpfulUpdate?: (review: Review) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function ReviewCard({ review, onEdit, onDelete, onHelpfulUpdate }: ReviewCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [imageModalIdx, setImageModalIdx] = useState<number | null>(null);
  const [helpfulLoading, setHelpfulLoading] = useState(false);

  const isOwn = user?.id === review.user?.id;
  const TRUNCATE_LEN = 300;
  const isLong = review.comment.length > TRUNCATE_LEN;
  const displayText = isLong && !expanded ? review.comment.slice(0, TRUNCATE_LEN) + '…' : review.comment;

  const reviewerName =
    [review.user?.firstName, review.user?.lastName].filter(Boolean).join(' ') || 'Anonymous';

  const handleHelpful = async () => {
    if (!isAuthenticated) {
      toast('error', 'Please log in to mark reviews as helpful');
      return;
    }
    setHelpfulLoading(true);
    try {
      const res = await reviewsApi.markHelpful(review.id);
      onHelpfulUpdate?.(res.data);
    } catch {
      toast('error', 'Could not mark review as helpful');
    } finally {
      setHelpfulLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <StarRating rating={review.rating} size="sm" />
            {review.title && (
              <span className="font-semibold text-neutral-800 text-sm">{review.title}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-neutral-600">{reviewerName}</span>
            {review.isVerifiedPurchase && (
              <Badge variant="primary">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Purchase
              </Badge>
            )}
            <span className="text-xs text-neutral-400">{timeAgo(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Comment */}
      <p className="text-neutral-700 text-sm leading-relaxed mb-3">
        {displayText}
        {isLong && (
          <button
            className="ml-1 text-primary-600 hover:underline text-sm font-medium"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {review.images.map((img, idx) => (
            <button
              key={idx}
              className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 hover:opacity-80 transition-opacity"
              onClick={() => setImageModalIdx(idx)}
            >
              <Image src={img} alt={`Review image ${idx + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600 transition-colors disabled:opacity-50"
          onClick={handleHelpful}
          disabled={helpfulLoading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          Helpful ({review.helpfulCount})
        </button>
        {isOwn && (
          <>
            <Button size="sm" variant="ghost" onClick={() => onEdit?.(review)}>Edit</Button>
            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => onDelete?.(review.id)}>Delete</Button>
          </>
        )}
      </div>

      {/* Image modal */}
      {imageModalIdx !== null && review.images && (
        <ReviewImageModal
          images={review.images}
          initialIndex={imageModalIdx}
          onClose={() => setImageModalIdx(null)}
        />
      )}
    </div>
  );
}

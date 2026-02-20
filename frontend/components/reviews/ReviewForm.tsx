'use client';

import React, { useState, useRef } from 'react';
import { StarRating } from './StarRating';
import { Button } from '../ui/Button';
import { uploadApi } from '../../lib/api';
import Image from 'next/image';

interface ReviewFormProps {
  initialData?: {
    rating?: number;
    title?: string;
    comment?: string;
    images?: string[];
  };
  onSubmit: (data: { rating: number; title?: string; comment: string; images?: string[] }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const MAX_IMAGES = 5;
const MAX_COMMENT = 2000;

export function ReviewForm({ initialData, onSubmit, onCancel, loading = false }: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating ?? 0);
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [comment, setComment] = useState(initialData?.comment ?? '');
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!rating) errs.rating = 'Please select a star rating';
    if (!comment.trim()) errs.comment = 'Comment is required';
    if (comment.length > MAX_COMMENT) errs.comment = `Comment must be ${MAX_COMMENT} characters or less`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (images.length + files.length > MAX_IMAGES) {
      setErrors((prev) => ({ ...prev, images: `Max ${MAX_IMAGES} images allowed` }));
      return;
    }
    setUploadingImage(true);
    try {
      const uploaded = await Promise.all(files.map((f) => uploadApi.uploadImage(f)));
      setImages((prev) => [...prev, ...uploaded.map((u) => u.url)]);
      setErrors((prev) => { const e = { ...prev }; delete e.images; return e; });
    } catch {
      setErrors((prev) => ({ ...prev, images: 'Failed to upload image' }));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ rating, title: title || undefined, comment, images });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Star rating */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Rating <span className="text-red-500">*</span>
        </label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
        {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="review-title" className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Summarise your experience (optional)"
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="review-comment" className="block text-sm font-medium text-neutral-700 mb-1">
          Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={MAX_COMMENT}
          placeholder="Share your experience with this product…"
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
        />
        <div className="flex justify-between mt-1">
          {errors.comment ? (
            <p className="text-red-500 text-xs">{errors.comment}</p>
          ) : <span />}
          <span className={`text-xs ${comment.length > MAX_COMMENT * 0.9 ? 'text-amber-500' : 'text-neutral-400'}`}>
            {comment.length}/{MAX_COMMENT}
          </span>
        </div>
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Photos <span className="text-neutral-400 font-normal">(optional, max {MAX_IMAGES})</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 group">
              <Image src={img} alt={`Upload ${idx + 1}`} fill className="object-cover" sizes="64px" />
              <button
                type="button"
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(idx)}
                aria-label="Remove image"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              className="w-16 h-16 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {errors.images && <p className="text-red-500 text-xs">{errors.images}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" loading={loading} disabled={loading || uploadingImage}>
          Submit Review
        </Button>
      </div>
    </form>
  );
}

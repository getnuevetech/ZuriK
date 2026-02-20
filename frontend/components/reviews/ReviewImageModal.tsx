'use client';

import React from 'react';
import { useEffect } from 'react';
import Image from 'next/image';

interface ReviewImageModalProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function ReviewImageModal({ images, initialIndex = 0, onClose }: ReviewImageModalProps) {
  const [idx, setIdx] = React.useState(initialIndex);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(images.length - 1, i + 1));
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Review image viewer"
    >
      <div
        className="relative max-w-2xl w-full max-h-[80vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-[60vh]">
          <Image
            src={images[idx]}
            alt={`Review image ${idx + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>

        {/* Close */}
        <button
          className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors disabled:opacity-30"
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors disabled:opacity-30"
              onClick={() => setIdx((i) => Math.min(images.length - 1, i + 1))}
              disabled={idx === images.length - 1}
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-2 py-0.5 rounded">
              {idx + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

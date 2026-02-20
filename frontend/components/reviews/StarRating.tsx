'use client';

import React from 'react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };

export function StarRating({ rating, size = 'md', interactive = false, onChange }: StarRatingProps) {
  const [hovered, setHovered] = React.useState(0);
  const starSize = sizeMap[size];
  const display = interactive && hovered > 0 ? hovered : rating;

  return (
    <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined} aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display;
        const half = !filled && star - 0.5 <= display;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            className={[
              'focus:outline-none',
              interactive ? 'cursor-pointer' : 'cursor-default pointer-events-none',
            ].join(' ')}
            onClick={() => interactive && onChange?.(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            <svg
              className={[starSize, filled ? 'text-amber-400' : half ? 'text-amber-300' : 'text-neutral-300'].join(' ')}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {half ? (
                <>
                  <defs>
                    <linearGradient id={`half-${star}`}>
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#half-${star})`}
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </>
              ) : (
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              )}
            </svg>
          </button>
        );
      })}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useWishlist } from '../WishlistContext';
import { useAuth } from '../../lib/auth-context';

interface WishlistButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const buttonSizeMap = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

export function WishlistButton({ productId, size = 'md', className = '' }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [animating, setAnimating] = useState(false);

  const inWishlist = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    await toggleWishlist(productId);
  };

  const tooltip = inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';

  return (
    <button
      type="button"
      onClick={handleClick}
      title={tooltip}
      aria-label={tooltip}
      className={[
        buttonSizeMap[size],
        'rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400',
        inWishlist
          ? 'text-red-500 hover:text-red-600'
          : 'text-neutral-400 hover:text-red-400',
        animating ? 'scale-125' : 'scale-100',
        className,
      ].join(' ')}
    >
      {inWishlist ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={sizeMap[size]}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={sizeMap[size]}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
    </button>
  );
}

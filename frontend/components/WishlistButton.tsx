'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWishlist } from './WishlistContext';
import { useAuth } from '../lib/auth-context';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className = '' }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist, isLoading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const inWishlist = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    await toggleWishlist(productId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className={[
        'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
        'bg-white/80 hover:bg-white shadow-sm hover:shadow-md',
        inWishlist ? 'text-red-500 scale-110' : 'text-neutral-400 hover:text-red-400',
        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {inWishlist ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
}

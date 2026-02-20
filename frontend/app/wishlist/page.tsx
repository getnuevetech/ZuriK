'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { wishlistApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useCart } from '../../lib/cart-context';
import { useWishlist } from '../../components/WishlistContext';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { StarRating } from '../../components/reviews/StarRating';
import type { WishlistResponse, WishlistItem } from '../../types';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { toast } = useToast();

  const [wishlist, setWishlist] = useState<WishlistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await wishlistApi.getWishlist({ page, limit });
      setWishlist(res.data as WishlistResponse);
    } catch {
      toast('error', 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    if (isAuthenticated) fetchWishlist();
  }, [isAuthenticated, fetchWishlist]);

  const handleRemove = async (item: WishlistItem) => {
    await toggleWishlist(item.product.id);
    setWishlist((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((i) => i.id !== item.id),
        total: prev.total - 1,
      };
    });
    toast('success', 'Removed from wishlist');
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) return;
    try {
      await wishlistApi.clearWishlist();
      setWishlist((prev) => prev ? { ...prev, items: [], total: 0 } : prev);
      toast('success', 'Wishlist cleared');
    } catch {
      toast('error', 'Failed to clear wishlist');
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: 1,
      type: 'ready-to-wear',
      image: item.product.images?.[0],
    });
    toast('success', `${item.product.name} added to cart`);
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const items = wishlist?.items ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Wishlist</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {wishlist?.total ?? 0} {wishlist?.total === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-neutral-700 mb-2">Your wishlist is empty</h2>
          <p className="text-neutral-500 mb-6">Save items you love and come back to them later</p>
          <Link href="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col">
                <div className="relative h-48 bg-gradient-to-br from-primary-100 to-accent-100">
                  {item.product.images?.[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl">👗</div>
                  )}
                  <button
                    onClick={() => handleRemove(item)}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1.5 text-neutral-400 hover:text-red-500 transition-colors shadow-sm"
                    aria-label="Remove from wishlist"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <Link href={`/products/${item.product.id}`} className="font-semibold text-neutral-900 hover:text-primary-600 line-clamp-1 mb-1 transition-colors">
                    {item.product.name}
                  </Link>
                  {(item.product.totalReviews ?? 0) > 0 && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <StarRating rating={item.product.averageRating ?? 0} size="sm" />
                      <span className="text-xs text-neutral-500">({item.product.totalReviews})</span>
                    </div>
                  )}
                  <PriceDisplay amount={item.product.price} className="text-lg font-bold text-secondary-600 mb-3" />
                  <div className="mt-auto">
                    <Button variant="primary" size="sm" className="w-full" onClick={() => handleAddToCart(item)}>
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {(wishlist?.totalPages ?? 1) > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-neutral-600">
                Page {page} of {wishlist?.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= (wishlist?.totalPages ?? 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

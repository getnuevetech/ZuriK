'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from './api';
import { useAuth } from './auth-context';

interface WishlistContextValue {
  wishlistIds: Set<string>;
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }
    setIsLoading(true);
    wishlistApi.getWishlistIds()
      .then((ids) => setWishlistIds(new Set(ids)))
      .catch(() => setWishlistIds(new Set()))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const isInWishlist = useCallback((productId: string) => wishlistIds.has(productId), [wishlistIds]);

  const toggleWishlist = useCallback(async (productId: string) => {
    const wasIn = wishlistIds.has(productId);
    // Optimistic update
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (wasIn) next.delete(productId);
      else next.add(productId);
      return next;
    });
    try {
      await wishlistApi.toggleWishlist(productId);
    } catch {
      // Revert on error
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (wasIn) next.add(productId);
        else next.delete(productId);
        return next;
      });
    }
  }, [wishlistIds]);

  const wishlistCount = wishlistIds.size;

  return (
    <WishlistContext.Provider value={{ wishlistIds, wishlistCount, isInWishlist, toggleWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}

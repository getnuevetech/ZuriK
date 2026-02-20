'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { wishlistApi } from '../lib/api';
import { useAuth } from '../lib/auth-context';

interface WishlistContextValue {
  wishlistIds: Set<string>;
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextValue>({
  wishlistIds: new Set(),
  wishlistCount: 0,
  isInWishlist: () => false,
  toggleWishlist: async () => {},
  isLoading: false,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlistIds = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }
    setIsLoading(true);
    try {
      const res = await wishlistApi.getWishlistIds();
      setWishlistIds(new Set(res.data));
    } catch {
      // silently fail — user may be logged out
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.has(productId),
    [wishlistIds],
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      // Optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      try {
        const res = await wishlistApi.toggleWishlist(productId);
        const added: boolean = res.data.added;
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (added) {
            next.add(productId);
          } else {
            next.delete(productId);
          }
          return next;
        });
      } catch {
        // Revert optimistic update on error
        fetchWishlistIds();
      }
    },
    [fetchWishlistIds],
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.size,
        isInWishlist,
        toggleWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

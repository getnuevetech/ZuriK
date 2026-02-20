'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useCart } from '../../lib/cart-context';
import { useWishlist } from '../../components/WishlistContext';
import { useToast } from '../../components/ui/Toast';
import { wishlistApi } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { WishlistButton } from '../../components/wishlist/WishlistButton';
import type { WishlistItem, WishlistResponse } from '../../types';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const { wishlistCount, refreshWishlist } = useWishlist();
  const { toast } = useToast();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await wishlistApi.getWishlist();
      const data = res.data as WishlistResponse;
      setItems(data.items);
    } catch {
      toast('error', 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        fetchWishlist();
      }
    }
  }, [isAuthenticated, authLoading, fetchWishlist, router]);

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.product.id,
      name: item.product.name,
      price: item.product.customerPrice,
      quantity: 1,
      type: 'ready-to-wear',
      image: item.product.images?.[0],
      designId: item.product.id,
    });
    toast('success', `${item.product.name} added to cart`);
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear your entire wishlist?')) return;
    setClearing(true);
    try {
      await wishlistApi.clearWishlist();
      setItems([]);
      refreshWishlist();
      toast('success', 'Wishlist cleared');
    } catch {
      toast('error', 'Failed to clear wishlist');
    } finally {
      setClearing(false);
    }
  };

  const handleItemRemoved = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-neutral-900">
          My Wishlist
          {items.length > 0 && (
            <span className="ml-3 text-lg font-normal text-neutral-500">({items.length} items)</span>
          )}
        </h1>
        {items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={clearing}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            {clearing ? 'Clearing…' : 'Clear All'}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-7xl mb-6">🤍</span>
          <h2 className="font-heading text-2xl font-bold text-neutral-700 mb-2">Your wishlist is empty</h2>
          <p className="text-neutral-500 mb-8">Save products you love by clicking the heart icon</p>
          <Link href="/products">
            <Button variant="primary" size="lg">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onAddToCart={handleAddToCart}
              onRemoved={handleItemRemoved}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistCard({
  item,
  onAddToCart,
  onRemoved,
}: {
  item: WishlistItem;
  onAddToCart: (item: WishlistItem) => void;
  onRemoved: (productId: string) => void;
}) {
  const { toggleWishlist } = useWishlist();

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(item.product.id);
    onRemoved(item.product.id);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="relative w-full h-48 bg-gradient-to-br from-primary-100 to-accent-100">
        <Link href={`/products/${item.product.id}`}>
          {item.product.images && item.product.images.length > 0 ? (
            <Image
              src={item.product.images[0]}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl">👗</span>
            </div>
          )}
        </Link>
        <div className="absolute top-2 right-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
            <WishlistButton productId={item.product.id} size="sm" />
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${item.product.id}`} className="font-semibold text-neutral-900 hover:text-primary-600 transition-colors line-clamp-1 mb-1">
          {item.product.name}
        </Link>
        <PriceDisplay amount={item.product.customerPrice} className="text-lg font-bold text-secondary-600 block mb-4" />
        <div className="mt-auto">
          <Button variant="primary" size="sm" className="w-full" onClick={() => onAddToCart(item)}>
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

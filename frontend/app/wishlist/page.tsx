'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../lib/auth-context';
import { useCart } from '../../lib/cart-context';
import { useWishlist } from '../../lib/wishlist-context';
import { wishlistApi } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { StarRating } from '../../components/reviews/StarRating';
import { useToast } from '../../components/ui/Toast';
import type { Product } from '../../types';

interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
}

interface WishlistPage {
  items: WishlistItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();

  const [data, setData] = useState<WishlistPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchWishlist(page);
  }, [isAuthenticated, page]);

  async function fetchWishlist(p: number) {
    setLoading(true);
    try {
      const result = await wishlistApi.getWishlist({ page: p, limit: 20 });
      setData(result);
    } catch {
      toast('error', 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }

  const handleRemove = async (productId: string) => {
    await toggleWishlist(productId);
    fetchWishlist(page);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.customerPrice,
      quantity: 1,
      type: 'ready-to-wear',
      image: product.images?.[0],
      designId: product.id,
    });
    toast('success', `${product.name} added to cart`);
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your wishlist?')) return;
    try {
      await wishlistApi.clearWishlist();
      toast('success', 'Wishlist cleared');
      setData(null);
      fetchWishlist(1);
    } catch {
      toast('error', 'Failed to clear wishlist');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-neutral-900">My Wishlist</h1>
        {data && data.total > 0 && (
          <Button variant="outline" onClick={handleClearAll} className="text-red-600 border-red-300 hover:bg-red-50">
            Clear All
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !data || data.total === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🤍</div>
          <h2 className="font-heading text-2xl font-bold text-neutral-700 mb-2">Your wishlist is empty</h2>
          <p className="text-neutral-500 mb-6">Save your favorite products here to buy them later.</p>
          <Link href="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-6">{data.total} item{data.total !== 1 ? 's' : ''} saved</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col">
                <div className="relative w-full h-48 bg-gradient-to-br from-primary-100 to-accent-100">
                  {item.product.images && item.product.images.length > 0 ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl">👗</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(item.productId)}
                    aria-label="Remove from wishlist"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 text-neutral-500 hover:text-red-500 transition-colors shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1">{item.product.name}</h3>
                  {(item.product.totalReviews ?? 0) > 0 && (
                    <div className="flex items-center gap-1 mb-1">
                      <StarRating rating={item.product.averageRating ?? 0} size="sm" />
                      <span className="text-xs text-neutral-500">({item.product.totalReviews})</span>
                    </div>
                  )}
                  <PriceDisplay amount={item.product.customerPrice} className="text-lg font-bold text-secondary-600 block mb-3" />
                  <div className="mt-auto flex gap-2">
                    <Link href={`/products/${item.product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">View</Button>
                    </Link>
                    <Button variant="primary" size="sm" className="flex-1" onClick={() => handleAddToCart(item.product)}>
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="flex items-center px-3 text-sm text-neutral-600">Page {page} of {data.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

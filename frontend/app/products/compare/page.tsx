'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { comparisonApi } from '../../../lib/api';
import { useCart } from '../../../lib/cart-context';
import { useComparison } from '../../../lib/comparison-context';
import { useToast } from '../../../components/ui/Toast';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { PriceDisplay } from '../../../components/common/PriceDisplay';
import { getUserDisplayName } from '../../../lib/utils';
import type { Product } from '../../../types';

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400 inline" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function ComparePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { removeFromComparison } = useComparison();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const idsParam = searchParams.get('ids') ?? '';
  const ids = idsParam ? idsParam.split(',').filter(Boolean) : [];

  const fetchProducts = useCallback(async () => {
    const ids = idsParam ? idsParam.split(',').filter(Boolean) : [];
    if (ids.length < 2) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await comparisonApi.compare(ids);
      setProducts(data);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to load comparison'
          : 'Failed to load comparison';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setLoading(false);
    }
  }, [idsParam]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  const handleRemove = (product: Product) => {
    removeFromComparison(product.id);
    const newIds = ids.filter((id) => id !== product.id);
    if (newIds.length === 0) {
      router.push('/products');
    } else {
      router.replace(`/products/compare?ids=${newIds.join(',')}`);
    }
  };

  // Highlight helpers
  const lowestPrice =
    products.length > 0 ? Math.min(...products.map((p) => Number(p.customerPrice))) : null;
  const highestRating =
    products.length > 0 ? Math.max(...products.map((p) => Number(p.averageRating ?? 0))) : null;

  const rows = [
    { key: 'image', label: 'Image' },
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'category', label: 'Category' },
    { key: 'country', label: 'Country' },
    { key: 'designer', label: 'Designer' },
    { key: 'rating', label: 'Rating' },
    { key: 'tags', label: 'Tags' },
    { key: 'description', label: 'Description' },
  ] as const;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
          ← Back to Products
        </Link>
        <h1 className="font-heading text-3xl font-bold text-neutral-900">Compare Products</h1>
      </div>

      {/* Not enough products */}
      {ids.length < 2 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">⚖️</p>
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">Select at least 2 products to compare</h2>
          <p className="text-neutral-500 mb-6">Browse products and use the &ldquo;Compare&rdquo; button to add them here.</p>
          <Link href="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">Could not load comparison</h2>
          <p className="text-neutral-500 mb-6">{error}</p>
          <Link href="/products">
            <Button variant="primary">Back to Products</Button>
          </Link>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">👗</p>
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">No products to compare</h2>
          <Link href="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                {/* Row label column */}
                <th className="w-36 min-w-[120px]" />
                {products.map((product) => (
                  <th key={product.id} className="p-3 text-center align-top min-w-[160px]">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => handleRemove(product)}
                        className="text-xs text-neutral-400 hover:text-red-500 self-end"
                        aria-label={`Remove ${product.name}`}
                      >
                        ✕ Remove
                      </button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="w-full"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr
                  key={row.key}
                  className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}
                >
                  <td className="py-3 px-4 text-sm font-semibold text-neutral-600 whitespace-nowrap border-r border-neutral-100">
                    {row.label}
                  </td>
                  {products.map((product) => {
                    const isLowestPrice =
                      row.key === 'price' && Number(product.customerPrice) === lowestPrice;
                    const isHighestRated =
                      row.key === 'rating' &&
                      Number(product.averageRating ?? 0) === highestRating &&
                      highestRating > 0;

                    return (
                      <td
                        key={product.id}
                        className={[
                          'py-3 px-4 text-sm text-center border-r border-neutral-100 last:border-r-0',
                          isLowestPrice ? 'bg-green-50' : '',
                          isHighestRated ? 'bg-amber-50' : '',
                        ].join(' ')}
                      >
                        {row.key === 'image' && (
                          <div className="flex justify-center">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-100">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="96px"
                                />
                              ) : (
                                <span className="flex items-center justify-center w-full h-full text-3xl">👗</span>
                              )}
                            </div>
                          </div>
                        )}
                        {row.key === 'name' && (
                          <Link
                            href={`/products/${product.id}`}
                            className="font-semibold text-neutral-900 hover:text-indigo-600 hover:underline"
                          >
                            {product.name}
                          </Link>
                        )}
                        {row.key === 'price' && (
                          <span className={isLowestPrice ? 'font-bold text-green-700' : 'font-semibold text-neutral-800'}>
                            <PriceDisplay amount={product.customerPrice} currency="NGN" />
                            {isLowestPrice && products.length > 1 && (
                              <span className="ml-1 text-xs text-green-600 font-normal">Best value</span>
                            )}
                          </span>
                        )}
                        {row.key === 'category' && (
                          product.category
                            ? <Badge variant="primary">{product.category}</Badge>
                            : <span className="text-neutral-400">—</span>
                        )}
                        {row.key === 'country' && (
                          product.country
                            ? <Badge variant="secondary">{product.country}</Badge>
                            : <span className="text-neutral-400">—</span>
                        )}
                        {row.key === 'designer' && (
                          product.designer
                            ? (
                              <Link
                                href={`/designers/${product.designer.id}`}
                                className="text-indigo-600 hover:underline"
                              >
                                {getUserDisplayName(product.designer)}
                              </Link>
                            )
                            : <span className="text-neutral-400">—</span>
                        )}
                        {row.key === 'rating' && (
                          <span className={isHighestRated ? 'font-bold text-amber-700' : ''}>
                            {(product.totalReviews ?? 0) > 0 ? (
                              <>
                                <StarIcon />
                                {' '}
                                {Number(product.averageRating ?? 0).toFixed(1)}
                                {' '}
                                <span className="text-neutral-500 font-normal">
                                  ({product.totalReviews} review{product.totalReviews !== 1 ? 's' : ''})
                                </span>
                                {isHighestRated && products.length > 1 && (
                                  <span className="ml-1 text-xs text-amber-600 font-normal">Top rated</span>
                                )}
                              </>
                            ) : (
                              <span className="text-neutral-400">No reviews</span>
                            )}
                          </span>
                        )}
                        {row.key === 'tags' && (
                          product.tags && product.tags.length > 0
                            ? <span className="text-neutral-600">{product.tags.join(', ')}</span>
                            : <span className="text-neutral-400">—</span>
                        )}
                        {row.key === 'description' && (
                          <span className="text-neutral-600 text-xs line-clamp-3">{product.description || '—'}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner size="lg" /></div>}>
      <ComparePageContent />
    </Suspense>
  );
}

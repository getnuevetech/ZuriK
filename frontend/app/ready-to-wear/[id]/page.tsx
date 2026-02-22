'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { readyToWearApi, ordersApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';
import { PriceDisplay } from '../../../components/common/PriceDisplay';
import { useToast } from '../../../components/ui/Toast';
import type { ReadyToWearProduct } from '../../../types';

export default function ReadyToWearDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<ReadyToWearProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    readyToWearApi.getById(id)
      .then(setProduct)
      .catch(() => router.push('/ready-to-wear'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async () => {
    if (!user) {
      router.push(`/login?redirect=/ready-to-wear/${id}`);
      return;
    }
    if (!product) return;
    setOrdering(true);
    try {
      const order = await ordersApi.createReadyToWear({
        readyToWearProductId: product.id,
        quantity,
      });
      toast('success', 'Order created! Redirecting to payment...');
      router.push(`/orders/${order.id}`);
    } catch (e: any) {
      toast('error', e?.response?.data?.message || 'Please try again');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }
  if (!product) return null;

  const images = product.images || [];
  const inStock = product.stock === undefined || product.stock > 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-50 mb-4">
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">👗</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? 'border-indigo-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              {product.category && <Badge variant="secondary">{product.category}</Badge>}
              {inStock ? (
                <Badge variant="success">In Stock{product.stock !== undefined ? ` (${product.stock})` : ''}</Badge>
              ) : (
                <Badge variant="danger">Out of Stock</Badge>
              )}
            </div>

            <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-2">{product.name}</h1>

            {product.designer && (
              <p className="text-sm text-neutral-500 mb-4">
                by <span className="font-medium text-neutral-700">{product.designer.firstName} {product.designer.lastName}</span>
                {product.designer.country && ` • ${product.designer.country}`}
              </p>
            )}

            <PriceDisplay amount={product.customerPrice} className="text-2xl font-bold text-indigo-600 mb-4" />

            <p className="text-neutral-600 leading-relaxed mb-6">{product.description}</p>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">{tag}</span>
                ))}
              </div>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-neutral-700">Quantity:</span>
              <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                <button
                  className="px-3 py-2 hover:bg-neutral-50 transition-colors"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  className="px-3 py-2 hover:bg-neutral-50 transition-colors"
                  onClick={() => setQuantity(q => Math.min(product.stock ?? 99, q + 1))}
                  disabled={product.stock !== undefined && quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-800 font-medium mb-1">🚀 Ships Immediately</p>
              <p className="text-xs text-green-700">
                This item is finished and ready to ship. No measurements or customisation needed.
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              <Button
                size="lg"
                className="w-full"
                disabled={!inStock || ordering}
                loading={ordering}
                onClick={handleOrder}
              >
                {inStock ? 'Buy Now' : 'Out of Stock'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

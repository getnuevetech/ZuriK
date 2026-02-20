'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { productsApi, ordersApi } from '../../../lib/api';
import { useCart } from '../../../lib/cart-context';
import { useAuth } from '../../../lib/auth-context';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';
import { Breadcrumbs } from '../../../components/common/Breadcrumbs';
import { PriceDisplay } from '../../../components/common/PriceDisplay';
import { ProductCard } from '../../../components/products/ProductCard';
import { TryOnPreview } from '../../../components/try-on';
import type { Product, Order } from '../../../types';

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [savedMeasurements, setSavedMeasurements] = useState<Partial<Order> | null>(null);

  useEffect(() => {
    if (params?.id) {
      productsApi.get(String(params.id))
        .then((data) => {
          setProduct(data);
          return productsApi.list();
        })
        .then((all) => {
          if (!all) return;
          const current = all.find((p: Product) => p.id === params.id);
          if (current) {
            const rel = all
              .filter((p: Product) => p.id !== params.id && (p.category === current.category || p.designer?.id === current.designer?.id))
              .slice(0, 4);
            setRelated(rel);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [params?.id]);

  // Pre-fetch saved measurements if user is logged in
  useEffect(() => {
    if (!isAuthenticated) return;
    ordersApi.getMyOrders()
      .then((orders: Order[]) => {
        const customOrder = orders
          .filter((o) => o.orderType === 'CUSTOM_DESIGN' && o.chest)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        if (customOrder) setSavedMeasurements(customOrder);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.customerPrice,
      quantity,
      type: 'ready-to-wear',
      image: product.images?.[0],
      designId: product.id,
    });
    toast('success', `${product.name} added to cart`);
  };

  const handleRelatedAddToCart = (p: Product) => {
    addToCart({
      id: p.id,
      name: p.name,
      price: p.customerPrice,
      quantity: 1,
      type: 'ready-to-wear',
      image: p.images?.[0],
      designId: p.id,
    });
    toast('success', `${p.name} added to cart`);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
      <h2 className="font-heading text-2xl font-bold text-neutral-700 mb-4">Product not found</h2>
      <Link href="/products"><Button variant="outline">Back to Products</Button></Link>
    </div>
  );

  const designerName = product.designer
    ? `${product.designer.firstName ?? ''} ${product.designer.lastName ?? ''}`.trim() || product.designer.email
    : null;

  const images = product.images && product.images.length > 0 ? product.images : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: product.name },
      ]} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Image gallery */}
        <div>
          <div className="relative w-full aspect-square bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl overflow-hidden mb-4">
            {images.length > 0 ? (
              <Image
                src={images[mainImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl">👗</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(idx)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${mainImage === idx ? 'border-primary-600' : 'border-neutral-200'}`}
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {product.category && <Badge variant="primary">{product.category}</Badge>}
            {product.country && <Badge variant="secondary">{product.country}</Badge>}
          </div>
          <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-2">{product.name}</h1>
          {designerName && (
            <Link href={`/designers/${product.designer!.id}`} className="text-sm text-primary-600 hover:underline mb-4 block">
              by {designerName}
            </Link>
          )}
          <PriceDisplay amount={product.customerPrice} className="text-3xl font-bold text-secondary-600 block mb-6" />
          {product.description && (
            <p className="text-neutral-600 leading-relaxed mb-8">{product.description}</p>
          )}

          {/* Order options */}
          <div className="space-y-4">
            {/* Ready-to-wear */}
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
              <h3 className="font-semibold text-neutral-800 mb-3">Buy Ready-to-Wear</h3>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-sm text-neutral-600">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                  >−</button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                  >+</button>
                </div>
              </div>
              <Button size="lg" onClick={handleAddToCart} className="w-full">
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setTryOnOpen(true)}
                className="w-full mt-2 border-accent-500 text-accent-600 hover:bg-accent-50"
              >
                👤 Try It On
              </Button>
            </div>

            {/* Custom design */}
            <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
              <h3 className="font-semibold text-primary-800 mb-1">Order Custom Design</h3>
              <p className="text-sm text-primary-600 mb-3">Get this design tailored to your exact measurements</p>
              <Link href={`/orders/custom-design?designId=${product.id}`}>
                <Button variant="outline" size="lg" className="w-full border-primary-600 text-primary-600 hover:bg-primary-50">
                  Start Custom Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Try It On Modal */}
      <Modal
        isOpen={tryOnOpen}
        onClose={() => setTryOnOpen(false)}
        title="Try It On"
        size="lg"
      >
        <TryOnPreview
          mode="ready-to-wear"
          product={product}
          savedMeasurements={savedMeasurements ? {
            chest: savedMeasurements.chest,
            waist: savedMeasurements.waist,
            hips: savedMeasurements.hips,
            shoulder: savedMeasurements.shoulder,
            sleeveLength: savedMeasurements.sleeveLength,
            length: savedMeasurements.length,
            unit: savedMeasurements.unit,
          } : undefined}
        />
      </Modal>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleRelatedAddToCart} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

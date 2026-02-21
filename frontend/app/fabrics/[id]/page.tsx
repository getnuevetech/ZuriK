'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fabricsApi } from '../../../lib/api';
import { useCart } from '../../../lib/cart-context';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { Breadcrumbs } from '../../../components/common/Breadcrumbs';
import { PriceDisplay } from '../../../components/common/PriceDisplay';
import { ShareButton } from '../../../components/common/ShareButton';
import { getShareUrl } from '../../../lib/share-utils';
import { FabricCard } from '../../../components/fabrics/FabricCard';
import type { Fabric } from '../../../types';

export default function FabricDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [fabric, setFabric] = useState<Fabric | null>(null);
  const [related, setRelated] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);

  useEffect(() => {
    if (params?.id) {
      fabricsApi.get(String(params.id))
        .then((data) => {
          setFabric(data);
          return fabricsApi.list();
        })
        .then((res) => {
          if (!res) return;
          const all = res.items;
          const current = all.find((f: Fabric) => f.id === params.id);
          if (current) {
            const rel = all
              .filter((f: Fabric) => f.id !== params.id && (f.country === current.country || f.seller?.id === current.seller?.id))
              .slice(0, 4);
            setRelated(rel);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [params?.id]);

  const handleAddToCart = () => {
    if (!fabric) return;
    addToCart({
      id: fabric.id,
      name: fabric.name,
      price: fabric.customerPrice,
      quantity,
      type: 'fabric-only',
      image: fabric.images?.[0],
      fabricId: fabric.id,
    });
    toast('success', `${fabric.name} added to cart`);
  };

  const handleRelatedOrder = (f: Fabric) => {
    addToCart({
      id: f.id,
      name: f.name,
      price: f.customerPrice,
      quantity: 1,
      type: 'fabric-only',
      image: f.images?.[0],
      fabricId: f.id,
    });
    toast('success', `${f.name} added to cart`);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!fabric) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
      <h2 className="font-heading text-2xl font-bold text-neutral-700 mb-4">Fabric not found</h2>
      <Link href="/fabrics"><Button variant="outline">Back to Fabrics</Button></Link>
    </div>
  );

  const sellerName = fabric.seller
    ? `${fabric.seller.firstName ?? ''} ${fabric.seller.lastName ?? ''}`.trim() || fabric.seller.email
    : null;
  const inStock = fabric.stock > 0;
  const images = fabric.images && fabric.images.length > 0 ? fabric.images : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Fabrics', href: '/fabrics' },
        { label: fabric.name },
      ]} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Image gallery */}
        <div>
          <div className="relative w-full aspect-square bg-gradient-to-br from-secondary-100 to-accent-100 rounded-2xl overflow-hidden mb-4">
            {images.length > 0 ? (
              <Image src={images[mainImage]} alt={fabric.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl">🧵</span>
              </div>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold text-lg bg-black/60 px-4 py-2 rounded-full">Out of Stock</span>
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
                  <Image src={img} alt={`${fabric.name} ${idx + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fabric info */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-3">{fabric.name}</h1>
          <div className="flex items-center gap-2 mb-3">
            <ShareButton
              url={getShareUrl(`/fabrics/${fabric.id}`)}
              title={fabric.name}
              description={fabric.description}
              image={images[0]}
              type="fabric"
            />
          </div>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {fabric.material && <Badge variant="primary">{fabric.material}</Badge>}
            {fabric.pattern && <Badge variant="secondary">{fabric.pattern}</Badge>}
            {fabric.color && <Badge variant="default">{fabric.color}</Badge>}
            {fabric.country && <Badge variant="info">{fabric.country}</Badge>}
          </div>
          {sellerName && <p className="text-sm text-neutral-500 mb-2">Seller: {sellerName}</p>}
          <div className="flex items-center gap-4 mb-6">
            <PriceDisplay amount={fabric.customerPrice} className="text-3xl font-bold text-secondary-600" />
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {inStock ? `${fabric.stock} units available` : 'Out of Stock'}
            </span>
          </div>
          {fabric.description && <p className="text-neutral-600 leading-relaxed mb-8">{fabric.description}</p>}

          {/* Order options */}
          <div className="space-y-4">
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
              <h3 className="font-semibold text-neutral-800 mb-3">Buy Fabric Only</h3>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-sm text-neutral-600">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={!inStock} className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors disabled:opacity-50">−</button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(fabric.stock, q + 1))} disabled={!inStock} className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors disabled:opacity-50">+</button>
                </div>
              </div>
              <Button size="lg" onClick={handleAddToCart} disabled={!inStock} className="w-full">
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>

            <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-200">
              <h3 className="font-semibold text-secondary-800 mb-1">Use in Custom Design</h3>
              <p className="text-sm text-secondary-600 mb-3">Pair this fabric with a custom design</p>
              <Link href={`/orders/custom-design?fabricId=${fabric.id}`}>
                <Button variant="outline" size="lg" className="w-full border-secondary-600 text-secondary-600 hover:bg-secondary-50">
                  Start Custom Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related fabrics */}
      {related.length > 0 && (
        <div>
          <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">Related Fabrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((f) => (
              <FabricCard key={f.id} fabric={f} onOrder={handleRelatedOrder} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

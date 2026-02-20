'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi } from '../../../lib/api';
import { useCart } from '../../../lib/cart-context';
import { useToast } from '../../../components/ui/Toast';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Breadcrumbs } from '../../../components/common/Breadcrumbs';
import { ProductCard } from '../../../components/products/ProductCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { getUserDisplayName } from '../../../lib/utils';
import type { Product, Designer } from '../../../types';

export default function DesignerProfilePage() {
  const params = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [designer, setDesigner] = useState<Designer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      productsApi.list()
        .then((all: Product[]) => {
          const designerProducts = all.filter((p) => p.designer?.id === params.id);
          if (designerProducts.length > 0 && designerProducts[0].designer) {
            setDesigner(designerProducts[0].designer as Designer);
          }
          setProducts(designerProducts);
        })
        .catch(() => toast('error', 'Failed to load designer profile'))
        .finally(() => setLoading(false));
    }
  }, [params?.id, toast]);

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

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!designer) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
      <h2 className="font-heading text-2xl font-bold text-neutral-700 mb-4">Designer not found</h2>
      <Link href="/designers"><Button variant="outline">Back to Designers</Button></Link>
    </div>
  );

  const designerName = getUserDisplayName(designer);
  const countrySet = new Set(products.map((p) => p.country).filter(Boolean));
  const countries = Array.from(countrySet);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Designers', href: '/designers' },
        { label: designerName },
      ]} />

      {/* Designer header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12 bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
        <Avatar name={designerName} size="xl" className="flex-shrink-0 w-24 h-24 text-2xl" />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-2">{designerName}</h1>
          {countries.length > 0 && (
            <p className="text-neutral-500 mb-3">📍 {countries.join(', ')}</p>
          )}
          <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
            <Badge variant="primary">Designer</Badge>
            <Badge variant="default">{products.length} design{products.length !== 1 ? 's' : ''}</Badge>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
          Designs by {designerName}
        </h2>
        {products.length === 0 ? (
          <EmptyState title="No designs yet" message="This designer hasn't published any designs yet" icon="👗" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (params?.id) {
      productsApi.get(String(params.id))
        .then((data) => setProduct(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [params?.id]);

  const handleAddToCart = () => {
    if (!product) return;
    try {
      const existingCart = localStorage.getItem('cart');
      const cart = existingCart ? JSON.parse(existingCart) : [];
      const existingItem = cart.find((item: { id: number }) => item.id === product.id);
      if (existingItem) { existingItem.quantity += 1; } else { cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 }); }
      localStorage.setItem('cart', JSON.stringify(cart));
      setAdded(true);
      window.dispatchEvent(new Event('storage'));
      setTimeout(() => setAdded(false), 2000);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
      <h2 className="font-heading text-2xl font-bold text-neutral-700 mb-4">Product not found</h2>
      <Link href="/products"><Button variant="outline">Back to Products</Button></Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/products" className="text-sm text-neutral-500 hover:text-primary-600 flex items-center gap-1 mb-8 transition-colors">
        ← Back to Products
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="w-full aspect-square bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center">
          <span className="text-8xl">📦</span>
        </div>
        <div>
          {product.category && <Badge variant="primary" className="mb-3">{product.category}</Badge>}
          <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-4">{product.name}</h1>
          {product.description && <p className="text-neutral-600 leading-relaxed mb-6">{product.description}</p>}
          <p className="text-3xl font-bold text-secondary-600 mb-8">${product.price}</p>
          <div className="flex gap-3">
            <Button size="lg" onClick={handleAddToCart} className="flex-1" variant={added ? 'ghost' : 'primary'}>
              {added ? '✓ Added to Cart' : 'Add to Cart'}
            </Button>
            <Link href="/cart"><Button size="lg" variant="outline">View Cart</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

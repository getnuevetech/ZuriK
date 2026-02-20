'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    productsApi.list()
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: Product) => {
    try {
      const existingCart = localStorage.getItem('cart');
      const cart = existingCart ? JSON.parse(existingCart) : [];
      const existingItem = cart.find((item: { id: number }) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ id: product.id, name: product.name, price: product.price, description: product.description, quantity: 1 });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 1500);
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Cart error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-2">Products</h1>
        <p className="text-neutral-500">Explore our collection of authentic African fashion</p>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">👗</div>
          <h3 className="font-heading text-xl font-semibold text-neutral-700 mb-2">No products yet</h3>
          <p className="text-neutral-500">Check back soon for new arrivals</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} hover>
              <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
              <CardBody>
                {product.category && <Badge variant="primary" className="mb-2">{product.category}</Badge>}
                <h3 className="font-semibold text-neutral-900 mb-1">{product.name}</h3>
                {product.description && <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{product.description}</p>}
                <p className="text-xl font-bold text-secondary-600 mb-4">${product.price}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/products/${product.id}`)}>View</Button>
                  <Button
                    variant={addedId === product.id ? 'ghost' : 'primary'}
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className={addedId === product.id ? 'text-green-600' : ''}
                  >
                    {addedId === product.id ? '✓ Added' : 'Add to Cart'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

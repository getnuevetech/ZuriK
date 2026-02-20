'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../lib/cart-context';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { EmptyState } from '../../components/common/EmptyState';

const TYPE_LABELS: Record<string, string> = {
  'ready-to-wear': 'Ready-to-Wear',
  'fabric-only': 'Fabric Only',
};

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Discover amazing African fashion pieces"
          icon="🛒"
          actionLabel="Browse Products"
          actionHref="/products"
        />
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardBody className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-2xl">
                      {item.type === 'fabric-only' ? '🧵' : '📦'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                  <Badge variant={item.type === 'ready-to-wear' ? 'primary' : 'secondary'} className="mt-1">
                    {TYPE_LABELS[item.type] ?? item.type}
                  </Badge>
                  <p className="text-secondary-600 font-bold mt-1">
                    <PriceDisplay amount={item.price} />
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors"
                    aria-label="Decrease quantity"
                  >−</button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors"
                    aria-label="Increase quantity"
                  >+</button>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-neutral-900">
                    <PriceDisplay amount={item.price * item.quantity} />
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
                  >
                    Remove
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}

          <Card>
            <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-500">Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</p>
                <p className="text-2xl font-bold text-neutral-900">
                  <PriceDisplay amount={cartTotal} />
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/products">
                  <Button variant="outline" size="lg">Continue Shopping</Button>
                </Link>
                <Link href="/checkout">
                  <Button size="lg" className="min-w-48">Proceed to Checkout</Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

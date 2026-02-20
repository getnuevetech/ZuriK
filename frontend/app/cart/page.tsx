'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardFooter } from '../../components/ui/Card';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart');
      setCartItems(stored ? JSON.parse(stored) : []);
    } catch { setCartItems([]); }
  }, []);

  const updateCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
    window.dispatchEvent(new Event('storage'));
  };

  const handleRemove = (id: number) => updateCart(cartItems.filter((item) => item.id !== id));

  const handleQuantityChange = (id: number, delta: number) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    updateCart(updated);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-8">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🛒</div>
          <h3 className="font-heading text-xl font-semibold text-neutral-700 mb-2">Your cart is empty</h3>
          <p className="text-neutral-500 mb-6">Discover amazing African fashion pieces</p>
          <Link href="/products"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardBody className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                  {item.description && <p className="text-sm text-neutral-500 truncate">{item.description}</p>}
                  <p className="text-secondary-600 font-bold mt-1">${item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleQuantityChange(item.id, -1)} className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors">−</button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.id, 1)} className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors">+</button>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-900">${(item.price * item.quantity).toFixed(2)}</p>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1">Remove</Button>
                </div>
              </CardBody>
            </Card>
          ))}
          <Card>
            <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-500">Total</p>
                <p className="text-2xl font-bold text-neutral-900">${total.toFixed(2)}</p>
              </div>
              <Link href="/checkout">
                <Button size="lg" className="min-w-36">Proceed to Checkout</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

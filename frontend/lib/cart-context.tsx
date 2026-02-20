'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'ready-to-wear' | 'fabric-only';
  image?: string;
  designId?: string;
  fabricId?: string;
}

interface CartContextValue {
  cartItems: CartItem[];
  cartTotal: number;
  cartCount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = 'cart_v2';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setCartItems(loadCart());
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const updated = existing
        ? prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
        : [...prev, item];
      saveCart(updated);
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      saveCart(updated);
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    setCartItems((prev) => {
      const updated = qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => i.id === id ? { ...i, quantity: qty } : i);
      saveCart(updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    saveCart([]);
  }, []);

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, cartCount, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi, type AddToCartPayload, type ServerCartItem } from './api';
import { useAuth } from './auth-context';

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

function serverItemToCartItem(item: ServerCartItem): CartItem {
  return {
    id: item.id,
    name: item.name ?? '',
    price: item.price,
    quantity: item.quantity,
    type: item.type,
    image: item.image ?? undefined,
    designId: item.productId,
    fabricId: item.fabricId,
  };
}

function cartItemToAddPayload(item: CartItem): AddToCartPayload {
  return {
    productId: item.designId || (item.type === 'ready-to-wear' ? item.id : undefined),
    fabricId: item.fabricId || (item.type === 'fabric-only' ? item.id : undefined),
    type: item.type,
    quantity: item.quantity,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [serverMode, setServerMode] = useState(false);

  // Load initial cart from localStorage
  useEffect(() => {
    if (!serverMode) {
      setCartItems(loadCart());
    }
  }, []);

  // When auth state resolves, sync to server if authenticated
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      const localItems = loadCart();
      setServerMode(true);
      // Sync local cart to server then load server cart
      const syncAndLoad = async () => {
        try {
          if (localItems.length > 0) {
            const synced = await cartApi.sync(localItems.map(cartItemToAddPayload));
            setCartItems(synced.map(serverItemToCartItem));
            localStorage.removeItem(CART_KEY);
          } else {
            const serverItems = await cartApi.getCart();
            setCartItems(serverItems.map(serverItemToCartItem));
          }
        } catch {
          // Fallback to local cart on error
          setCartItems(localItems);
        }
      };
      syncAndLoad();
    } else {
      setServerMode(false);
      setCartItems(loadCart());
    }
  }, [isAuthenticated, authLoading]);

  const addToCart = useCallback(async (item: CartItem) => {
    if (serverMode) {
      try {
        await cartApi.addToCart(cartItemToAddPayload(item));
        const updated = await cartApi.getCart();
        setCartItems(updated.map(serverItemToCartItem));
      } catch {
        // Fallback: update locally
        setCartItems((prev) => {
          const existing = prev.find((i) => i.id === item.id);
          return existing
            ? prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
            : [...prev, item];
        });
      }
    } else {
      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        const updated = existing
          ? prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
          : [...prev, item];
        saveCart(updated);
        return updated;
      });
    }
  }, [serverMode]);

  const removeFromCart = useCallback(async (id: string) => {
    if (serverMode) {
      try {
        await cartApi.removeItem(id);
        setCartItems((prev) => prev.filter((i) => i.id !== id));
      } catch {
        setCartItems((prev) => prev.filter((i) => i.id !== id));
      }
    } else {
      setCartItems((prev) => {
        const updated = prev.filter((i) => i.id !== id);
        saveCart(updated);
        return updated;
      });
    }
  }, [serverMode]);

  const updateQuantity = useCallback(async (id: string, qty: number) => {
    if (serverMode) {
      try {
        if (qty <= 0) {
          await cartApi.removeItem(id);
          setCartItems((prev) => prev.filter((i) => i.id !== id));
        } else {
          await cartApi.updateItem(id, qty);
          setCartItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
        }
      } catch {
        setCartItems((prev) =>
          qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => i.id === id ? { ...i, quantity: qty } : i)
        );
      }
    } else {
      setCartItems((prev) => {
        const updated = qty <= 0
          ? prev.filter((i) => i.id !== id)
          : prev.map((i) => i.id === id ? { ...i, quantity: qty } : i);
        saveCart(updated);
        return updated;
      });
    }
  }, [serverMode]);

  const clearCart = useCallback(async () => {
    if (serverMode) {
      try {
        await cartApi.clearCart();
      } catch {
        // ignore
      }
    } else {
      saveCart([]);
    }
    setCartItems([]);
  }, [serverMode]);

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

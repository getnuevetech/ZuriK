'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';
import type { Product } from '../types';

const MAX_COMPARISON_ITEMS = 4;
const STORAGE_KEY = 'comparison_items';

interface ComparisonContextValue {
  comparisonItems: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [comparisonItems, setComparisonItems] = useState<Product[]>([]);
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setComparisonItems(JSON.parse(stored) as Product[]);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisonItems));
    } catch {
      // ignore
    }
  }, [comparisonItems]);

  const isInComparison = useCallback(
    (productId: string) => comparisonItems.some((p) => p.id === productId),
    [comparisonItems],
  );

  const addToComparison = useCallback(
    (product: Product) => {
      setComparisonItems((prev) => {
        if (prev.some((p) => p.id === product.id)) {
          toast('info', `${product.name} is already in the comparison list`);
          return prev;
        }
        if (prev.length >= MAX_COMPARISON_ITEMS) {
          toast('warning', `You can compare at most ${MAX_COMPARISON_ITEMS} products at a time`);
          return prev;
        }
        return [...prev, product];
      });
    },
    [toast],
  );

  const removeFromComparison = useCallback((productId: string) => {
    setComparisonItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonItems([]);
  }, []);

  return (
    <ComparisonContext.Provider
      value={{ comparisonItems, addToComparison, removeFromComparison, clearComparison, isInComparison }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison(): ComparisonContextValue {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error('useComparison must be used within ComparisonProvider');
  return ctx;
}

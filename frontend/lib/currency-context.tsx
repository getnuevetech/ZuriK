'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from './api';
import { detectCurrencyByGeo } from './geo-currency';

interface CurrencyContextValue {
  currency: string;
  currencySymbol: string;
  formatPrice: (amount: number) => string;
  setCurrency: (currency: string) => void;
  detectedCurrency: string | null;
}

const DEFAULT_CURRENCY = 'USD';
const LOCAL_STORAGE_KEY = 'user_currency';

function getCurrencySymbol(currency: string): string {
  try {
    return (
      new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value ?? currency
    );
  } catch {
    return currency;
  }
}

function buildFormatPrice(currency: string): (amount: number) => string {
  return (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  currencySymbol: getCurrencySymbol(DEFAULT_CURRENCY),
  formatPrice: buildFormatPrice(DEFAULT_CURRENCY),
  setCurrency: () => {},
  detectedCurrency: null,
});

let cachedCurrency: string | null = null;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(cachedCurrency ?? DEFAULT_CURRENCY);
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);

  useEffect(() => {
    // Priority 1: localStorage (user's explicit choice)
    const stored = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
    if (stored) {
      cachedCurrency = stored;
      setCurrencyState(stored);
      // Still detect geo currency so we can offer "reset to local" option
      detectCurrencyByGeo().then(setDetectedCurrency).catch(() => {});
      return;
    }

    // Priority 2: geo-detection
    detectCurrencyByGeo()
      .then((geo) => {
        setDetectedCurrency(geo);
        cachedCurrency = geo;
        setCurrencyState(geo);
      })
      .catch(() => {
        // Priority 3: admin platform currency
        settingsApi
          .getCurrency()
          .then(({ currency: c }) => {
            cachedCurrency = c;
            setCurrencyState(c);
          })
          .catch(() => {
            // Priority 4: fallback USD (already the default)
          });
      });
  }, []);

  const setCurrency = (newCurrency: string) => {
    cachedCurrency = newCurrency;
    setCurrencyState(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, newCurrency);
    }
  };

  const value: CurrencyContextValue = {
    currency,
    currencySymbol: getCurrencySymbol(currency),
    formatPrice: buildFormatPrice(currency),
    setCurrency,
    detectedCurrency,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext);
}

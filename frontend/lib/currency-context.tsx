'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from './api';

interface CurrencyContextValue {
  currency: string;
  currencySymbol: string;
  formatPrice: (amount: number) => string;
}

const DEFAULT_CURRENCY = 'USD';

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
});

let cachedCurrency: string | null = null;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<string>(cachedCurrency ?? DEFAULT_CURRENCY);

  useEffect(() => {
    if (cachedCurrency) return;
    settingsApi
      .getCurrency()
      .then(({ currency: c }) => {
        cachedCurrency = c;
        setCurrency(c);
      })
      .catch(() => {
        // keep default on error
      });
  }, []);

  const value: CurrencyContextValue = {
    currency,
    currencySymbol: getCurrencySymbol(currency),
    formatPrice: buildFormatPrice(currency),
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext);
}

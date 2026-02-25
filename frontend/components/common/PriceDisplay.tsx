'use client';

import React from 'react';
import { useCurrency } from '../../lib/currency-context';

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
}

export function PriceDisplay({ amount, currency, className = '' }: PriceDisplayProps) {
  const { currency: platformCurrency } = useCurrency();
  const activeCurrency = currency ?? platformCurrency;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: activeCurrency,
    minimumFractionDigits: 2,
  }).format(amount);

  return <span className={className}>{formatted}</span>;
}

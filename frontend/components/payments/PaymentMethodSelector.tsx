'use client';

import React from 'react';
import type { PaymentProvider } from '../../types/payment';

interface PaymentMethodSelectorProps {
  value: PaymentProvider;
  onChange: (provider: PaymentProvider) => void;
}

const METHODS: { provider: PaymentProvider; label: string; description: string; icon: string }[] = [
  {
    provider: 'PAYSTACK',
    label: 'Paystack',
    description: 'Pay with card, bank transfer or USSD (Africa)',
    icon: '💳',
  },
  {
    provider: 'STRIPE',
    label: 'Stripe',
    description: 'Pay with card (International)',
    icon: '🌍',
  },
];

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {METHODS.map((m) => (
        <label
          key={m.provider}
          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
            value === m.provider
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <input
            type="radio"
            name="paymentProvider"
            value={m.provider}
            checked={value === m.provider}
            onChange={() => onChange(m.provider)}
            className="sr-only"
          />
          <span className="text-2xl">{m.icon}</span>
          <div className="flex-1">
            <p className="font-semibold text-neutral-900">{m.label}</p>
            <p className="text-sm text-neutral-500">{m.description}</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            value === m.provider ? 'border-primary-500' : 'border-neutral-300'
          }`}>
            {value === m.provider && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
            )}
          </div>
        </label>
      ))}
    </div>
  );
}

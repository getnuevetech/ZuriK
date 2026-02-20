import React from 'react';
import type { PaymentProvider } from '../../types/payment';

interface PaymentMethodSelectorProps {
  value: PaymentProvider;
  onChange: (provider: PaymentProvider) => void;
}

const PAYMENT_METHODS: Array<{
  provider: PaymentProvider;
  icon: string;
  name: string;
  description: string;
}> = [
  {
    provider: 'PAYSTACK',
    icon: '🏦',
    name: 'Paystack',
    description: 'Card, Bank Transfer, USSD, Mobile Money (NGN, GHS, KES, ZAR)',
  },
  {
    provider: 'STRIPE',
    icon: '💳',
    name: 'Stripe',
    description: 'International credit/debit cards (USD, EUR, GBP and more)',
  },
];

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {PAYMENT_METHODS.map((method) => {
        const isSelected = value === method.provider;
        return (
          <label
            key={method.provider}
            className={[
              'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
              isSelected
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-neutral-200 bg-white hover:border-neutral-300',
            ].join(' ')}
          >
            <input
              type="radio"
              name="paymentProvider"
              value={method.provider}
              checked={isSelected}
              onChange={() => onChange(method.provider)}
              className="mt-1 accent-indigo-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{method.icon}</span>
                <span className="font-semibold text-neutral-900">{method.name}</span>
              </div>
              <p className="text-sm text-neutral-500 mt-1">{method.description}</p>
            </div>
          </label>
        );
      })}
    </div>
  );
}

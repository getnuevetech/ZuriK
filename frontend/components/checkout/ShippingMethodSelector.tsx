'use client';

import React, { useEffect, useState } from 'react';
import { shippingApi, type ShippingMethod } from '../../lib/api';
import { Spinner } from '../ui/Spinner';
import { Badge } from '../ui/Badge';

interface ShippingMethodSelectorProps {
  country?: string;
  orderTotal: number;
  selectedMethodId?: string;
  onSelect: (method: ShippingMethod) => void;
}

export function ShippingMethodSelector({ country, orderTotal, selectedMethodId, onSelect }: ShippingMethodSelectorProps) {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    shippingApi
      .getAvailableMethods(country, orderTotal)
      .then((data) => setMethods(data))
      .catch(() => setMethods([]))
      .finally(() => setLoading(false));
  }, [country, orderTotal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <p className="text-sm text-neutral-500 py-4">No shipping methods available for your location.</p>
    );
  }

  return (
    <div className="space-y-3">
      {methods.map((method) => {
        const isFree = method.effectiveCost === 0;
        const isSelected = method.id === selectedMethodId;
        return (
          <label
            key={method.id}
            className={[
              'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
              isSelected
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-neutral-200 hover:border-indigo-300 bg-white',
            ].join(' ')}
          >
            <input
              type="radio"
              name="shippingMethod"
              value={method.id}
              checked={isSelected}
              onChange={() => onSelect(method)}
              className="mt-1 accent-indigo-600"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-neutral-900">{method.name}</span>
                {isFree && (
                  <Badge variant="success" className="text-xs">FREE</Badge>
                )}
              </div>
              {method.description && (
                <p className="text-sm text-neutral-500 mt-0.5">{method.description}</p>
              )}
              <p className="text-xs text-neutral-400 mt-1">
                {method.estimatedMinDays}–{method.estimatedMaxDays} business days
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              {isFree ? (
                <span className="font-bold text-green-600">FREE</span>
              ) : (
                <span className="font-bold text-neutral-900">
                  ₦{Number(method.basePrice).toLocaleString()}
                </span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}

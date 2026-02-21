'use client';

import React, { useState } from 'react';
import { couponsApi, type Coupon } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CouponInputProps {
  orderTotal: number;
  onCouponApplied: (coupon: Coupon, discountAmount: number) => void;
  onCouponRemoved: () => void;
}

type CouponState = 'idle' | 'loading' | 'applied' | 'error';

export function CouponInput({ orderTotal, onCouponApplied, onCouponRemoved }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [state, setCouponState] = useState<CouponState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleApply = async () => {
    if (!code.trim()) return;
    setCouponState('loading');
    setErrorMessage('');
    try {
      const result = await couponsApi.validate(code.trim(), orderTotal);
      if (result.valid && result.coupon && result.discountAmount !== undefined) {
        setCouponState('applied');
        setAppliedCoupon(result.coupon);
        setDiscountAmount(result.discountAmount);
        onCouponApplied(result.coupon, result.discountAmount);
      } else {
        setCouponState('error');
        setErrorMessage(result.message || 'Invalid coupon code');
      }
    } catch {
      setCouponState('error');
      setErrorMessage('Failed to validate coupon. Please try again.');
    }
  };

  const handleRemove = () => {
    setCode('');
    setCouponState('idle');
    setErrorMessage('');
    setAppliedCoupon(null);
    setDiscountAmount(0);
    onCouponRemoved();
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% off`;
    }
    return `₦${Number(coupon.discountValue).toLocaleString()} off`;
  };

  if (state === 'applied' && appliedCoupon) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              🏷️ {appliedCoupon.code}
            </span>
            <span className="text-sm text-green-700">{formatDiscount(appliedCoupon)}</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-green-600 hover:text-green-800 transition-colors text-lg leading-none"
            aria-label="Remove coupon"
          >
            ×
          </button>
        </div>
        <p className="text-xs text-green-600 font-medium">
          You save ₦{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }}
          className="flex-1"
          disabled={state === 'loading'}
          error={state === 'error' ? errorMessage : undefined}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleApply}
          loading={state === 'loading'}
          disabled={!code.trim() || state === 'loading'}
          className="flex-shrink-0"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

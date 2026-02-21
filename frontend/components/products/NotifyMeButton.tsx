'use client';

import React, { useEffect, useState } from 'react';
import { stockAlertsApi, type StockAlertProductType } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

interface NotifyMeButtonProps {
  productId: string;
  productType: StockAlertProductType;
  className?: string;
}

export function NotifyMeButton({ productId, productType, className = '' }: NotifyMeButtonProps) {
  const { isAuthenticated } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    stockAlertsApi.getMyAlerts().then((alerts) => {
      setSubscribed(alerts.some((a) => a.productId === productId && a.status === 'active'));
      setChecked(true);
    }).catch(() => setChecked(true));
  }, [isAuthenticated, productId]);

  if (!isAuthenticated) return null;
  if (!checked) return null;

  const handleClick = async () => {
    setLoading(true);
    try {
      if (subscribed) {
        await stockAlertsApi.unsubscribe(productId);
        setSubscribed(false);
      } else {
        await stockAlertsApi.subscribe(productId, productType);
        setSubscribed(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={[
        'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
        subscribed
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
        loading ? 'opacity-60 cursor-not-allowed' : '',
        className,
      ].join(' ')}
    >
      {subscribed ? '✓ Alert Set' : '🔔 Notify Me When Available'}
    </button>
  );
}

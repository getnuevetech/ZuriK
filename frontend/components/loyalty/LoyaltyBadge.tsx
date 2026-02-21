'use client';

import React, { useEffect, useState } from 'react';
import { loyaltyApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export function LoyaltyBadge() {
  const { isAuthenticated } = useAuth();
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    loyaltyApi.getBalance().then((b) => setPoints(b.points)).catch(() => {});
  }, [isAuthenticated]);

  if (!isAuthenticated || points === null) return null;

  return (
    <a
      href="/account/loyalty"
      className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition-colors"
      title="Loyalty Points"
    >
      <span>🌟</span>
      <span>{points.toLocaleString()} pts</span>
    </a>
  );
}

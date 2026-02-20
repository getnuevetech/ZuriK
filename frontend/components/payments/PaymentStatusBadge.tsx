'use client';

import React from 'react';
import { Badge } from '../ui/Badge';
import type { PaymentStatus } from '../../types/payment';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const STATUS_MAP: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' | 'default' }> = {
  SUCCESS: { label: 'Paid', variant: 'success' },
  PENDING: { label: 'Pending', variant: 'warning' },
  FAILED: { label: 'Failed', variant: 'danger' },
  REFUNDED: { label: 'Refunded', variant: 'primary' },
};

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const config = STATUS_MAP[status] ?? { label: status, variant: 'default' };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

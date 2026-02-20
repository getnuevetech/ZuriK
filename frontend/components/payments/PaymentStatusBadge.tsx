import React from 'react';
import type { PaymentStatus } from '../../types/payment';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  SUCCESS: { label: 'Paid', className: 'bg-green-100 text-green-800 border-green-200' },
  FAILED: { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-200' },
  REFUNDED: { label: 'Refunded', className: 'bg-blue-100 text-blue-800 border-blue-200' },
};

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className,
      ].join(' ')}
    >
      {config.label}
    </span>
  );
}

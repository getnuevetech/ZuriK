import React from 'react';
import { Badge } from '../ui/Badge';

const STATUS_CONFIG: Record<string, { variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  PENDING_PAYMENT: { variant: 'warning', label: 'Pending Payment' },
  PAID: { variant: 'info', label: 'Paid' },
  IN_PRODUCTION: { variant: 'primary', label: 'In Production' },
  SHIPPED_TO_QA: { variant: 'info', label: 'Shipped to QA' },
  QA_INSPECTION: { variant: 'warning', label: 'QA Inspection' },
  APPROVED: { variant: 'success', label: 'Approved' },
  SHIPPED_TO_CUSTOMER: { variant: 'info', label: 'Shipped' },
  DELIVERED: { variant: 'success', label: 'Delivered' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
  REJECTED: { variant: 'danger', label: 'Rejected' },
};

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { variant: 'default' as const, label: status };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

import React from 'react';
import { Badge } from '../ui/Badge';

const STATUS_CONFIG: Record<string, { variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  pending_payment: { variant: 'warning', label: 'Pending Payment' },
  paid: { variant: 'info', label: 'Paid' },
  awaiting_materials: { variant: 'info', label: 'Awaiting Materials' },
  in_production: { variant: 'primary', label: 'In Production' },
  shipped_to_qa: { variant: 'info', label: 'Shipped to QA' },
  qa_inspection: { variant: 'warning', label: 'QA Inspection' },
  qa_approved: { variant: 'success', label: 'Approved' },
  qa_rejected: { variant: 'danger', label: 'Rejected' },
  shipped_to_customer: { variant: 'info', label: 'Shipped' },
  delivered: { variant: 'success', label: 'Delivered' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
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

'use client';

import React, { useState } from 'react';
import { ordersApi } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import type { OrderStatus } from '../../types';

interface StatusTransitionButtonProps {
  orderId: string;
  targetStatus: OrderStatus;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  notes?: string;
  onSuccess?: (updatedStatus: OrderStatus) => void;
}

export function StatusTransitionButton({
  orderId,
  targetStatus,
  label,
  variant = 'primary',
  notes,
  onSuccess,
}: StatusTransitionButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    setLoading(true);
    try {
      await ordersApi.updateStatus(orderId, targetStatus, notes);
      toast('success', `Order status updated to ${targetStatus.replace(/_/g, ' ')}`);
      onSuccess?.(targetStatus);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to update order status';
      toast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={variant} size="sm" loading={loading} onClick={handleClick}>
      {label}
    </Button>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ordersApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Spinner';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import type { Order } from '../../types';

const ORDER_TYPE_LABELS: Record<string, string> = {
  CUSTOM_DESIGN: 'Custom Design',
  READY_TO_WEAR: 'Ready-to-Wear',
  FABRIC_ONLY: 'Fabric Only',
};

const ORDER_TYPE_VARIANTS: Record<string, 'primary' | 'secondary' | 'info'> = {
  CUSTOM_DESIGN: 'primary',
  READY_TO_WEAR: 'secondary',
  FABRIC_ONLY: 'info',
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'PAID', label: 'Paid' },
  { value: 'IN_PRODUCTION', label: 'In Production' },
  { value: 'SHIPPED_TO_QA', label: 'Shipped to QA' },
  { value: 'QA_INSPECTION', label: 'QA Inspection' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'SHIPPED_TO_CUSTOMER', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }
    ordersApi.getMyOrders()
      .then((data) => setOrders(data))
      .catch(() => toast('error', 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, router, toast]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  const filtered = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const sorted = statusFilter ? filtered : [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-2">My Orders</h1>
          <p className="text-neutral-500">Track and manage your orders</p>
        </div>
        <Link href="/products">
          <Button variant="outline" size="sm">Browse Products</Button>
        </Link>
      </div>

      <div className="mb-6 w-48">
        <Select
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          label="Filter by Status"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : sorted.length === 0 ? (
        <EmptyState
          title={statusFilter ? 'No orders with this status' : 'No orders yet'}
          message={statusFilter ? 'Try a different status filter' : 'Start shopping to place your first order'}
          icon="📦"
          actionLabel={statusFilter ? undefined : 'Browse Products'}
          actionHref={statusFilter ? undefined : '/products'}
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((order) => {
            const itemName = order.design?.name ?? order.fabric?.name ?? 'Order';
            return (
              <Card key={order.id}>
                <CardBody>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-neutral-700">#{order.orderNumber}</span>
                        <Badge variant={ORDER_TYPE_VARIANTS[order.orderType] ?? 'default'}>
                          {ORDER_TYPE_LABELS[order.orderType] ?? order.orderType}
                        </Badge>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-neutral-800 font-medium truncate">{itemName}</p>
                      <p className="text-sm text-neutral-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <PriceDisplay amount={order.totalPrice} className="font-bold text-neutral-900" />
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

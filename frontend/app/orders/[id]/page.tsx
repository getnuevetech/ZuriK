'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { useToast } from '../../../components/ui/Toast';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { OrderStatusBadge } from '../../../components/orders/OrderStatusBadge';
import { OrderStatusTimeline } from '../../../components/orders/OrderStatusTimeline';
import { Breadcrumbs } from '../../../components/common/Breadcrumbs';
import { PriceDisplay } from '../../../components/common/PriceDisplay';
import type { Order } from '../../../types';

const ORDER_TYPE_LABELS: Record<string, string> = {
  CUSTOM_DESIGN: 'Custom Design',
  READY_TO_WEAR: 'Ready-to-Wear',
  FABRIC_ONLY: 'Fabric Only',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }
    if (params?.id) {
      ordersApi.getOrder(String(params.id))
        .then((data) => setOrder(data))
        .catch(() => toast('error', 'Failed to load order'))
        .finally(() => setLoading(false));
    }
  }, [params?.id, isAuthenticated, authLoading, router, toast]);

  if (authLoading || loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!order) return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <h2 className="font-heading text-2xl font-bold text-neutral-700 mb-4">Order not found</h2>
      <Link href="/orders"><Button variant="outline">Back to Orders</Button></Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'My Orders', href: '/orders' },
        { label: `#${order.orderNumber}` },
      ]} />

      {/* Order header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="font-heading text-3xl font-bold text-neutral-900">#{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} className="text-sm px-3 py-1" />
          </div>
          <div className="flex items-center gap-2 flex-wrap text-sm text-neutral-500">
            <Badge variant="default">{ORDER_TYPE_LABELS[order.orderType] ?? order.orderType}</Badge>
            <span>Placed {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <PriceDisplay amount={order.totalPrice} className="text-2xl font-bold text-neutral-900" />
      </div>

      {/* Status timeline */}
      <Card className="mb-6">
        <CardHeader><h2 className="font-heading text-lg font-semibold text-neutral-800">Order Progress</h2></CardHeader>
        <CardBody className="overflow-x-auto">
          <OrderStatusTimeline currentStatus={order.status} />
        </CardBody>
      </Card>

      {/* Order items */}
      <Card className="mb-6">
        <CardHeader><h2 className="font-heading text-lg font-semibold text-neutral-800">Order Items</h2></CardHeader>
        <CardBody className="space-y-4">
          {order.design && (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Design</p>
                <p className="font-medium text-neutral-900">{order.design.name}</p>
                {order.design.category && <Badge variant="primary" className="mt-1">{order.design.category}</Badge>}
              </div>
              {order.designPrice !== undefined && (
                <PriceDisplay amount={order.designPrice} className="font-semibold text-neutral-700" />
              )}
            </div>
          )}
          {order.fabric && (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Fabric</p>
                <p className="font-medium text-neutral-900">{order.fabric.name}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {order.fabric.material && <Badge variant="secondary">{order.fabric.material}</Badge>}
                  {order.fabric.color && <Badge variant="default">{order.fabric.color}</Badge>}
                </div>
              </div>
              {order.fabricPrice !== undefined && (
                <PriceDisplay amount={order.fabricPrice} className="font-semibold text-neutral-700" />
              )}
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <span className="text-sm text-neutral-600">Quantity: {order.quantity}</span>
          </div>
        </CardBody>
      </Card>

      {/* Measurements (custom design only) */}
      {order.orderType === 'CUSTOM_DESIGN' && (order.chest || order.waist || order.hips) && (
        <Card className="mb-6">
          <CardHeader><h2 className="font-heading text-lg font-semibold text-neutral-800">Measurements</h2></CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {order.chest && <div><p className="text-xs text-neutral-500">Chest</p><p className="font-medium">{order.chest} {order.unit ?? 'cm'}</p></div>}
              {order.waist && <div><p className="text-xs text-neutral-500">Waist</p><p className="font-medium">{order.waist} {order.unit ?? 'cm'}</p></div>}
              {order.hips && <div><p className="text-xs text-neutral-500">Hips</p><p className="font-medium">{order.hips} {order.unit ?? 'cm'}</p></div>}
              {order.shoulder && <div><p className="text-xs text-neutral-500">Shoulder</p><p className="font-medium">{order.shoulder} {order.unit ?? 'cm'}</p></div>}
              {order.sleeveLength && <div><p className="text-xs text-neutral-500">Sleeve Length</p><p className="font-medium">{order.sleeveLength} {order.unit ?? 'cm'}</p></div>}
              {order.length && <div><p className="text-xs text-neutral-500">Length</p><p className="font-medium">{order.length} {order.unit ?? 'cm'}</p></div>}
            </div>
            {order.measurementNotes && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-500 mb-1">Measurement Notes</p>
                <p className="text-sm text-neutral-700">{order.measurementNotes}</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Price breakdown */}
      <Card className="mb-6">
        <CardHeader><h2 className="font-heading text-lg font-semibold text-neutral-800">Price Breakdown</h2></CardHeader>
        <CardBody className="space-y-3">
          {order.designPrice !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Design</span>
              <PriceDisplay amount={order.designPrice} className="font-medium" />
            </div>
          )}
          {order.fabricPrice !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Fabric</span>
              <PriceDisplay amount={order.fabricPrice} className="font-medium" />
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t border-neutral-200">
            <span>Total</span>
            <PriceDisplay amount={order.totalPrice} />
          </div>
        </CardBody>
      </Card>

      {/* Customer notes */}
      {order.customerNotes && (
        <Card className="mb-6">
          <CardHeader><h2 className="font-heading text-lg font-semibold text-neutral-800">Notes</h2></CardHeader>
          <CardBody>
            <p className="text-neutral-700">{order.customerNotes}</p>
          </CardBody>
        </Card>
      )}

      <div className="flex gap-4">
        <Link href="/orders"><Button variant="outline">Back to Orders</Button></Link>
        <Link href="/products"><Button variant="ghost">Continue Shopping</Button></Link>
      </div>
    </div>
  );
}

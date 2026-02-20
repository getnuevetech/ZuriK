'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ordersApi } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { OrderStatusBadge } from '../../../components/orders/OrderStatusBadge';
import { PriceDisplay } from '../../../components/common/PriceDisplay';
import type { Order } from '../../../types';

const ORDER_TYPE_LABELS: Record<string, string> = {
  CUSTOM_DESIGN: 'Custom Design',
  READY_TO_WEAR: 'Ready-to-Wear',
  FABRIC_ONLY: 'Fabric Only',
};

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    if (orderId) {
      ordersApi.getOrder(orderId)
        .then((data) => setOrder(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="text-6xl mb-4 animate-bounce">🎉</div>
      <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-3">Order Confirmed!</h1>
      <p className="text-neutral-500 text-lg mb-8">
        Thank you for shopping with African Fashion. Your order is being processed.
      </p>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : order ? (
        <Card className="mb-8 text-left">
          <CardBody>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Order Number</p>
                <p className="font-mono font-bold text-neutral-800 text-lg">#{order.orderNumber}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default">{ORDER_TYPE_LABELS[order.orderType] ?? order.orderType}</Badge>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            <div className="space-y-2 border-t border-neutral-100 pt-4">
              {order.design && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Design: {order.design.name}</span>
                  {order.designPrice !== undefined && <PriceDisplay amount={order.designPrice} className="font-medium" />}
                </div>
              )}
              {order.fabric && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Fabric: {order.fabric.name}</span>
                  {order.fabricPrice !== undefined && <PriceDisplay amount={order.fabricPrice} className="font-medium" />}
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-neutral-100 pt-2">
                <span>Total</span>
                <PriceDisplay amount={order.totalPrice} />
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardBody>
            <p className="text-neutral-500">
              We&apos;ll notify you when your order status changes.
              You can track your order in My Orders.
            </p>
          </CardBody>
        </Card>
      )}

      <div className="bg-primary-50 rounded-xl p-4 border border-primary-100 mb-8 text-left">
        <h3 className="font-semibold text-primary-800 mb-2">What&apos;s Next?</h3>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>✓ Your order has been received</li>
          <li>✓ Our team will review and confirm your order</li>
          <li>✓ You&apos;ll be notified when production begins</li>
          <li>✓ QA inspection before delivery</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/orders">
          <Button variant="primary">View My Orders</Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner size="lg" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}

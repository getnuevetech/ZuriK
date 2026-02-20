'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useCart } from '../../lib/cart-context';
import { useToast } from '../../components/ui/Toast';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { EmptyState } from '../../components/common/EmptyState';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();

  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <EmptyState
          title="Your cart is empty"
          message="Add some items to your cart before checking out"
          icon="🛒"
          actionLabel="Browse Products"
          actionHref="/products"
        />
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    const orderIds: string[] = [];
    try {
      for (const item of cartItems) {
        if (item.type === 'ready-to-wear' && item.designId) {
          const order = await ordersApi.createReadyToWear({
            designId: item.designId,
            quantity: item.quantity,
            customerNotes: customerNotes || undefined,
          });
          orderIds.push(order.id);
        } else if (item.type === 'fabric-only' && item.fabricId) {
          const order = await ordersApi.createFabricOnly({
            fabricId: item.fabricId,
            quantity: item.quantity,
            customerNotes: customerNotes || undefined,
          });
          orderIds.push(order.id);
        }
      }
      clearCart();
      toast('success', 'Orders placed successfully!');
      const firstId = orderIds[0];
      router.push(firstId ? `/orders/confirmation?orderId=${firstId}` : '/orders/confirmation');
    } catch {
      toast('error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-8">Checkout</h1>

      {/* Order summary */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Order Summary</h2>
        </CardHeader>
        <CardBody className="divide-y divide-neutral-100">
          {cartItems.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={item.type === 'ready-to-wear' ? 'primary' : 'secondary'} className="text-xs">
                    {item.type === 'ready-to-wear' ? 'Ready-to-Wear' : 'Fabric Only'}
                  </Badge>
                  <span className="text-xs text-neutral-500">× {item.quantity}</span>
                </div>
              </div>
              <PriceDisplay amount={item.price * item.quantity} className="font-semibold text-neutral-900 flex-shrink-0" />
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Customer notes */}
      <Card className="mb-6">
        <CardBody>
          <Textarea
            label="Special Instructions (optional)"
            placeholder="Any notes or special requests for your order..."
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            rows={3}
          />
        </CardBody>
      </Card>

      {/* Price breakdown */}
      <Card className="mb-6">
        <CardBody className="space-y-3">
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <PriceDisplay amount={cartTotal} />
          </div>
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Platform fee</span>
            <span className="text-green-600">Included</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-neutral-200 pt-2">
            <span>Total</span>
            <PriceDisplay amount={cartTotal} />
          </div>
        </CardBody>
      </Card>

      <div className="flex gap-3">
        <Link href="/cart" className="flex-shrink-0">
          <Button variant="outline" size="lg">← Back to Cart</Button>
        </Link>
        <Button size="lg" loading={loading} onClick={handlePlaceOrder} className="flex-1">
          Place Order
        </Button>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersApi, paymentsApi } from '../../lib/api';
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
import { PaymentMethodSelector } from '../../components/payments/PaymentMethodSelector';
import { ShippingAddressForm, ShippingAddress } from '../../components/payments/ShippingAddressForm';
import type { PaymentProvider } from '../../types/payment';

const STEPS = ['Review', 'Shipping', 'Payment', 'Confirm'];

const STEP_ICONS = ['🛒', '📦', '💳', '✅'];

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('PAYSTACK');
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    addressLine1: '',
    city: '',
    country: '',
    phone: '',
  });

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

  const isShippingValid =
    shippingAddress.fullName.trim() &&
    shippingAddress.addressLine1.trim() &&
    shippingAddress.city.trim() &&
    shippingAddress.country.trim() &&
    shippingAddress.phone.trim();

  const handlePay = async () => {
    setLoading(true);
    try {
      const orderIds: string[] = [];
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

      if (orderIds.length === 0) {
        toast('error', 'No valid orders to process.');
        return;
      }

      const firstOrderId = orderIds[0];
      const callbackUrl = `${window.location.origin}/payments/callback`;

      const { paymentUrl } = await paymentsApi.initiate(firstOrderId, paymentProvider, callbackUrl);

      clearCart();
      window.location.href = paymentUrl;
    } catch {
      toast('error', 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-8">Checkout</h1>

      {/* Progress indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, idx) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={[
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
                  idx < step ? 'bg-indigo-600 border-indigo-600 text-white' : '',
                  idx === step ? 'bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-100' : '',
                  idx > step ? 'bg-white border-neutral-300 text-neutral-400' : '',
                ].join(' ')}
              >
                {idx < step ? '✓' : STEP_ICONS[idx]}
              </div>
              <span
                className={[
                  'mt-1 text-xs text-center',
                  idx === step ? 'font-semibold text-indigo-700' : '',
                  idx < step ? 'text-indigo-600' : '',
                  idx > step ? 'text-neutral-400' : '',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={['flex-1 h-0.5 mx-1 mt-[-10px] transition-colors', idx < step ? 'bg-indigo-600' : 'bg-neutral-200'].join(' ')}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Review */}
      {step === 0 && (
        <>
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
            <Button size="lg" onClick={() => setStep(1)} className="flex-1">
              Continue to Shipping →
            </Button>
          </div>
        </>
      )}

      {/* Step 1: Shipping */}
      {step === 1 && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <h2 className="font-heading text-xl font-semibold text-neutral-800">Shipping Address</h2>
            </CardHeader>
            <CardBody>
              <ShippingAddressForm value={shippingAddress} onChange={setShippingAddress} />
            </CardBody>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(0)}>← Back</Button>
            <Button
              size="lg"
              onClick={() => setStep(2)}
              disabled={!isShippingValid}
              className="flex-1"
            >
              Continue to Payment →
            </Button>
          </div>
        </>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <h2 className="font-heading text-xl font-semibold text-neutral-800">Payment Method</h2>
            </CardHeader>
            <CardBody>
              <PaymentMethodSelector value={paymentProvider} onChange={setPaymentProvider} />
            </CardBody>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(1)}>← Back</Button>
            <Button size="lg" onClick={() => setStep(3)} className="flex-1">
              Review Order →
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <h2 className="font-heading text-xl font-semibold text-neutral-800">Order Confirmation</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-1">Items</h3>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span className="text-neutral-600">{item.name} × {item.quantity}</span>
                    <PriceDisplay amount={item.price * item.quantity} className="font-medium" />
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-100 pt-3">
                <h3 className="text-sm font-semibold text-neutral-700 mb-1">Shipping to</h3>
                <p className="text-sm text-neutral-600">
                  {[
                    shippingAddress.fullName,
                    shippingAddress.addressLine1,
                    shippingAddress.addressLine2,
                    shippingAddress.city,
                    shippingAddress.state,
                    shippingAddress.country,
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
              <div className="border-t border-neutral-100 pt-3">
                <h3 className="text-sm font-semibold text-neutral-700 mb-1">Payment via</h3>
                <p className="text-sm text-neutral-600">
                  {paymentProvider === 'PAYSTACK' ? '🏦 Paystack' : '💳 Stripe'}
                </p>
              </div>
              <div className="border-t border-neutral-100 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <PriceDisplay amount={cartTotal} />
              </div>
            </CardBody>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(2)}>← Back</Button>
            <Button size="lg" loading={loading} onClick={handlePay} className="flex-1">
              Pay Now →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

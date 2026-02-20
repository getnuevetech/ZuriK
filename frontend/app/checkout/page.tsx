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
import { ShippingAddressForm, type ShippingAddress } from '../../components/payments/ShippingAddressForm';
import type { PaymentProvider } from '../../types/payment';

type Step = 'review' | 'shipping' | 'payment' | 'confirm';

const STEPS: { key: Step; label: string }[] = [
  { key: 'review', label: 'Review' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'confirm', label: 'Confirm' },
];

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('review');
  const [customerNotes, setCustomerNotes] = useState('');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('PAYSTACK');
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

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const validateShipping = (): boolean => {
    if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.country) {
      toast('error', 'Please fill in all required shipping fields');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 'review') setStep('shipping');
    else if (step === 'shipping') {
      if (validateShipping()) setStep('payment');
    } else if (step === 'payment') setStep('confirm');
  };

  const handleBack = () => {
    if (step === 'shipping') setStep('review');
    else if (step === 'payment') setStep('shipping');
    else if (step === 'confirm') setStep('payment');
  };

  const handlePlaceOrder = async () => {
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
        toast('error', 'No orders were created');
        return;
      }

      // Initiate payment for the first order
      const firstOrderId = orderIds[0];
      const { paymentUrl } = await paymentsApi.initiate(firstOrderId, paymentProvider);

      clearCart();
      // Redirect to payment provider
      window.location.href = paymentUrl;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast('error', msg || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i < currentStepIndex
                  ? 'bg-green-500 text-white'
                  : i === currentStepIndex
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-200 text-neutral-500'
              }`}>
                {i < currentStepIndex ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                i === currentStepIndex ? 'text-primary-600' : 'text-neutral-500'
              }`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < currentStepIndex ? 'bg-green-500' : 'bg-neutral-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step: Review */}
      {step === 'review' && (
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
        </>
      )}

      {/* Step: Shipping */}
      {step === 'shipping' && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="font-heading text-xl font-semibold text-neutral-800">Shipping Address</h2>
          </CardHeader>
          <CardBody>
            <ShippingAddressForm value={shippingAddress} onChange={setShippingAddress} />
          </CardBody>
        </Card>
      )}

      {/* Step: Payment */}
      {step === 'payment' && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="font-heading text-xl font-semibold text-neutral-800">Payment Method</h2>
          </CardHeader>
          <CardBody>
            <PaymentMethodSelector value={paymentProvider} onChange={setPaymentProvider} />
          </CardBody>
        </Card>
      )}

      {/* Step: Confirm */}
      {step === 'confirm' && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <h2 className="font-heading text-xl font-semibold text-neutral-800">Order Summary</h2>
            </CardHeader>
            <CardBody className="divide-y divide-neutral-100">
              {cartItems.map((item) => (
                <div key={item.id} className="py-2 flex justify-between">
                  <span className="text-neutral-700">{item.name} × {item.quantity}</span>
                  <PriceDisplay amount={item.price * item.quantity} className="font-medium" />
                </div>
              ))}
              <div className="pt-2 flex justify-between font-bold">
                <span>Total</span>
                <PriceDisplay amount={cartTotal} />
              </div>
            </CardBody>
          </Card>
          <Card className="mb-6">
            <CardBody className="space-y-2 text-sm text-neutral-700">
              <p><span className="font-medium">Ship to:</span> {shippingAddress.fullName}, {shippingAddress.addressLine1}, {shippingAddress.city}, {shippingAddress.country}</p>
              <p><span className="font-medium">Pay with:</span> {paymentProvider}</p>
            </CardBody>
          </Card>
        </>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {step === 'review' ? (
          <Link href="/cart" className="flex-shrink-0">
            <Button variant="outline" size="lg">← Back to Cart</Button>
          </Link>
        ) : (
          <Button variant="outline" size="lg" onClick={handleBack}>← Back</Button>
        )}
        {step === 'confirm' ? (
          <Button size="lg" loading={loading} onClick={handlePlaceOrder} className="flex-1">
            Place Order &amp; Pay
          </Button>
        ) : (
          <Button size="lg" onClick={handleNext} className="flex-1">
            {step === 'review' ? 'Continue to Shipping' : step === 'shipping' ? 'Continue to Payment' : 'Review Order'} →
          </Button>
        )}
      </div>
    </div>
  );
}

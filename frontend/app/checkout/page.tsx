'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersApi, paymentsApi, shippingApi, addressesApi, loyaltyApi, settingsApi, type ShippingMethod, type Address, type LoyaltyBalance } from '../../lib/api';
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
import { CouponInput } from '../../components/checkout/CouponInput';
import { ShippingMethodSelector } from '../../components/checkout/ShippingMethodSelector';
import type { PaymentProvider } from '../../types/payment';
import type { Coupon } from '../../lib/api';
import { useCurrency } from '../../lib/currency-context';

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
  const { cartItems, cartTotal, cartLoading, clearCart } = useCart();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const [step, setStep] = useState<Step>('review');
  const [customerNotes, setCustomerNotes] = useState('');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('PAYSTACK');
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [loyaltyBalance, setLoyaltyBalance] = useState<LoyaltyBalance | null>(null);
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [platformFeeRate, setPlatformFeeRate] = useState(10);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    } else {
      // Load saved addresses for shipping step
      addressesApi.getAll().then(setSavedAddresses).catch(() => {});
      // Load loyalty balance
      loyaltyApi.getBalance().then(setLoyaltyBalance).catch(() => {});
    }
    // Fetch public platform fee rate (no auth required)
    settingsApi.getPublicFeeRate().then((r) => setPlatformFeeRate(r.percentageFee)).catch(() => {});
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || cartLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

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
  const shippingCost = selectedShippingMethod?.effectiveCost ?? selectedShippingMethod?.basePrice ?? 0;
  const loyaltyDiscount = useLoyalty ? loyaltyPointsToRedeem / 100 : 0;
  const subtotal = cartTotal - couponDiscount - loyaltyDiscount;
  const platformFee = Math.max(0, (subtotal * platformFeeRate) / 100);
  const orderTotal = Math.max(0, subtotal + platformFee + Number(shippingCost));

  const validateShipping = (): boolean => {
    if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.country) {
      toast('error', 'Please fill in all required shipping fields');
      return false;
    }
    if (!selectedShippingMethod) {
      toast('error', 'Please select a shipping method');
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
      // Save address if requested
      if (saveNewAddress && shippingAddress.addressLine1) {
        const nameParts = shippingAddress.fullName.split(' ');
        await addressesApi.create({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          country: shippingAddress.country,
          postalCode: shippingAddress.postalCode,
        }).catch(() => {});
      }

      const orderIds: string[] = [];
      for (const item of cartItems) {
        if (item.type === 'ready-to-wear' && item.designId) {
          const order = await ordersApi.createReadyToWear({
            readyToWearProductId: item.designId,
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
              <CouponInput
                orderTotal={cartTotal}
                onCouponApplied={(coupon, discount) => {
                  setAppliedCoupon(coupon);
                  setCouponDiscount(discount);
                }}
                onCouponRemoved={() => {
                  setAppliedCoupon(null);
                  setCouponDiscount(0);
                }}
              />
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <PriceDisplay amount={cartTotal} />
              </div>
              {appliedCoupon && couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>−{formatPrice(couponDiscount)}</span>
                </div>
              )}
              {loyaltyBalance && loyaltyBalance.points >= 100 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-amber-800">
                    <input
                      type="checkbox"
                      checked={useLoyalty}
                      onChange={(e) => {
                        setUseLoyalty(e.target.checked);
                        if (!e.target.checked) setLoyaltyPointsToRedeem(0);
                        else setLoyaltyPointsToRedeem(Math.min(loyaltyBalance.points, Math.floor(cartTotal * 100)));
                      }}
                      className="rounded"
                    />
                    🌟 Use Loyalty Points ({loyaltyBalance.points.toLocaleString()} pts available)
                  </label>
                  {useLoyalty && (
                    <div className="space-y-1">
                      <input
                        type="range"
                        min={0}
                        max={Math.min(loyaltyBalance.points, Math.floor(cartTotal * 100))}
                        step={100}
                        value={loyaltyPointsToRedeem}
                        onChange={(e) => setLoyaltyPointsToRedeem(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                      <p className="text-xs text-amber-700">
                        Redeeming <strong>{loyaltyPointsToRedeem.toLocaleString()} pts</strong> → −${(loyaltyPointsToRedeem / 100).toFixed(2)} discount
                      </p>
                    </div>
                  )}
                </div>
              )}
              {useLoyalty && loyaltyDiscount > 0 && (
                <div className="flex justify-between text-sm text-amber-600">
                  <span>Loyalty Points ({loyaltyPointsToRedeem.toLocaleString()} pts)</span>
                  <span>−${loyaltyDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Shipping</span>
                {selectedShippingMethod ? (
                  selectedShippingMethod.effectiveCost === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <PriceDisplay amount={selectedShippingMethod.effectiveCost ?? selectedShippingMethod.basePrice} />
                  )
                ) : (
                  <span className="text-neutral-400">Select a shipping method</span>
                )}
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Platform fee ({platformFeeRate}%)</span>
                <PriceDisplay amount={platformFee} className="text-neutral-600" />
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-neutral-200 pt-2">
                <span>Total</span>
                <PriceDisplay amount={orderTotal} />
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {/* Step: Shipping */}
      {step === 'shipping' && (
        <>
          {savedAddresses.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="font-heading text-xl font-semibold text-neutral-800">Saved Addresses</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setShippingAddress({
                          fullName: `${addr.firstName} ${addr.lastName}`,
                          addressLine1: addr.addressLine1,
                          addressLine2: addr.addressLine2 || '',
                          city: addr.city,
                          state: addr.state || '',
                          postalCode: addr.postalCode || '',
                          country: addr.country,
                          phone: addr.phone || '',
                        });
                      }}
                      className="w-full text-left p-3 border border-neutral-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-neutral-900">{addr.label}</span>
                        {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>}
                      </div>
                      <p className="text-sm text-neutral-600">{addr.firstName} {addr.lastName} · {addr.addressLine1}, {addr.city}, {addr.country}</p>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="font-heading text-xl font-semibold text-neutral-800">Shipping Address</h2>
            </CardHeader>
            <CardBody>
              <ShippingAddressForm value={shippingAddress} onChange={setShippingAddress} />
              <label className="flex items-center gap-2 text-sm text-neutral-700 mt-4">
                <input
                  type="checkbox"
                  checked={saveNewAddress}
                  onChange={(e) => setSaveNewAddress(e.target.checked)}
                  className="rounded border-neutral-300"
                />
                Save this address to my address book
              </label>
            </CardBody>
          </Card>
          <Card className="mb-6">
            <CardHeader>
              <h2 className="font-heading text-xl font-semibold text-neutral-800">Shipping Method</h2>
            </CardHeader>
            <CardBody>
              <ShippingMethodSelector
                country={shippingAddress.country || undefined}
                orderTotal={cartTotal - couponDiscount}
                selectedMethodId={selectedShippingMethod?.id}
                onSelect={setSelectedShippingMethod}
              />
            </CardBody>
          </Card>
        </>
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
              {appliedCoupon && couponDiscount > 0 && (
                <div className="py-2 flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>−{formatPrice(couponDiscount)}</span>
                </div>
              )}
              {selectedShippingMethod && (
                <div className="py-2 flex justify-between text-sm text-neutral-600">
                  <span>Shipping ({selectedShippingMethod.name})</span>
                  {selectedShippingMethod.effectiveCost === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <PriceDisplay amount={selectedShippingMethod.effectiveCost ?? selectedShippingMethod.basePrice} className="font-medium" />
                  )}
                </div>
              )}
              <div className="py-2 flex justify-between text-sm text-neutral-600">
                <span>Platform fee ({platformFeeRate}%)</span>
                <PriceDisplay amount={platformFee} className="font-medium" />
              </div>
              <div className="pt-2 flex justify-between font-bold">
                <span>Total</span>
                <PriceDisplay amount={orderTotal} />
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

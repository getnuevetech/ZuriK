'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';

interface ShippingInfo { name: string; address: string; city: string; zip: string; }
interface PaymentInfo { cardNumber: string; expiry: string; cvv: string; }

export default function CheckoutPage() {
  const router = useRouter();
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({ name: '', address: '', city: '', zip: '' });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({ cardNumber: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);

  const setShipping = (field: keyof ShippingInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setShippingInfo((s) => ({ ...s, [field]: e.target.value }));

  const setPayment = (field: keyof PaymentInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPaymentInfo((s) => ({ ...s, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('storage'));
    setLoading(false);
    router.push('/order-confirmation');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><h2 className="font-heading text-xl font-semibold text-neutral-800">Shipping Information</h2></CardHeader>
          <CardBody className="space-y-4">
            <Input label="Full name" type="text" placeholder="John Doe" value={shippingInfo.name} onChange={setShipping('name')} required />
            <Input label="Address" type="text" placeholder="123 Main Street" value={shippingInfo.address} onChange={setShipping('address')} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" type="text" placeholder="Lagos" value={shippingInfo.city} onChange={setShipping('city')} required />
              <Input label="Zip code" type="text" placeholder="100001" value={shippingInfo.zip} onChange={setShipping('zip')} required />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><h2 className="font-heading text-xl font-semibold text-neutral-800">Payment Information</h2></CardHeader>
          <CardBody className="space-y-4">
            <Input label="Card number" type="text" placeholder="1234 5678 9012 3456" value={paymentInfo.cardNumber} onChange={setPayment('cardNumber')} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Expiry date" type="text" placeholder="MM/YY" value={paymentInfo.expiry} onChange={setPayment('expiry')} required />
              <Input label="CVV" type="text" placeholder="123" value={paymentInfo.cvv} onChange={setPayment('cvv')} required />
            </div>
          </CardBody>
        </Card>
        <Button type="submit" size="lg" loading={loading} className="w-full">Complete Purchase</Button>
      </form>
    </div>
  );
}

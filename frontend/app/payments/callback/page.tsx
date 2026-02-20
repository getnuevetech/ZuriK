'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentsApi } from '../../../lib/api';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentId = searchParams.get('paymentId');
  const status = searchParams.get('status');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setError('Missing payment ID');
      setLoading(false);
      return;
    }

    if (status === 'cancelled') {
      setError('Payment was cancelled');
      setLoading(false);
      return;
    }

    paymentsApi
      .verify(paymentId)
      .then((result) => {
        if (result.success) {
          setSuccess(true);
          setOrderId(result.payment.orderId);
        } else {
          setError('Payment was not successful. Please try again.');
        }
      })
      .catch(() => {
        setError('Failed to verify payment. Please contact support.');
      })
      .finally(() => setLoading(false));
  }, [paymentId, status]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner size="lg" />
        <p className="text-neutral-600">Verifying your payment...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl">
          ✅
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-2">Payment Successful!</h1>
          <p className="text-neutral-600">Your order has been confirmed and is being processed.</p>
        </div>
        <Button
          size="lg"
          onClick={() =>
            router.push(orderId ? `/orders/confirmation?orderId=${orderId}` : '/orders')
          }
        >
          View Order
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-4xl">
        ❌
      </div>
      <div>
        <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-2">Payment Failed</h1>
        <p className="text-neutral-600">{error || 'Something went wrong with your payment.'}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={() => router.push('/cart')}>
          Back to Cart
        </Button>
        <Button size="lg" onClick={() => router.push('/checkout')}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6">
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        }
      >
        <PaymentCallbackContent />
      </Suspense>
    </div>
  );
}

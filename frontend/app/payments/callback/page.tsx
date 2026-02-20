'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { paymentsApi } from '../../../lib/api';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { PaymentStatusBadge } from '../../../components/payments/PaymentStatusBadge';
import type { Payment } from '../../../types/payment';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const cancelled = searchParams.get('cancelled');

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!paymentId) {
      setError('No payment ID found in URL.');
      setLoading(false);
      return;
    }
    paymentsApi
      .verify(paymentId)
      .then((data) => setPayment(data))
      .catch(() => setError('Failed to verify payment status.'))
      .finally(() => setLoading(false));
  }, [paymentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="text-neutral-600">Verifying your payment…</p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="font-heading text-2xl font-bold text-neutral-900 mb-2">
          {cancelled === 'true' ? 'Payment Cancelled' : 'Verification Error'}
        </h1>
        <p className="text-neutral-600 mb-6">
          {cancelled === 'true'
            ? 'You cancelled the payment. Your order is still saved — you can complete payment from your orders page.'
            : error || 'Unable to verify payment status.'}
        </p>
        <Link href="/orders">
          <Button variant="outline">View My Orders</Button>
        </Link>
      </div>
    );
  }

  const isSuccess = payment.status === 'SUCCESS';

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">{isSuccess ? '🎉' : '❌'}</div>
      <h1 className="font-heading text-2xl font-bold text-neutral-900 mb-2">
        {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
      </h1>
      <p className="text-neutral-600 mb-6">
        {isSuccess
          ? 'Your payment has been confirmed and your order is now being processed.'
          : 'Your payment could not be processed. Please try again from your orders page.'}
      </p>

      <Card className="mb-6 text-left">
        <CardBody className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Status</span>
            <PaymentStatusBadge status={payment.status} />
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Provider</span>
            <span className="font-medium">{payment.provider}</span>
          </div>
          {payment.paidAt && (
            <div className="flex justify-between">
              <span className="text-neutral-600">Paid at</span>
              <span className="font-medium">{new Date(payment.paidAt).toLocaleString()}</span>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="flex gap-3 justify-center">
        {payment.order?.id && (
          <Link href={`/orders/${payment.order.id}`}>
            <Button>View Order</Button>
          </Link>
        )}
        <Link href="/orders">
          <Button variant="outline">My Orders</Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="text-neutral-600">Loading…</p>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}

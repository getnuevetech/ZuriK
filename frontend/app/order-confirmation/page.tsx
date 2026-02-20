import React from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function OrderConfirmation() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-3">Order Confirmed!</h1>
      <p className="text-neutral-500 text-lg mb-8">Thank you for shopping with African Fashion. Your order is being processed.</p>
      <Card className="mb-8">
        <CardBody>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-sm text-neutral-500 mb-1">Order ID</p>
              <p className="font-mono font-semibold text-neutral-800">#AF-{Math.random().toString(36).slice(2, 8).toUpperCase()}</p>
            </div>
            <Badge variant="success" className="text-sm">Processing</Badge>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100 text-left">
            <p className="text-sm text-neutral-500">
              You will receive an email confirmation shortly. Our QA team will inspect your items before delivery.
            </p>
          </div>
        </CardBody>
      </Card>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/products"><Button variant="outline">Continue Shopping</Button></Link>
        <Link href="/"><Button>Back to Home</Button></Link>
      </div>
    </div>
  );
}

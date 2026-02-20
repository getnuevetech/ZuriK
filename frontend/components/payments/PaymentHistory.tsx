'use client';

import React from 'react';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { PriceDisplay } from '../common/PriceDisplay';
import type { Payment } from '../../types/payment';

interface PaymentHistoryProps {
  payments: Payment[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return <p className="text-sm text-neutral-500 py-2">No payment attempts yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="py-2 pr-4 text-left font-medium text-neutral-600">Provider</th>
            <th className="py-2 pr-4 text-left font-medium text-neutral-600">Amount</th>
            <th className="py-2 pr-4 text-left font-medium text-neutral-600">Status</th>
            <th className="py-2 pr-4 text-left font-medium text-neutral-600">Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-b border-neutral-100 last:border-0">
              <td className="py-2 pr-4 text-neutral-700">{p.provider}</td>
              <td className="py-2 pr-4">
                <PriceDisplay amount={p.amount} />
              </td>
              <td className="py-2 pr-4">
                <PaymentStatusBadge status={p.status} />
              </td>
              <td className="py-2 pr-4 text-neutral-500">
                {new Date(p.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

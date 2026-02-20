import React from 'react';
import type { Payment } from '../../types/payment';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { PriceDisplay } from '../common/PriceDisplay';

interface PaymentHistoryProps {
  payments: Payment[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return <p className="text-sm text-neutral-500">No payment attempts yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left py-2 px-3 text-neutral-500 font-medium">Date</th>
            <th className="text-left py-2 px-3 text-neutral-500 font-medium">Provider</th>
            <th className="text-left py-2 px-3 text-neutral-500 font-medium">Amount</th>
            <th className="text-left py-2 px-3 text-neutral-500 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b border-neutral-100 last:border-0">
              <td className="py-2 px-3 text-neutral-600">
                {new Date(payment.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="py-2 px-3 text-neutral-700 font-medium">{payment.provider}</td>
              <td className="py-2 px-3">
                <PriceDisplay amount={payment.amount} />
              </td>
              <td className="py-2 px-3">
                <PaymentStatusBadge status={payment.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

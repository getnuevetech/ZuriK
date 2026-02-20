'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { PriceDisplay } from '../common/PriceDisplay';
import type { Payout, PayoutStatus } from '../../types/payment';

interface PayoutSummaryCardProps {
  payouts: Payout[];
}

const PAYOUT_STATUS_VARIANT: Record<PayoutStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  COMPLETED: 'success',
  PENDING: 'warning',
  PROCESSING: 'info',
  FAILED: 'danger',
};

export function PayoutSummaryCard({ payouts }: PayoutSummaryCardProps) {
  const totalEarnings = payouts.reduce((sum, p) => sum + Number(p.amount), 0);
  const completedEarnings = payouts
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <Card>
      <CardHeader>
        <h2 className="font-heading text-lg font-semibold text-neutral-800">Earnings Overview</h2>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-neutral-500 mb-1">Total Earned</p>
            <PriceDisplay amount={totalEarnings} className="font-bold text-green-700" />
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-neutral-500 mb-1">Paid Out</p>
            <PriceDisplay amount={completedEarnings} className="font-bold text-blue-700" />
          </div>
        </div>

        {payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="py-2 pr-4 text-left font-medium text-neutral-600">Order</th>
                  <th className="py-2 pr-4 text-left font-medium text-neutral-600">Amount</th>
                  <th className="py-2 pr-4 text-left font-medium text-neutral-600">Status</th>
                  <th className="py-2 pr-4 text-left font-medium text-neutral-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                    <td className="py-2 pr-4 text-neutral-700">{p.order?.orderNumber ?? '—'}</td>
                    <td className="py-2 pr-4"><PriceDisplay amount={p.amount} /></td>
                    <td className="py-2 pr-4">
                      <Badge variant={PAYOUT_STATUS_VARIANT[p.status] ?? 'default'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-neutral-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No payouts yet.</p>
        )}
      </CardBody>
    </Card>
  );
}

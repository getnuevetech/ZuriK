import React from 'react';
import type { Payout } from '../../types/payment';
import { PriceDisplay } from '../common/PriceDisplay';
import { Card, CardBody, CardHeader } from '../ui/Card';

interface PayoutSummaryCardProps {
  payouts: Payout[];
}

const PAYOUT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

const PAYOUT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-600',
  PROCESSING: 'text-blue-600',
  COMPLETED: 'text-green-600',
  FAILED: 'text-red-600',
};

export function PayoutSummaryCard({ payouts }: PayoutSummaryCardProps) {
  const totalEarned = payouts
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payouts
    .filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Card>
      <CardHeader>
        <h2 className="font-heading text-lg font-semibold text-neutral-800">My Earnings</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">Total Earned</p>
            <PriceDisplay amount={totalEarned} className="text-xl font-bold text-green-700" />
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">Pending</p>
            <PriceDisplay amount={pendingAmount} className="text-xl font-bold text-yellow-700" />
          </div>
        </div>

        {payouts.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-2">Payout History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 text-neutral-500 font-medium">Order</th>
                    <th className="text-left py-2 text-neutral-500 font-medium">Amount</th>
                    <th className="text-left py-2 text-neutral-500 font-medium">Status</th>
                    <th className="text-left py-2 text-neutral-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b border-neutral-100 last:border-0">
                      <td className="py-2 text-neutral-600 truncate max-w-24">
                        {payout.orderId.slice(0, 8)}...
                      </td>
                      <td className="py-2">
                        <PriceDisplay amount={payout.amount} />
                      </td>
                      <td className={['py-2 font-medium', PAYOUT_STATUS_COLORS[payout.status] ?? ''].join(' ')}>
                        {PAYOUT_STATUS_LABELS[payout.status] ?? payout.status}
                      </td>
                      <td className="py-2 text-neutral-500">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {payouts.length === 0 && (
          <p className="text-sm text-neutral-500">No payouts yet.</p>
        )}
      </CardBody>
    </Card>
  );
}

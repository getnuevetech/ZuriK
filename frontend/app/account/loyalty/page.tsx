'use client';

import React, { useEffect, useState } from 'react';
import { loyaltyApi, type LoyaltyBalance, type LoyaltyHistoryResponse } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';

const TYPE_LABELS: Record<string, string> = {
  earned_purchase: 'Purchase Reward',
  earned_review: 'Review Reward',
  earned_referral: 'Referral Reward',
  redeemed: 'Redeemed',
  expired: 'Expired',
  adjustment: 'Adjustment',
};

export default function LoyaltyPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [balance, setBalance] = useState<LoyaltyBalance | null>(null);
  const [history, setHistory] = useState<LoyaltyHistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    Promise.all([loyaltyApi.getBalance(), loyaltyApi.getHistory(page)])
      .then(([bal, hist]) => {
        setBalance(bal);
        setHistory(hist);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, page]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!balance) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-indigo-900">Loyalty Points</h1>

      {/* Balance Card */}
      <Card>
        <CardBody className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500 mb-1">Your Balance</p>
            <p className="text-4xl font-extrabold text-amber-500">{balance.points.toLocaleString()} pts</p>
            <p className="text-sm text-neutral-500 mt-1">
              ≈ ${balance.dollarValue.toFixed(2)} discount value
            </p>
          </div>
          <Badge variant="warning" className="text-sm px-3 py-1">
            🌟 {balance.points >= 100 ? 'Redeemable' : `Earn ${100 - balance.points} more to redeem`}
          </Badge>
        </CardBody>
      </Card>

      {/* How to earn */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-indigo-800">How to Earn Points</h2>
        </CardHeader>
        <CardBody>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">+1 pt</span> per $1 spent on orders
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">+50 pts</span> for writing a product review
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">100 pts</span> = $1 discount at checkout
            </li>
          </ul>
        </CardBody>
      </Card>

      {/* Transaction History */}
      <div>
        <h2 className="text-lg font-semibold text-indigo-800 mb-3">Transaction History</h2>
        {!history || history.transactions.length === 0 ? (
          <p className="text-neutral-500 text-sm">No transactions yet. Start earning points!</p>
        ) : (
          <div className="space-y-2">
            {history.transactions.map((tx) => (
              <Card key={tx.id}>
                <CardBody className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{tx.description}</p>
                    <p className="text-xs text-neutral-400">
                      {TYPE_LABELS[tx.type] ?? tx.type} · {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={[
                      'text-base font-bold',
                      tx.points > 0 ? 'text-emerald-600' : 'text-red-500',
                    ].join(' ')}
                  >
                    {tx.points > 0 ? '+' : ''}{tx.points} pts
                  </span>
                </CardBody>
              </Card>
            ))}

            {/* Pagination */}
            {history.totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center text-sm text-neutral-500">
                  Page {page} of {history.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= history.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

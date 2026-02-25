'use client';

import React from 'react';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { useCurrency } from '../../../lib/currency-context';

const HOW_IT_WORKS = [
  {
    icon: '🛍️',
    title: 'Earn Points on Purchases',
    description:
      'Customers automatically earn loyalty points on every completed order. Points are calculated based on the order total and awarded once the order is delivered.',
  },
  {
    icon: '🎁',
    title: 'Redeem for Discounts',
    description:
      'Accumulated points can be redeemed at checkout for discounts on future orders. Customers choose how many points to apply, giving them flexible savings.',
  },
  {
    icon: '📊',
    title: 'Track Your Balance',
    description:
      'Customers can view their current points balance, transaction history, and available redemption options from their account dashboard.',
  },
  {
    icon: '⭐',
    title: 'Tier Rewards',
    description:
      'High-spending customers unlock higher loyalty tiers (Silver, Gold, Platinum) with increased earn rates and exclusive benefits.',
  },
];

export default function AdminLoyaltyPage() {
  const { currencySymbol } = useCurrency();
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Loyalty Program" />

      {/* Coming soon notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-3">
        <span className="text-amber-500 text-xl mt-0.5">🚧</span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-amber-800">Admin Features Coming Soon</p>
          <p className="text-sm text-amber-700">
            Admin management features for the loyalty program are coming soon. Currently, customers can view
            their points balance and redeem points from their account dashboard.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-800">How the Loyalty Program Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HOW_IT_WORKS.map(({ icon, title, description }) => (
            <div key={title} className="border border-neutral-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{icon}</span>
                <h3 className="text-sm font-medium text-neutral-800">{title}</h3>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Planned admin features */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-neutral-800">Planned Admin Features</h2>
        <ul className="space-y-2 text-sm text-neutral-600">
          {[
            `Configure points earn rate (points per ${currencySymbol}1000 spent)`,
            `Set redemption value (points to ${currencySymbol} conversion rate)`,
            'Define loyalty tiers and their thresholds',
            'Manually adjust customer point balances',
            'View leaderboard of top loyalty members',
            'Export loyalty data and reports',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-neutral-300 mt-0.5">◦</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

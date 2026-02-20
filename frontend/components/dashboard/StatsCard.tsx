import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatsCard({ label, value, icon, trend, className = '' }: StatsCardProps) {
  return (
    <div className={['bg-white rounded-xl border border-neutral-200 p-6 shadow-sm', className].join(' ')}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
          {trend && (
            <p className={['text-xs mt-1', trend.value >= 0 ? 'text-green-600' : 'text-red-600'].join(' ')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

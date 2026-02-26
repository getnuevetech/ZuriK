import React from 'react';

interface Trend {
  value: number;
  label: string;
  positive?: boolean;
}

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: Trend;
  className?: string;
}

export default function StatsCard({ label, value, icon, trend, className = '' }: StatsCardProps) {
  const isPositive = trend ? (trend.positive !== undefined ? trend.positive : trend.value >= 0) : true;
  const trendColor = isPositive ? 'text-emerald-600' : 'text-red-500';
  const trendArrow = isPositive ? '▲' : '▼';

  return (
    <div
      className={`admin-surface p-5 flex flex-col gap-4 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-[#8f8578] uppercase tracking-[0.18em]">{label}</span>
          <span className="text-3xl font-semibold text-[#1f1a15] font-heading">{value}</span>
        </div>
        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#f2e4d4] text-[#4d3f31] flex items-center justify-center text-xl">
          {icon}
        </div>
      </div>

      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
          <span>{trendArrow}</span>
          <span>
            {Math.abs(trend.value)}% {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}

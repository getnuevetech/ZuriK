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
  const trendColor = isPositive ? 'text-[#00c853]' : 'text-red-500';
  const trendArrow = isPositive ? '▲' : '▼';

  return (
    <div
      className={`bg-white border border-gray-200 shadow-sm p-5 flex flex-col gap-4 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[#1a237e]/60 uppercase tracking-wide">{label}</span>
          <span className="text-3xl font-bold text-[#1a237e]" style={{ fontFamily: 'Playfair Display, serif' }}>{value}</span>
        </div>
        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#1a237e]/10 flex items-center justify-center text-xl">
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

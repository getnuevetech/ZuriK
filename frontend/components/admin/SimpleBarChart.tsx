import React from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
}

type ChartColor = 'navy' | 'indigo' | 'amber' | 'emerald' | 'red';

interface SimpleBarChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: ChartColor;
}

const COLOR_MAP: Record<ChartColor, { bar: string; text: string }> = {
  navy:    { bar: 'bg-[#1a237e]',    text: 'text-[#1a237e]' },
  indigo:  { bar: 'bg-indigo-500',  text: 'text-indigo-700' },
  amber:   { bar: 'bg-amber-400',   text: 'text-amber-700' },
  emerald: { bar: 'bg-emerald-500', text: 'text-emerald-700' },
  red:     { bar: 'bg-red-500',     text: 'text-red-700' },
};

export default function SimpleBarChart({
  data,
  height = 200,
  color = 'indigo',
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const { bar, text } = COLOR_MAP[color];

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-around gap-2 h-full pb-6 relative">
        {data.map((point, idx) => {
          const pct = Math.round((point.value / maxValue) * 100);
          // Minimum visible height for non-zero bars
          const barPct = point.value > 0 ? Math.max(pct, 4) : 0;

          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-end flex-1 min-w-0 h-full gap-1"
            >
              {/* Value label above bar */}
              <span className={`text-xs font-semibold ${text} whitespace-nowrap`}>
                {point.value.toLocaleString()}
              </span>

              {/* Bar */}
              <div
                className={`w-full rounded-t-md ${bar} transition-all duration-500`}
                style={{ height: `${barPct}%` }}
                title={`${point.label}: ${point.value}`}
              />

              {/* X-axis label */}
              <span className="absolute bottom-0 text-xs text-neutral-500 truncate max-w-full text-center">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

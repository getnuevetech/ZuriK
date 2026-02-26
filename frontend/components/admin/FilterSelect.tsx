import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function FilterSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  label,
  className = '',
}: FilterSelectProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7487b3]">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-[#fffdf9] border border-[#d6dfef] rounded-lg px-3 py-2.5 pr-8 text-sm text-[#1f2f62] focus:outline-none focus:ring-2 focus:ring-[#5d79b0]/35 focus:border-[#4a659a] transition-colors cursor-pointer"
        >
          {placeholder && (
            <option value="" disabled={false}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Chevron icon */}
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8ea0c8] text-xs">
          ▾
        </span>
      </div>
    </div>
  );
}

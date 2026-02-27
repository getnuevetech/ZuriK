'use client';

import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]/75 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            'w-full rounded-md border px-3 py-2.5 text-sm text-neutral-900 bg-[#fffdf9]',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-700 transition',
            error ? 'border-red-500' : 'border-[#d9cdbd] hover:border-[#cbbda9]',
            className,
          ].join(' ')}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

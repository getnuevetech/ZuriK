'use client';

import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes into local state
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedOnChange = useCallback(
    (val: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onChange(val);
      }, 300);
    },
    [onChange],
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setLocalValue(val);
    debouncedOnChange(val);
  }

  function handleClear() {
    setLocalValue('');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    onChange('');
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Search icon */}
      <span className="absolute left-3 text-[#7f93c1] pointer-events-none select-none text-sm">
        🔍
      </span>

      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2.5 text-sm bg-[#fffdf9] border border-[#d6dfef] rounded-lg text-[#1f2f62] placeholder:text-[#8fa0c6] focus:outline-none focus:ring-2 focus:ring-[#5d79b0]/35 focus:border-[#4a659a] transition-colors"
      />

      {/* Clear button */}
      {localValue && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2.5 text-[#8ea0c8] hover:text-[#4b6397] transition-colors text-sm leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}

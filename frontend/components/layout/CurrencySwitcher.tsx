'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../../lib/currency-context';
import { SUPPORTED_CURRENCIES } from '../../lib/geo-currency';

interface CurrencySwitcherProps {
  tone?: 'light' | 'dark';
}

export function CurrencySwitcher({ tone = 'light' }: CurrencySwitcherProps) {
  const { currency, setCurrency, detectedCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (code: string) => {
    setCurrency(code);
    setOpen(false);
  };

  const showReset = detectedCurrency && detectedCurrency !== currency;
  const triggerClass =
    tone === 'dark'
      ? 'flex items-center gap-1 text-xs font-medium text-white/80 hover:text-white transition-colors px-2 py-2'
      : 'flex items-center gap-1 text-xs font-medium text-[var(--color-primary)]/70 hover:text-[var(--color-primary)] transition-colors px-2 py-2';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
        aria-label="Select currency"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0V3M3 12h18" />
        </svg>
        {currency}
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 bg-[#fffdf9] border py-1 z-50 shadow-modal max-h-72 overflow-y-auto rounded-lg"
          style={{ borderColor: 'var(--color-border)' }}
          role="listbox"
          aria-label="Currency options"
        >
          {showReset && (
            <>
              <button
                onClick={() => handleSelect(detectedCurrency!)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-secondary)] hover:bg-[#f7f1e8] transition-colors"
                role="option"
                aria-selected={false}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset to local ({detectedCurrency})
              </button>
              <div className="border-t my-1" style={{ borderColor: 'var(--color-border)' }} />
            </>
          )}
          {SUPPORTED_CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => handleSelect(c.code)}
              className={[
                'w-full text-left flex items-center justify-between gap-2 px-3 py-2 text-xs transition-colors',
                currency === c.code
                  ? 'text-[var(--color-primary-dark)] bg-[#f7f1e8]'
                  : 'text-[var(--color-primary)]/70 hover:bg-[#f7f1e8] hover:text-[var(--color-primary-dark)]',
              ].join(' ')}
              role="option"
              aria-selected={currency === c.code}
            >
              <span>
                <span className="font-medium text-[var(--color-primary-dark)]">{c.code}</span>
                <span className="text-[var(--color-text-muted)] ml-1">— {c.label}</span>
              </span>
              {currency === c.code && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[var(--color-secondary)] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

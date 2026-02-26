'use client';

import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'announcement-bar-dismissed';

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // localStorage unavailable (e.g. private browsing)
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium relative"
      style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)' }}
      role="banner"
    >
      <span className="text-center">
        Free Shipping on Orders Over $100 &nbsp;|&nbsp; Use Code: <strong>AFRICAN20</strong>
      </span>
      <button
        onClick={dismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full hover:bg-black/10 transition-colors"
        aria-label="Dismiss announcement"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

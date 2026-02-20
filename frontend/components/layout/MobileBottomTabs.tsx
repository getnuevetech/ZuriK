'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Tab {
  href: string;
  label: string;
  icon: React.ReactNode;
  authOnly?: boolean;
  noAuthHref?: string;
}

const tabs: Tab[] = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/products',
    label: 'Shop',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    href: '/orders/custom-design',
    label: 'Custom',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
      </svg>
    ),
  },
  {
    href: '/orders',
    label: 'Orders',
    authOnly: true,
    noAuthHref: '/fabrics',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/login',
    label: 'Me',
    authOnly: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export function MobileBottomTabs() {
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      setIsAuth(!!stored);
    } catch {}
  }, []);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg"
      style={{ height: 64 }}
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5 h-full">
        {tabs.map((tab) => {
          // Determine actual href based on auth state
          const resolvedHref =
            tab.authOnly && !isAuth ? (tab.noAuthHref || '/fabrics') :
            !tab.authOnly && tab.href === '/login' && isAuth ? '/profile' :
            tab.href;

          const resolvedLabel =
            tab.authOnly && !isAuth ? 'Fabrics' :
            !tab.authOnly && tab.href === '/login' && isAuth ? 'Profile' :
            tab.label;

          const isActive =
            resolvedHref === '/'
              ? pathname === '/'
              : pathname.startsWith(resolvedHref);

          return (
            <Link
              key={tab.href}
              href={resolvedHref}
              className={[
                'flex flex-col items-center justify-center gap-0.5 transition-colors',
                isActive ? 'text-primary-600' : 'text-neutral-400 hover:text-neutral-600',
              ].join(' ')}
              aria-label={resolvedLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={isActive ? 'text-primary-600' : ''}>{tab.icon}</div>
              <span className="text-xs font-medium">{resolvedLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

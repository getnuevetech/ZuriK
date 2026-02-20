'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  roles?: string[];
}

interface SidebarProps {
  items: SidebarItem[];
  userRole?: string;
}

export function Sidebar({ items, userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const filteredItems = items.filter(
    (item) => !item.roles || !userRole || item.roles.includes(userRole)
  );

  return (
    <aside
      className={['bg-white border-r border-neutral-200 flex flex-col transition-all duration-200', collapsed ? 'w-16' : 'w-60'].join(' ')}
    >
      <div className="flex items-center justify-end p-3 border-b border-neutral-100">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />}
          </svg>
        </button>
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2">
        {filteredItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary-50 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
            ].join(' ')}
            title={collapsed ? item.label : undefined}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  items: SidebarItem[];
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ items, collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 768;
    if (isMobile && !collapsed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [collapsed]);

  const sidebarContent = (
    <div
      className={`flex flex-col h-full bg-neutral-900 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-700 min-h-[64px]">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-indigo-400 text-xl flex-shrink-0">🛡️</span>
            <span className="font-bold text-lg whitespace-nowrap">Admin Panel</span>
          </div>
        )}
        {collapsed && (
          <span className="text-indigo-400 text-xl mx-auto">🛡️</span>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`text-neutral-400 hover:text-white hover:bg-neutral-700 rounded p-1 transition-colors flex-shrink-0 ${
            collapsed ? 'mx-auto' : ''
          }`}
        >
          {collapsed ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile: drawer overlay */}
      <div className="md:hidden">
        {/* Backdrop */}
        {!collapsed && (
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onToggle}
            aria-hidden="true"
          />
        )}
        {/* Drawer */}
        <aside
          className={`fixed top-0 left-0 h-full z-50 flex flex-col transform transition-transform duration-300 ${
            collapsed ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className="flex flex-col h-full bg-neutral-900 text-white w-64">
            {/* Mobile header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-700 min-h-[64px]">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 text-xl">🛡️</span>
                <span className="font-bold text-lg">Admin Panel</span>
              </div>
              <button
                onClick={onToggle}
                aria-label="Close sidebar"
                className="text-neutral-400 hover:text-white hover:bg-neutral-700 rounded p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onToggle}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
      </div>
    </>
  );
}

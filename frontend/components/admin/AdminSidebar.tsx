'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
}

interface AdminSidebarProps {
  items: SidebarItem[];
  collapsed: boolean;
  onToggle: () => void;
}

function NavItem({
  item,
  collapsed,
  pathname,
  onMobileClose,
}: {
  item: SidebarItem;
  collapsed: boolean;
  pathname: string;
  onMobileClose?: () => void;
}) {
  const isChildActive = item.children?.some(
    (c) => pathname === c.href || pathname.startsWith(c.href + '/'),
  );
  const isActive =
    pathname === item.href ||
    (!item.children && pathname.startsWith(item.href + '/')) ||
    !!isChildActive;

  const [open, setOpen] = useState(isChildActive ?? false);

  if (item.children && item.children.length > 0) {
    return (
      <div>
        <button
          onClick={() => setOpen((prev) => !prev)}
          title={collapsed ? item.label : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
            isActive
              ? 'bg-[#f0d8bd] text-[#1f1a15]'
              : 'text-[#d9cfc3] hover:bg-[#2b251e] hover:text-white'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="text-lg flex-shrink-0">{item.icon}</span>
          {!collapsed && (
            <>
              <span className="truncate flex-1 text-left">{item.label}</span>
              <span className="text-xs">{open ? '▾' : '▸'}</span>
            </>
          )}
        </button>
        {open && !collapsed && (
          <div className="mt-1 ml-4 space-y-1 border-l border-[#463a2e] pl-3">
            {item.children.map((child) => {
              const childActive =
                pathname === child.href || pathname.startsWith(child.href + '/');
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onMobileClose}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    childActive
                      ? 'bg-[#f0d8bd] text-[#1f1a15]'
                      : 'text-[#c7bcaf] hover:bg-[#2b251e] hover:text-white'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{child.icon}</span>
                  <span className="truncate">{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onClick={onMobileClose}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
        isActive
          ? 'bg-[#f0d8bd] text-[#1f1a15]'
          : 'text-[#d9cfc3] hover:bg-[#2b251e] hover:text-white'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      <span className="text-lg flex-shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
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
      className={`flex flex-col h-full bg-[#17140f] text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#352b22] min-h-[64px]">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[#f0d8bd] text-xl flex-shrink-0">◆</span>
            <span className="font-semibold text-lg whitespace-nowrap font-heading tracking-wide">Control Center</span>
          </div>
        )}
        {collapsed && (
          <span className="text-[#f0d8bd] text-xl mx-auto">◆</span>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`text-[#c2b6a9] hover:text-white hover:bg-[#2b251e] rounded p-1 transition-colors flex-shrink-0 ${
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
        {items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            collapsed={collapsed}
            pathname={pathname}
          />
        ))}
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
          <div className="flex flex-col h-full bg-[#17140f] text-white w-64">
            {/* Mobile header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#352b22] min-h-[64px] bg-[#17140f]">
              <div className="flex items-center gap-2">
                <span className="text-[#f0d8bd] text-xl">◆</span>
                <span className="font-semibold text-lg font-heading tracking-wide">Control Center</span>
              </div>
              <button
                onClick={onToggle}
                aria-label="Close sidebar"
                className="text-[#c2b6a9] hover:text-white hover:bg-[#2b251e] rounded p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2 bg-[#17140f]">
              {items.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={false}
                  pathname={pathname}
                  onMobileClose={onToggle}
                />
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </>
  );
}

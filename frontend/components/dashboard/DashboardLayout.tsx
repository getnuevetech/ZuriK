'use client';

import React from 'react';
import { Sidebar } from '../layout/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: Array<{
    href: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  userRole?: string;
  title?: string;
}

export function DashboardLayout({ children, sidebarItems, userRole, title }: DashboardLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-64px)] bg-neutral-50">
      <Sidebar items={sidebarItems} userRole={userRole} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {title && (
            <h1 className="text-2xl font-bold text-neutral-900 mb-6">{title}</h1>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

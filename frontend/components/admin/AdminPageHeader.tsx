import React, { ReactNode } from 'react';
import Link from 'next/link';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
}

export default function AdminPageHeader({ title, breadcrumbs, actions }: AdminPageHeaderProps) {
  return (
    <div className="pb-4 mb-6 border-b border-[#d4deef]">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 mb-2 text-[11px] uppercase tracking-[0.16em] text-[#8295c0]" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1">
              {idx > 0 && <span className="text-[#afbfde]">/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-[var(--color-primary-dark)] hover:underline transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#3e5585] font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title row */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold font-heading text-[#1f2f62]">{title}</h1>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

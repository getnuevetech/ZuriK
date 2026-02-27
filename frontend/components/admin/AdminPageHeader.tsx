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
    <div className="pb-4 mb-6 border-b border-gray-200">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 mb-2 text-xs text-[#1a237e]/50" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1">
              {idx > 0 && <span className="text-gray-300">/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-[#1a237e] hover:underline transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#1a237e]/80 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title row */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#1a237e]">{title}</h1>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

type BadgeStyle = {
  bg: string;
  text: string;
  label: string;
};

const STATUS_MAP: Record<string, BadgeStyle> = {
  // Order statuses
  pending_payment:  { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Payment' },
  PENDING_PAYMENT:  { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Payment' },
  paid:             { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Paid' },
  PAID:             { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Paid' },
  in_production:    { bg: 'bg-purple-100', text: 'text-purple-800', label: 'In Production' },
  IN_PRODUCTION:    { bg: 'bg-purple-100', text: 'text-purple-800', label: 'In Production' },
  shipped:          { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Shipped' },
  SHIPPED:          { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Shipped' },
  qa_pending:       { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'QA Pending' },
  QA_PENDING:       { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'QA Pending' },
  qa_passed:        { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'QA Passed' },
  QA_PASSED:        { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'QA Passed' },
  qa_failed:        { bg: 'bg-indigo-100', text: 'text-indigo-900', label: 'QA Failed' },
  QA_FAILED:        { bg: 'bg-indigo-100', text: 'text-indigo-900', label: 'QA Failed' },
  delivered:        { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Delivered' },
  DELIVERED:        { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Delivered' },
  cancelled:        { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Cancelled' },
  CANCELLED:        { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Cancelled' },
  // User statuses
  active:           { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
  ACTIVE:           { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
  inactive:         { bg: 'bg-neutral-100', text: 'text-neutral-600', label: 'Inactive' },
  INACTIVE:         { bg: 'bg-neutral-100', text: 'text-neutral-600', label: 'Inactive' },
};

const DEFAULT_STYLE: BadgeStyle = {
  bg: 'bg-neutral-100',
  text: 'text-neutral-700',
  label: '',
};

function resolveStyle(status: string): BadgeStyle {
  if (STATUS_MAP[status]) return STATUS_MAP[status];

  // Partial prefix matching for SHIPPED_* and QA_* variants
  const upper = status.toUpperCase();
  if (upper.startsWith('SHIPPED')) return { bg: 'bg-blue-100', text: 'text-blue-700', label: status };
  if (upper.startsWith('QA'))      return { bg: 'bg-indigo-100', text: 'text-indigo-800', label: status };

  return { ...DEFAULT_STYLE, label: status };
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = resolveStyle(status);
  const displayLabel = style.label || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${className}`}
    >
      {displayLabel}
    </span>
  );
}

import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, message, icon = '📭', actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="text-center py-20 catalog-surface px-6">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-heading text-2xl font-semibold text-[var(--color-primary-dark)] mb-2">{title}</h3>
      <p className="text-[var(--color-text-muted)] mb-6">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}

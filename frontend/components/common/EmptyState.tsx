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
    <div className="text-center py-20">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-heading text-xl font-semibold text-neutral-700 mb-2">{title}</h3>
      <p className="text-neutral-500 mb-6">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}

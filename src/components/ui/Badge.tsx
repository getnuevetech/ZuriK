import React from 'react';
import { classNames } from '@/utils/helpers';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'error';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    gold: 'bg-gold-light text-gold-dark',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

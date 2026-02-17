'use client';

import React from 'react';
import { classNames } from '@/utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function Card({
  children,
  className,
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={classNames(
        'bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200',
        hoverable && 'hover:shadow-xl hover:-translate-y-1 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

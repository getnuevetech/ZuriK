'use client';

import React from 'react';
import { classNames } from '@/utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className,
  hoverable = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={classNames(
        'bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200',
        hoverable && 'hover:shadow-xl hover:-translate-y-1 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

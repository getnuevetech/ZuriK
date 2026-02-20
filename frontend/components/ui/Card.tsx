import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-2xl border border-neutral-200 shadow-card overflow-hidden',
        hover ? 'transition-shadow duration-200 hover:shadow-card-hover' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardSectionProps) {
  return (
    <div className={['px-6 py-4 border-b border-neutral-100', className].join(' ')}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: CardSectionProps) {
  return (
    <div className={['px-6 py-4', className].join(' ')}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: CardSectionProps) {
  return (
    <div className={['px-6 py-4 border-t border-neutral-100 bg-neutral-50', className].join(' ')}>
      {children}
    </div>
  );
}

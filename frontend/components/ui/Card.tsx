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
        'bg-[#fffdfa] rounded-xl border border-[#e4dacd] shadow-card overflow-hidden',
        hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardSectionProps) {
  return (
    <div className={['px-6 py-4 border-b border-[#efe5d8]', className].join(' ')}>
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
    <div className={['px-6 py-4 border-t border-[#efe5d8] bg-[#faf5ee]', className].join(' ')}>
      {children}
    </div>
  );
}

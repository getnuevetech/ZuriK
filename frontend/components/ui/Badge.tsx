import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[#f4eee6] text-[#5c5146] border border-[#e0d4c5]',
  primary: 'bg-[#e9edf7] text-[#233769] border border-[#ccd5eb]',
  secondary: 'bg-[#f8e8d5] text-[#6f5235] border border-[#e6ceb0]',
  success: 'bg-[#e5f3ec] text-[#2f7d55] border border-[#c8e8d7]',
  warning: 'bg-[#fff3d8] text-[#9a6a10] border border-[#f4dfac]',
  danger: 'bg-[#fde8e8] text-[#b42323] border border-[#f6caca]',
  info: 'bg-[#e8eef9] text-[#2457aa] border border-[#cad9f2]',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em]',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

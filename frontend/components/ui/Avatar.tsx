import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-lg' };

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={['rounded-full object-cover', sizeClasses[size], className].join(' ')}
      />
    );
  }
  return (
    <div
      className={[
        'rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold select-none',
        sizeClasses[size],
        className,
      ].join(' ')}
      aria-label={name}
    >
      {name ? getInitials(name) : '?'}
    </div>
  );
}

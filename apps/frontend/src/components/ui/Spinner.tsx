import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'gold' | 'dark' | 'accent' | 'white';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'gold', className = '' }) => {
  const sizeStyles = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };

  const colorStyles = {
    gold: 'border-gold border-r-transparent',
    dark: 'border-dark border-r-transparent',
    accent: 'border-accent border-r-transparent',
    white: 'border-white border-r-transparent',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full ${sizeStyles[size]} ${colorStyles[color]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const SpinnerOverlay: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark bg-opacity-50">
    <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-dark font-medium">{text}</p>
    </div>
  </div>
);

export default Spinner;

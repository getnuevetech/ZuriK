import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-dark mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-lighter">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent bg-white transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-accent focus:ring-accent' : 'border-cream-dark focus:ring-gold'}
              ${className}
            `}
            {...props}
          />
        </div>

        {error && <p className="mt-1 text-sm text-accent">{error}</p>}

        {helperText && !error && <p className="mt-1 text-sm text-dark-lighter">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

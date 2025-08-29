import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  'aria-describedby'?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      className,
      id,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [ariaDescribedBy, errorId, helperId].filter(Boolean).join(' ') || undefined;
    const inputClasses = cn(
      'input-primary',
      {
        'input-error': error,
        'input-success': success && !error,
      },
      className,
    );

    return (
      <div className='space-y-2'>
        {label && (
          <label htmlFor={inputId} className='block text-label font-medium text-gray-dark'>
            {label}
          </label>
        )}

        <div className='relative'>
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            aria-describedby={describedBy}
            aria-invalid={!!error}
            {...props}
          />

          {/* Success Icon */}
          {success && !error && (
            <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
              <svg
                className='h-5 w-5 text-success'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
          )}

          {/* Error Icon */}
          {error && (
            <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
              <svg
                className='h-5 w-5 text-error'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </div>
          )}
        </div>

        {/* Helper Text or Error Message */}
        {(error || helperText) && (
          <p
            id={error ? errorId : helperId}
            className={cn('text-sm', error ? 'text-error' : 'text-gray-500')}
            role={error ? 'alert' : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;

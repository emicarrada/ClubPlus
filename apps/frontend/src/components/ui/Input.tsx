import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  helperText,
  className,
  ...props
}) => {
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
      {label && <label className='block text-label font-medium text-gray-dark'>{label}</label>}

      <div className='relative'>
        <input className={inputClasses} {...props} />

        {/* Success Icon */}
        {success && !error && (
          <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
            <svg
              className='h-5 w-5 text-success'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
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
        <p className={cn('text-sm', error ? 'text-error' : 'text-gray-500')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;

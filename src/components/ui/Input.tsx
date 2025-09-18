// Text input with label, error state, and helper text.
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-secondary-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          block w-full rounded-lg border border-secondary-300 px-3 py-2 
          placeholder-secondary-400 shadow-sm transition-colors
          focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
          disabled:bg-secondary-50 disabled:text-secondary-500 disabled:cursor-not-allowed
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary-500">{helperText}</p>
      )}
    </div>
  );
}
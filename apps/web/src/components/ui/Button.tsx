'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'emerald' | 'amber' | 'dark' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-100 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 border-2',
    md: 'text-sm px-4 py-2.5 border-2',
    lg: 'text-base px-6 py-3.5 border-2',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#7a2020] text-[#fbf8f1] border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:bg-[#611818] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1a1a1a]',
    emerald:
      'bg-[#2e6930] text-[#fbf8f1] border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:bg-[#235325] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1a1a1a]',
    amber:
      'bg-[#b45309] text-[#fbf8f1] border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:bg-[#92400e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1a1a1a]',
    dark:
      'bg-[#1a1a1a] text-[#fbf8f1] border-[#1a1a1a] shadow-[3px_3px_0px_#524d43] hover:bg-[#333333] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#524d43]',
    secondary:
      'bg-[#f4efe2] text-[#1a1a1a] border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:bg-[#ede3ce] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1a1a1a]',
    outline:
      'bg-transparent text-[#1a1a1a] border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:bg-[#f4efe2] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1a1a1a]',
    ghost:
      'bg-transparent text-[#1a1a1a] border-transparent shadow-none hover:bg-[#f4efe2] active:bg-[#ede3ce]',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Label stays in the flow while loading so the button keeps its size */}
      <span className={`inline-flex items-center justify-center ${isLoading ? 'invisible' : ''}`}>
        {children}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center" aria-label="Processing">
          <svg
            className="animate-spin h-4 w-4 current-color"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
    </button>
  );
}

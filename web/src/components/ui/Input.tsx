'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isMono?: boolean;
}

export function Input({
  label,
  helperText,
  error,
  isMono = false,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] font-mono flex justify-between"
        >
          <span>{label}</span>
          {props.required && <span className="text-[#7a2020]">* REQUIRED</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 bg-[#fbf8f1] border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder-[#8c8270] focus:outline-none focus:bg-[#ffffff] focus:shadow-[2px_2px_0px_#1a1a1a] transition-all ${
          isMono ? 'font-mono text-sm' : 'font-serif text-base'
        } ${error ? 'border-[#7a2020] bg-[#fff5f5]' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-[#7a2020] font-mono font-bold tracking-wide">
          ! {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs text-[#524d43] font-mono">{helperText}</p>
      )}
    </div>
  );
}

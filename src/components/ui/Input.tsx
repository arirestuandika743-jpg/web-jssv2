'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <motion.div
        animate={error ? { x: [-4, 4, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full space-y-1.5"
      >
        {label && (
          <label htmlFor={inputId} className="block text-xs font-extrabold text-secondary-800 tracking-tight">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-secondary-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-white border rounded-2xl text-xs sm:text-sm text-secondary-900 placeholder:text-secondary-400 font-medium',
              'py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm hover:border-secondary-300',
              leftIcon ? 'pl-10' : 'pl-4',
              rightIcon ? 'pr-10' : 'pr-4',
              error ? 'border-red-500 focus:ring-red-200' : 'border-secondary-200',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-secondary-400 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-[11px] font-extrabold text-red-500">{error}</p>}
        {hint && !error && <p className="text-[11px] text-secondary-400 font-medium">{hint}</p>}
      </motion.div>
    );
  }
);

Input.displayName = 'Input';

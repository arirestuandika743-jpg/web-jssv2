'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'dark' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center gap-1.5 font-extrabold tracking-wider uppercase rounded-full select-none';

  const variantStyles = {
    primary: 'bg-primary/20 text-secondary-900 border border-primary/30',
    success: 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-800 border border-amber-500/30',
    danger: 'bg-red-500/15 text-red-700 border border-red-500/30',
    dark: 'bg-secondary-900 text-white shadow-sm',
    glass: 'bg-white/90 backdrop-blur-md text-secondary-900 border border-white/60 shadow-soft',
  };

  const sizeStyles = {
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[10px] px-2.5 py-1',
    lg: 'text-xs px-3.5 py-1.5',
  };

  const dotColors = {
    primary: 'bg-secondary-900',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    dark: 'bg-primary',
    glass: 'bg-emerald-500',
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', dotColors[variant])} />
          <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColors[variant])} />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setRipples((prev) => [...prev, { id: Date.now(), x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 600);

      if (onClick) onClick(e);
    };

    const baseStyles =
      'relative overflow-hidden inline-flex items-center justify-center font-extrabold tracking-tight select-none transition-all duration-300 transform-gpu disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

    const variantStyles = {
      primary:
        'bg-primary text-secondary-900 shadow-golden hover:shadow-golden-lg rounded-2xl hover:bg-primary-400',
      secondary:
        'bg-secondary-900 text-white hover:bg-secondary-800 shadow-md rounded-2xl',
      outline:
        'border-2 border-secondary-900 text-secondary-900 hover:bg-secondary-900 hover:text-white rounded-2xl',
      ghost:
        'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100 rounded-xl',
      glass:
        'bg-white/80 backdrop-blur-xl border border-white/60 text-secondary-900 shadow-soft hover:bg-white rounded-2xl',
      danger:
        'bg-red-500 text-white hover:bg-red-600 shadow-md rounded-2xl',
    };

    const sizeStyles = {
      sm: 'text-xs px-3.5 py-2 gap-1.5',
      md: 'text-xs sm:text-sm px-5 py-2.5 gap-2',
      lg: 'text-sm sm:text-base px-7 py-3.5 gap-2.5',
      xl: 'text-base sm:text-lg px-9 py-4 gap-3',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02, y: disabled || isLoading ? 0 : -1 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.96 }}
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          className
        )}
        {...props}
      >
        {/* Shimmer Light Beam Effect */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none overflow-hidden rounded-inherit">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
        </div>

        {/* Click Ripple Effect */}
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: r.y - 12,
                left: r.x - 12,
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.45)',
                pointerEvents: 'none',
              }}
            />
          ))}
        </AnimatePresence>

        {isLoading ? (
          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          leftIcon
        )}
        <span className="relative z-10">{children}</span>
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

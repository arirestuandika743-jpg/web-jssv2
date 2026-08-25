'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'dark' | 'golden' | 'gradient';
  isInteractive?: boolean;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', isInteractive = false, className, ...props }, ref) => {
    const baseStyles = 'relative overflow-hidden rounded-[24px] transition-all duration-500 transform-gpu';

    const variantStyles = {
      default: 'bg-white/90 backdrop-blur-xl border border-secondary-200/60 shadow-soft text-secondary-900',
      glass: 'bg-white/80 backdrop-blur-2xl border border-white/70 shadow-soft text-secondary-900',
      dark: 'bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 border border-white/10 text-white shadow-2xl',
      golden: 'bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200/60 shadow-golden text-secondary-900',
      gradient: 'bg-gradient-to-br from-primary via-primary-500 to-accent text-secondary-900 shadow-golden-lg',
    };

    return (
      <motion.div
        ref={ref}
        whileHover={
          isInteractive
            ? { y: -6, scale: 1.01, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } }
            : {}
        }
        whileTap={isInteractive ? { scale: 0.98 } : {}}
        className={cn(
          baseStyles,
          variantStyles[variant],
          isInteractive ? 'hover:shadow-soft-xl hover:border-primary/40 cursor-pointer' : '',
          className
        )}
        {...props}
      >
        {/* Subtle Top Glass Reflection Line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

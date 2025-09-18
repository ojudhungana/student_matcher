<<<<<<< HEAD
=======
// Content container with optional padding, shadow, and animation.
>>>>>>> aaa84261f8429e5f3b3bea0ebd897acd2a3f4f08
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  animate = false,
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const baseClasses = `bg-white rounded-lg border border-secondary-200 ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${baseClasses} card-hover`}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={`${baseClasses} card-hover`}>{children}</div>;
}

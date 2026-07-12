import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function PrimaryButton({ children, className, size = 'md', icon, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
        'transition-all duration-200 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-2.5 text-base',
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className, size = 'md', icon, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
        'bg-card text-foreground border border-border hover:bg-accent',
        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
        'transition-all duration-200 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-2.5 text-base',
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

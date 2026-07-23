import React from 'react';
import { cn } from '@/utils/cn';
import { ClickSpark } from './ClickSpark';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'outline';
  icon?: React.ReactNode;
}

export function PillButton({ children, className, variant = 'primary', icon, ...props }: PillButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <ClickSpark 
      sparkColor={isPrimary ? "#3ECF8E" : "#8A8A93"} 
      sparkSize={6} 
      sparkRadius={20} 
      sparkCount={6}
      duration={500}
      className={className}
    >
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-full px-4 py-2 text-sm w-full h-full',
          'transition-all duration-200 active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          isPrimary && 'bg-text-primary text-bg hover:bg-white',
          variant === 'outline' && 'border border-border-glass text-text-primary bg-transparent hover:bg-white/5'
        )}
        {...props}
      >
        {icon}
        {children}
      </button>
    </ClickSpark>
  );
}

// Aliases to avoid immediately breaking existing pages before the full rollout
export const PrimaryButton = (props: PillButtonProps) => <PillButton variant="primary" {...props} />;
export const SecondaryButton = (props: PillButtonProps) => <PillButton variant="outline" {...props} />;

interface CircleIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
}

export function CircleIconButton({ icon, className, ...props }: CircleIconButtonProps) {
  return (
    <button
      className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center',
        'bg-bg-elevated border border-border-glass',
        'text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors',
        'active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}

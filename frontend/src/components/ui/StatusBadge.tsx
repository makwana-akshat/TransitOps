import React from 'react';
import { cn } from '@/utils/cn';

type BadgeColor = 'green' | 'red' | 'neutral';

interface PillBadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

export function PillBadge({ children, color = 'neutral', className }: PillBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full',
        color === 'green' && 'bg-accent-green/10 text-accent-green',
        color === 'red' && 'bg-accent-red/10 text-accent-red',
        color === 'neutral' && 'bg-white/5 text-text-muted',
        className
      )}
    >
      {children}
    </span>
  );
}

// Map old variants to the new strict "Fleet Nocturne" colors
const legacyMap: Record<string, BadgeColor> = {
  // Vehicle statuses
  'Available': 'green',
  'On Trip': 'green',
  'In Shop': 'red',
  'Retired': 'neutral',
  // Driver statuses
  'Suspended': 'red',
  'Off Duty': 'neutral',
  // Trip statuses
  'Draft': 'neutral',
  'Dispatched': 'green',
  'Completed': 'green',
  'Cancelled': 'red',
  // Maintenance statuses
  'Scheduled': 'neutral',
  'In Progress': 'green',
  'Overdue': 'red',
};

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'info' | 'warning' | 'error' | 'neutral' | 'default';
  className?: string;
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  let mappedColor: BadgeColor = 'neutral';
  
  if (variant === 'success' || variant === 'info') mappedColor = 'green';
  else if (variant === 'error' || variant === 'warning') mappedColor = 'red';
  else if (legacyMap[status]) mappedColor = legacyMap[status];

  return (
    <PillBadge color={mappedColor} className={className}>
      <span 
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          mappedColor === 'green' && 'bg-accent-green',
          mappedColor === 'red' && 'bg-accent-red',
          mappedColor === 'neutral' && 'bg-text-faint'
        )} 
      />
      {status}
    </PillBadge>
  );
}

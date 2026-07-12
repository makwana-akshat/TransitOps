import React from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant = 'success' | 'info' | 'warning' | 'error' | 'neutral' | 'default';

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantMap: Record<string, BadgeVariant> = {
  // Vehicle statuses
  'Available': 'success',
  'On Trip': 'info',
  'In Shop': 'warning',
  'Retired': 'neutral',
  // Driver statuses
  'Suspended': 'error',
  'Off Duty': 'neutral',
  // Trip statuses
  'Draft': 'neutral',
  'Dispatched': 'info',
  'Completed': 'success',
  'Cancelled': 'error',
  // Maintenance statuses
  'Scheduled': 'info',
  'In Progress': 'warning',
  'Overdue': 'error',
};

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-gray-50 text-gray-600 border-gray-200',
  default: 'bg-gray-50 text-gray-600 border-gray-200',
};

const dotStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  neutral: 'bg-gray-400',
  default: 'bg-gray-400',
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolvedVariant = variant || variantMap[status] || 'default';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
        variantStyles[resolvedVariant],
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotStyles[resolvedVariant])} />
      {status}
    </span>
  );
}

import React from 'react';
import { cn } from '@/utils/cn';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, action, className }: ChartCardProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-5', className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}

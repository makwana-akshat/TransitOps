import React from 'react';
import { cn } from '@/utils/cn';
import { GlassCard } from './GlassCard';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, action, className }: ChartCardProps) {
  return (
    <GlassCard className={cn('p-5 flex flex-col', className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{title}</h3>
          {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="w-full flex-1 min-h-[200px]">{children}</div>
    </GlassCard>
  );
}

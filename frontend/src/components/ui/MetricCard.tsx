import React from 'react';
import { cn } from '@/utils/cn';

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  className?: string;
}

export function MetricCard({ label, value, sublabel, className }: MetricCardProps) {
  return (
    <div className={cn('text-center p-4 flex flex-col items-center justify-center', className)}>
      <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">{label}</span>
      <span className="text-2xl font-bold text-text-primary">{value}</span>
      {sublabel && <span className="text-xs text-text-faint mt-1">{sublabel}</span>}
    </div>
  );
}

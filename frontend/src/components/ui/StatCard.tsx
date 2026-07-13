import React from 'react';
import { cn } from '@/utils/cn';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { NumberTicker } from './NumberTicker';

interface StatFigureProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  className?: string;
}

export function StatFigure({ label, value, change, changeLabel, className }: StatFigureProps) {
  const isPositive = change !== undefined && change >= 0;

  // Parse value if it's a string like "29%"
  let numValue: number | null = null;
  let suffix = "";
  if (typeof value === "number") {
    numValue = value;
  } else if (typeof value === "string") {
    const match = value.match(/^([\d.]+)(.*)$/);
    if (match) {
      numValue = parseFloat(match[1]);
      suffix = match[2];
    }
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">
        {label}
      </span>
      <span className="text-3xl font-semibold text-text-primary tracking-tight">
        {numValue !== null ? <NumberTicker value={numValue} suffix={suffix} delay={0.1} /> : value}
      </span>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-accent-green" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-accent-red" />
          )}
          <span className={cn('text-xs font-medium', isPositive ? 'text-accent-green' : 'text-accent-red')}>
            {isPositive ? '+' : ''}{change}%
          </span>
          {changeLabel && <span className="text-xs text-text-faint">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string; // ignored in Nocturne but kept for API compat
  iconBg?: string;    // ignored in Nocturne
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <GlassCard className={className}>
      <div className="flex justify-between items-start">
        <StatFigure label={label} value={value} change={change} changeLabel={changeLabel} />
        {Icon && (
          <div className="p-2.5 rounded-full bg-white/5 border border-border-glass text-text-muted shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}

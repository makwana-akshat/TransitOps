import React from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
  }[];
  className?: string;
}

export function FilterBar({ filters, className }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {filters.map((filter) => (
        <div key={filter.label} className="relative">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm bg-bg-elevated border border-border-glass rounded-xl
              focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10
              text-text-primary cursor-pointer transition-all duration-200"
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-bg-elevated text-text-primary">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
        </div>
      ))}
    </div>
  );
}

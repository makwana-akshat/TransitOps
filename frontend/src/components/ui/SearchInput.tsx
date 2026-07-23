import React from 'react';
import { cn } from '@/utils/cn';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm bg-bg-elevated border border-border-glass rounded-xl text-text-primary
          focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10
          placeholder:text-text-muted transition-all duration-200"
      />
    </div>
  );
}

import React, { useRef } from 'react';
import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react';
import VariableProximity from './VariableProximity';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
}

export function PageHeader({ title, subtitle, action, icon: Icon }: PageHeaderProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2.5 bg-bg-elevated border border-border-glass rounded-2xl shadow-glass-inset">
            <Icon className="h-6 w-6 text-text-primary" />
          </div>
        )}
        <div>
          <h1 
            ref={containerRef}
            className="text-3xl font-semibold text-text-primary tracking-tight inline-block cursor-default relative"
          >
            <VariableProximity
              label={title}
              fromFontVariationSettings="'wght' 600, 'opsz' 9"
              toFontVariationSettings="'wght' 900, 'opsz' 40"
              containerRef={containerRef}
              radius={100}
              falloff='linear'
            />
          </h1>
          {subtitle && <p className="text-sm text-text-muted mt-1 block">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

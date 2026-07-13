import React from 'react';
import { cn } from '@/utils/cn';
import { GlowingEffect } from './glowing-effect';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hero?: boolean;
}

export function GlassCard({ children, className, hero = false, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "bg-bg-card border border-border-glass shadow-glass relative",
        hero ? "rounded-3xl p-6 md:p-8" : "rounded-2xl p-5 md:p-6",
        className
      )}
      {...props}
    >
      <GlowingEffect
        spread={60}
        glow={true}
        disabled={false}
        proximity={128}
        inactiveZone={0.05}
        borderWidth={1.5}
      />
      {/* Inner inset shadow layer */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-glass-inset mix-blend-overlay opacity-50 z-0" />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

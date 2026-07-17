import React from 'react';

interface ProgressFormWrapperProps {
  title: string;
  description?: string;
  totalFields: number;
  filledFields: number;
  children: React.ReactNode;
}

export const ProgressFormWrapper: React.FC<ProgressFormWrapperProps> = ({
  title,
  description,
  totalFields,
  filledFields,
  children,
}) => {
  // Endowed Progress Effect: Start at 20%, max at 100%
  const rawPercentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  const displayPercentage = Math.min(100, Math.max(20, rawPercentage));
  
  return (
    <div className="flex flex-col h-full bg-bg-card rounded-xl shadow-glass border border-border-glass">
      {/* Header & Progress Area */}
      <div className="p-6 border-b border-border-glass bg-bg-elevated rounded-t-xl">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
        
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-medium mb-2">
            <span className="text-text-muted">Form Completion</span>
            <span className="text-primary">{displayPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${displayPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Form Content Area */}
      <div className="p-6 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/utils/cn';

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ 
  children, 
  content, 
  className,
  position = 'top' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm dark:bg-gray-800 whitespace-nowrap pointer-events-none",
              positionClasses[position]
            )}
            role="tooltip"
          >
            {content}
            {/* Simple arrow using borders */}
            <div className={cn(
              "absolute w-0 h-0 border-4 border-transparent pointer-events-none",
              position === 'top' && "top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-800",
              position === 'bottom' && "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-800",
              position === 'left' && "left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-800",
              position === 'right' && "right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-800"
            )} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

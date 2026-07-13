import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';
import { CircleIconButton } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        className={cn(
          'relative w-full max-h-[calc(100vh-2rem)] flex flex-col bg-bg-card rounded-2xl shadow-glass border border-border-glass overflow-hidden animate-scale-in',
          sizeClasses[size]
        )}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-glass-inset mix-blend-overlay opacity-50" />
        
        <div className="relative z-10 flex flex-col h-full max-h-[calc(100vh-2rem)]">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-border-glass">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
            </div>
            <CircleIconButton onClick={onClose} icon={<X className="h-4 w-4" />} />
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {children}
          </div>
          {/* Footer */}
          {footer && (
            <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-5 border-t border-border-glass bg-white/[0.02]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

import React from 'react';
import { Modal } from './Modal';
import { PrimaryButton, SecondaryButton } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <SecondaryButton onClick={onClose}>{cancelLabel}</SecondaryButton>
          <PrimaryButton
            onClick={() => { onConfirm(); onClose(); }}
            className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-200' : ''}
          >
            {confirmLabel}
          </PrimaryButton>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={`p-3 rounded-full h-fit ${
          variant === 'danger' ? 'bg-red-50' : variant === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
        }`}>
          <AlertTriangle className={`h-5 w-5 ${
            variant === 'danger' ? 'text-red-600' : variant === 'warning' ? 'text-amber-600' : 'text-blue-600'
          }`} />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}

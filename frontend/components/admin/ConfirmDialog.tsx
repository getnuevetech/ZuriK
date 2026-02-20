'use client';

import React from 'react';
import { useEffect } from 'react';

type DialogVariant = 'danger' | 'warning' | 'default';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
}

const CONFIRM_STYLES: Record<DialogVariant, string> = {
  danger:  'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400 text-white',
  default: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white',
};

const ICON_MAP: Record<DialogVariant, string> = {
  danger:  '⚠️',
  warning: '⚠️',
  default: 'ℹ️',
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0 mt-0.5">{ICON_MAP[variant]}</span>
          <div>
            <h2
              id="confirm-dialog-title"
              className="text-lg font-semibold text-neutral-900"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-neutral-600">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${CONFIRM_STYLES[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

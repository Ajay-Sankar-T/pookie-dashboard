'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  emoji?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  emoji = '🎀',
  children,
  maxHeight = 'max-h-[90vh]',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#351C2C]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Content Container (Bottom Sheet on mobile, Modal on desktop) */}
      <div
        className={`relative w-full max-w-lg bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl border-t md:border border-pookie-soft overflow-hidden flex flex-col z-10 animate-pop-in ${maxHeight}`}
      >
        {/* Handle pill for mobile touch */}
        <div className="pt-3 pb-1 flex justify-center md:hidden">
          <div className="w-12 h-1.5 bg-pookie-accent/60 rounded-full" />
        </div>

        {/* Header */}
        {(title || subtitle) && (
          <div className="px-6 py-4 border-b border-pookie-blush flex items-center justify-between bg-gradient-to-r from-pookie-blush/60 via-white to-pookie-blush/40">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 bg-white rounded-2xl shadow-pookie-sm border border-pookie-soft">
                {emoji}
              </span>
              <div>
                <h3 className="text-lg font-black text-pookie-text tracking-tight flex items-center gap-1.5">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs font-semibold text-pookie-muted mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 text-pookie-muted hover:text-pookie-text rounded-2xl hover:bg-pookie-blush active:scale-90 transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body content */}
        <div className="p-6 safe-area-pb overflow-y-auto overflow-x-hidden flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};


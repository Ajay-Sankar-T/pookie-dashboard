import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-pop-in">
      <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-pookie-soft shadow-pookie text-pookie-text text-sm font-bold tracking-tight">
        <span className="text-base animate-subtle-bounce">🎀</span>
        <span>{message}</span>
      </div>
    </div>
  );
};


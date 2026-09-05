import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji = '🎀',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-4xl bg-gradient-to-b from-white via-pookie-blush/40 to-white border-2 border-dashed border-pookie-soft shadow-pookie-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-3xl bg-white border border-pookie-soft flex items-center justify-center text-3xl shadow-pookie-sm mb-4 animate-float-gentle">
        <span>{emoji}</span>
      </div>
      <h4 className="text-base font-black text-pookie-text tracking-tight mb-1">{title}</h4>
      <p className="text-xs sm:text-sm font-semibold text-pookie-muted max-w-xs mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};


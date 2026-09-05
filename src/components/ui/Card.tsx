import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'blush' | 'highlight' | 'outlined';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  interactive = false,
  className = '',
  ...props
}) => {
  const variantClasses = {
    surface: 'bg-white border border-pookie-border/70 shadow-pookie-sm',
    blush: 'bg-pookie-blush/80 border border-pookie-soft shadow-pookie-sm',
    highlight:
      'bg-gradient-to-br from-white via-pookie-blush/50 to-[#FFEBF3] border-2 border-pookie-soft shadow-pookie',
    outlined: 'bg-transparent border-2 border-dashed border-pookie-soft',
  };

  return (
    <div
      className={`rounded-3xl p-4 md:p-5 transition-all duration-200 ${variantClasses[variant]} ${
        interactive
          ? 'cursor-pointer hover:border-pookie-accent hover:shadow-pookie active:scale-[0.98]'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};


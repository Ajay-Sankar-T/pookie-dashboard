import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'mint' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-bold tracking-tight rounded-2xl transition-all duration-150 select-none active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-pookie-dark focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-2 min-h-[38px] gap-1.5',
    md: 'text-sm px-5 py-3 min-h-[46px] gap-2 shadow-sm',
    lg: 'text-base px-6 py-4 min-h-[54px] gap-2.5 shadow-pookie text-center',
  };

  const variantClasses = {
    primary:
      'pookie-glossy bg-gradient-to-r from-pookie-primary to-[#FF5E9E] text-white hover:brightness-105 hover:shadow-pookie-glow active:from-[#F4589E] active:to-[#E53888] shadow-pookie border border-[#FF87BE]',
    secondary:
      'bg-pookie-blush text-pookie-dark hover:bg-pookie-soft/60 border border-pookie-soft active:bg-pookie-soft',
    outline:
      'bg-white text-pookie-text border-2 border-pookie-soft hover:border-pookie-accent hover:bg-pookie-bg active:bg-pookie-soft/40',
    ghost:
      'bg-transparent text-pookie-muted hover:text-pookie-text hover:bg-pookie-blush active:bg-pookie-soft/50',
    mint:
      'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm border border-emerald-400 active:bg-emerald-700',
    danger:
      'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 active:bg-rose-200',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-1.5">
          <span className="inline-block animate-spin text-sm">🎀</span>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};


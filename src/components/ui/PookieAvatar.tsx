import React from 'react';

interface PookieAvatarProps {
  emoji?: string;
  imageSrc?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;
  selected?: boolean;
  isSelf?: boolean;
  className?: string;
}

export const PookieAvatar: React.FC<PookieAvatarProps> = ({
  emoji,
  imageSrc,
  name,
  size = 'md',
  color,
  selected = false,
  isSelf = false,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8 text-xs rounded-xl',
    sm: 'w-10 h-10 text-sm rounded-2xl',
    md: 'w-12 h-12 text-lg rounded-2xl',
    lg: 'w-16 h-16 text-2xl rounded-3xl',
    xl: 'w-28 h-28 text-4xl rounded-4xl',
    '2xl': 'w-36 h-36 text-5xl rounded-4xl',
  };

  const badgeClasses = {
    xs: 'hidden',
    sm: 'hidden',
    md: '-bottom-1 -right-1 text-[8px] px-1 py-px',
    lg: '-bottom-1 -right-1 text-[9px] px-1.5 py-0.5',
    xl: '-bottom-1.5 -right-1.5 text-[11px] px-2 py-0.5',
    '2xl': '-bottom-2 -right-2 text-xs px-2.5 py-1',
  };

  const displayEmoji = emoji || '🎀';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform select-none overflow-hidden ${
        sizeClasses[size]
      } ${
        selected
          ? 'ring-3 ring-pookie-primary shadow-pookie scale-105'
          : 'border border-pookie-soft shadow-pookie-sm'
      } ${className}`}
      style={{
        backgroundColor: imageSrc ? undefined : color ? `${color}18` : '#FFF0F6',
      }}
      title={name}
    >
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageSrc} alt={name} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <span className="leading-none transform translate-y-[1px]">{displayEmoji}</span>
      )}

      {isSelf && (
        <span
          className={`absolute bg-pookie-primary text-white font-black rounded-full ring-2 ring-white uppercase tracking-wider ${badgeClasses[size]}`}
          title="You"
        >
          You
        </span>
      )}
    </div>
  );
};

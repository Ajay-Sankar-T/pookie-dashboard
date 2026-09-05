'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export type MascotPose = 'greet' | 'chibi';

interface WaifuMascotProps {
  pose?: MascotPose;
  className?: string;
  /** Tailwind size classes for the frame, e.g. "w-40 h-40" */
  sizeClassName?: string;
  floaty?: boolean;
}

const POSE_SRC: Record<MascotPose, string> = {
  greet: '/mascot/greet.png',
  chibi: '/mascot/chibi.png',
};

/**
 * Renders the mascot image if it exists at /public/mascot/, otherwise shows a
 * tasteful kawaii placeholder so the app never flashes a broken-image icon.
 * Drop real art in at the POSE_SRC paths above to upgrade automatically.
 */
export const WaifuMascot: React.FC<WaifuMascotProps> = ({
  pose = 'chibi',
  className = '',
  sizeClassName = 'w-24 h-24',
  floaty = true,
}) => {
  const src = POSE_SRC[pose];
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    const img = new window.Image();
    img.onload = () => !cancelled && setStatus('ready');
    img.onerror = () => !cancelled && setStatus('missing');
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div
      className={`relative shrink-0 select-none ${sizeClassName} ${
        floaty ? 'animate-float-gentle' : ''
      } ${className}`}
    >
      {status === 'ready' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Pookie waifu mascot"
          className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(255,111,174,0.35)]"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-pookie-soft via-pink-100 to-purple-100 border-2 border-dashed border-pookie-accent flex flex-col items-center justify-center gap-1 text-pookie-primary">
          <Sparkles className="w-1/3 h-1/3" strokeWidth={1.75} />
          <span className="text-[9px] font-black uppercase tracking-wide text-pookie-muted px-2 text-center leading-tight">
            {pose === 'greet' ? 'add mascot.png' : 'add chibi.png'}
          </span>
        </div>
      )}
    </div>
  );
};

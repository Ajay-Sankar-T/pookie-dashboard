import React from 'react';

interface SparkleFieldProps {
  count?: number;
  className?: string;
}

const GLYPHS = ['✨', '💖', '⭐', '🎀', '💫'];

function seededParticles(count: number) {
  return Array.from({ length: count }, (_, i) => {
    // Deterministic pseudo-random spread so SSR/CSR markup matches.
    const seed = (i * 137.5) % 100;
    return {
      left: `${(seed * 0.97) % 100}%`,
      top: `${(seed * 1.61 + i * 11) % 100}%`,
      delay: `${(i % 6) * 0.7}s`,
      duration: `${5 + (i % 5)}s`,
      size: 10 + (i % 4) * 4,
      glyph: GLYPHS[i % GLYPHS.length],
    };
  });
}

export const SparkleField: React.FC<SparkleFieldProps> = ({ count = 14, className = '' }) => {
  const particles = seededParticles(count);
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute animate-sparkle-drift opacity-0 select-none"
          style={{
            left: p.left,
            top: p.top,
            fontSize: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
};

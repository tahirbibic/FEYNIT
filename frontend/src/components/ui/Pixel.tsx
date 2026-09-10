import React from 'react';

/**
 * Shared pixel-art UI primitives.
 *
 * These are the only building blocks the redesigned interface layer should use for
 * buttons, panels, badges and progress bars — chunky borders, flat colors, hard
 * offset shadows, a pressed state on click. No gradients, no blur, no soft rounding.
 *
 * Existing background art / illustrations are untouched — these components sit on
 * top of them, they never replace them.
 */

type Variant = 'primary' | 'secondary' | 'wood' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const VARIANT_STYLES: Record<Variant, { bg: string; border: string; shadow: string; text: string; hoverBg: string }> = {
  primary: { bg: '#4ade80', border: '#166534', shadow: '#0f2e1a', text: '#052e16', hoverBg: '#22c55e' },
  secondary: { bg: '#3498db', border: '#1a5276', shadow: '#0d2b3d', text: '#ffffff', hoverBg: '#2980b9' },
  wood: { bg: '#a67139', border: '#5e411b', shadow: '#2d1b0d', text: '#fdf6ea', hoverBg: '#8b5a33' },
  danger: { bg: '#dc2626', border: '#7f1d1d', shadow: '#450a0a', text: '#ffffff', hoverBg: '#b91c1c' },
  ghost: { bg: 'transparent', border: '#c2964e', shadow: 'transparent', text: '#c2964e', hoverBg: 'rgba(194,150,78,0.15)' },
};

const SIZE_STYLES: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs gap-1.5 min-h-[36px]',
  md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
  lg: 'px-8 py-4 text-lg gap-3 min-h-[52px]',
  icon: 'p-2.5 min-h-[44px] min-w-[44px] justify-center',
};

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  active?: boolean; // toggled/pressed-in state (e.g. mic recording, mute on)
}

export const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ variant = 'wood', size = 'md', active = false, className = '', style, disabled, children, ...rest }, ref) => {
    const v = VARIANT_STYLES[variant];
    const shadowSize = size === 'lg' ? 5 : 3;

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center font-retro border-4 transition-all select-none
          ${SIZE_STYLES[size]}
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:translate-y-1 active:shadow-none cursor-pointer'}
          ${className}`}
        style={{
          backgroundColor: active ? v.hoverBg : v.bg,
          borderColor: v.border,
          color: v.text,
          boxShadow: disabled ? 'none' : `${shadowSize}px ${shadowSize}px 0 ${v.shadow}`,
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!disabled && variant !== 'ghost') (e.currentTarget as HTMLButtonElement).style.backgroundColor = v.hoverBg;
          if (!disabled && variant === 'ghost') (e.currentTarget as HTMLButtonElement).style.backgroundColor = v.hoverBg;
        }}
        onMouseLeave={(e) => {
          if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = active ? v.hoverBg : v.bg;
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
PixelButton.displayName = 'PixelButton';

type PanelVariant = 'paper' | 'wood' | 'board' | 'sage';

const PANEL_STYLES: Record<PanelVariant, { bg: string; border: string; text: string }> = {
  paper: { bg: '#f9f2e3', border: '#c2964e', text: '#5e411b' },
  wood: { bg: '#ebd09b', border: '#8b5a33', text: '#3d2b1f' },
  board: { bg: '#1e293b', border: '#334155', text: '#f1f5f9' },
  sage: { bg: 'rgba(92,138,148,0.18)', border: '#5c8a94', text: '#e2e8f0' },
};

interface PixelPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: PanelVariant;
  borderColor?: string;
  bgColor?: string;
}

export function PixelPanel({ variant = 'board', borderColor, bgColor, className = '', style, children, ...rest }: PixelPanelProps) {
  const v = PANEL_STYLES[variant];
  return (
    <div
      className={`border-4 p-5 ${className}`}
      style={{
        backgroundColor: bgColor ?? v.bg,
        borderColor: borderColor ?? v.border,
        color: v.text,
        boxShadow: '4px 4px 0 #000',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

interface PixelBadgeProps {
  children: React.ReactNode;
  tone?: 'green' | 'red' | 'yellow' | 'wood' | 'neutral';
  className?: string;
}

const BADGE_TONES: Record<NonNullable<PixelBadgeProps['tone']>, { bg: string; border: string; text: string }> = {
  green: { bg: '#4ade80', border: '#166534', text: '#052e16' },
  red: { bg: '#f87171', border: '#7f1d1d', text: '#450a0a' },
  yellow: { bg: '#facc15', border: '#854d0e', text: '#422006' },
  wood: { bg: '#c2964e', border: '#5e411b', text: '#2d1b0d' },
  neutral: { bg: '#94a3b8', border: '#334155', text: '#0f172a' },
};

export function PixelBadge({ children, tone = 'neutral', className = '' }: PixelBadgeProps) {
  const t = BADGE_TONES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-retro border-2 uppercase tracking-wide ${className}`}
      style={{ backgroundColor: t.bg, borderColor: t.border, color: t.text }}
    >
      {children}
    </span>
  );
}

interface PixelProgressBarProps {
  value: number; // 0-100
  max?: number;
  segments?: number;
  colorFor?: (value: number) => string;
  label?: React.ReactNode;
}

const defaultColorFor = (v: number) => (v < 30 ? '#4ade80' : v < 70 ? '#facc15' : '#ef4444');

export function PixelProgressBar({ value, max = 100, segments = 10, colorFor = defaultColorFor, label }: PixelProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const filledSegments = Math.round((pct / 100) * segments);
  const color = colorFor(pct);

  return (
    <div>
      <div className="flex gap-[3px] p-1 bg-[#0f172a] border-2 border-[#000]" style={{ width: '100%' }}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-3"
            style={{ backgroundColor: i < filledSegments ? color : '#334155' }}
          />
        ))}
      </div>
      {label && <div className="mt-1 text-center">{label}</div>}
    </div>
  );
}

// Chunky pixel-block loading indicator — replaces spinning circles everywhere.
export function PixelLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="w-4 h-8 bg-[#c2964e] border-2 border-[#5e411b]"
            style={{ animation: `pixelBounce 1s ease-in-out ${i * 0.12}s infinite` }}
          />
        ))}
      </div>
      {label && <p className="font-retro text-sm text-[#c2964e]">{label}</p>}
      <style>{`
        @keyframes pixelBounce {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

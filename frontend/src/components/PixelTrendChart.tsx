import React, { useState } from 'react';

export interface TrendPoint {
  label: string;
  value: number;
  date?: string;
}

interface PixelTrendChartProps {
  data: TrendPoint[];
  ariaLabel?: string;
  /** 'dark' for a navy/board background, 'paper' for a cream report-card background. */
  theme?: 'dark' | 'paper';
}

const THEME_COLORS = {
  dark: { grid: '#334155', tick: '#64748b', axis: '#475569', label: '#64748b', labelHover: '#e2e8f0', tooltipBg: '#0f172a', tooltipBorder: '#475569', tooltipText: '#ffffff' },
  paper: { grid: '#c2964e', tick: '#8b5a33', axis: '#8b5a33', label: '#5e411b', labelHover: '#2d1b0d', tooltipBg: '#3d2b1f', tooltipBorder: '#5e411b', tooltipText: '#f9f2e3' },
};

function barColor(v: number) {
  if (v >= 70) return '#22c55e'; // green-500 — good
  if (v >= 40) return '#eab308'; // yellow-500 — mid
  return '#ef4444'; // red-500 — low
}

const W = 600;
const H = 220;
const PAD_L = 32;
const PAD_R = 10;
const PAD_T = 14;
const PAD_B = 26;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const Y_TICKS = [0, 25, 50, 75, 100];

export function PixelTrendChart({ data, ariaLabel, theme = 'dark' }: PixelTrendChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const slot = data.length ? PLOT_W / data.length : PLOT_W;
  const barW = Math.max(6, slot * 0.55);
  const c = THEME_COLORS[theme];

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label={ariaLabel || 'Score trend chart'}
      >
        {Y_TICKS.map((tick) => {
          const y = PAD_T + PLOT_H - (tick / 100) * PLOT_H;
          return (
            <g key={tick}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke={c.grid} strokeWidth={1} strokeDasharray="2 3" opacity={theme === 'paper' ? 0.5 : 1} />
              <text x={PAD_L - 6} y={y + 3} textAnchor="end" fontSize={9} fill={c.tick} fontFamily="monospace">
                {tick}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const clamped = Math.max(0, Math.min(100, d.value));
          const barH = Math.max(2, (clamped / 100) * PLOT_H);
          const x = PAD_L + i * slot + (slot - barW) / 2;
          const y = PAD_T + PLOT_H - barH;
          const isHover = hover === i;
          return (
            <g
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* full-height hit area so hovering near a short bar still works */}
              <rect x={PAD_L + i * slot} y={PAD_T} width={slot} height={PLOT_H} fill="transparent" />
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill={barColor(clamped)}
                stroke={isHover ? (theme === 'paper' ? '#2d1b0d' : '#f8fafc') : (theme === 'paper' ? '#5e411b' : '#0f172a')}
                strokeWidth={isHover ? 2 : 1}
              />
              <text
                x={x + barW / 2}
                y={H - PAD_B + 12}
                textAnchor="middle"
                fontSize={8}
                fill={isHover ? c.labelHover : c.label}
                fontFamily="monospace"
              >
                {d.label}
              </text>
            </g>
          );
        })}

        <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={W - PAD_R} y2={PAD_T + PLOT_H} stroke={c.axis} strokeWidth={1.5} />
      </svg>

      {hover !== null && data[hover] && (
        <div
          className="absolute pointer-events-none px-2 py-1 text-[11px] font-retro border-2 shadow-[2px_2px_0_#000] whitespace-nowrap z-10 -translate-x-1/2"
          style={{
            left: `${((hover + 0.5) / data.length) * 100}%`,
            top: 0,
            backgroundColor: c.tooltipBg,
            borderColor: c.tooltipBorder,
            color: c.tooltipText,
          }}
        >
          {data[hover].date ? `${data[hover].date} · ` : ''}
          {data[hover].value}/100
        </div>
      )}
    </div>
  );
}

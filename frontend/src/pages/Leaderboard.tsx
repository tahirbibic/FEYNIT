import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/language';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  name: string;
  score: number;
  isMe?: boolean;
}

interface LeaderboardProps {
  onBack: () => void;
  iqPoints: number;
  username: string;
}

// leaderboard.png is a tall 1145x1374 board with rank numbers 1-5 already drawn on it,
// so rows only need name + score. Percentages below are estimated from the artwork
// (no pixel-perfect measurement tool available) — re-check against the real render and
// nudge if a row's text doesn't sit on its plank.
const ROW_CENTERS = [31, 43, 55, 67, 79];
const BACK_BUTTON_TOP = 91;
const TITLE_TOP = 16;

// TEMP: flip to false to go back to real Supabase data. True fills the board with
// varied fake accounts (long name, short name, etc.) purely to sanity-check that
// row/back-button positions and text sizing hold up — remove once confirmed.
const DEBUG_USE_DUMMY_DATA = false;
const DUMMY_ENTRIES: LeaderboardEntry[] = [
  { name: 'Aleksandar Jovanović', score: 245 },
  { name: 'Milica', score: 198 },
  { name: 'TeamRocket99', score: 174, isMe: true },
  { name: 'Bob', score: 150 },
  { name: 'X', score: 132 },
];

export function Leaderboard({ onBack, iqPoints, username }: LeaderboardProps) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (DEBUG_USE_DUMMY_DATA) {
      setEntries(DUMMY_ENTRIES);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('user_stats')
        .select('username, iq_points')
        .order('iq_points', { ascending: false })
        .limit(50);

      const rows: LeaderboardEntry[] = Array.isArray(data)
        ? data.map(d => ({
            name: d.username,
            score: d.iq_points,
            isMe: d.username === username,
          }))
        : [];

      // If current user isn't in DB yet (first session), inject their entry
      if (!rows.some(r => r.name === username)) {
        rows.push({ name: username || 'Ti', score: iqPoints, isMe: true });
        rows.sort((a, b) => b.score - a.score);
      }

      setEntries(rows.slice(0, 5));
    })();
  }, [username, iqPoints]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 w-full h-full font-silkscreen flex items-center justify-center"
    >
      <img
        src="/assets/login-bg.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ pointerEvents: 'none' }}
      />

      {/* Portrait board — shown via object-contain (not cover) so it isn't cropped
          inside the 16:9 stage. Percentages inside are relative to this box, which
          matches the image's own aspect ratio exactly. */}
      <div className="relative z-10 h-[92%]" style={{ aspectRatio: '1145 / 1374' }}>
        <img
          src="/assets/leaderboard.png"
          alt="Rang Lista"
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none', imageRendering: 'pixelated' }}
        />

        <div
          className="absolute inset-x-0 flex items-center justify-center"
          style={{ top: `${TITLE_TOP}%`, transform: 'translateY(-50%)' }}
        >
          <span
            className="font-retro text-base md:text-xl text-[#f4d58d] uppercase tracking-wider"
            style={{ textShadow: '-1px -1px 0 #3d2b1f, 1px -1px 0 #3d2b1f, -1px 1px 0 #3d2b1f, 1px 1px 0 #3d2b1f, 0 2px 3px rgba(0,0,0,0.6)' }}
          >
            {t('leaderboardTitle')}
          </span>
        </div>

        {entries.map((acc, idx) => {
          const color = acc.isMe ? '#ffe9b3' : '#f0d9a8';
          return (
            <div
              key={idx}
              className="absolute inset-x-0 flex items-center px-[32%]"
              style={{ top: `${ROW_CENTERS[idx]}%`, transform: 'translateY(-50%)' }}
            >
              <span
                className="flex-1 text-[11px] md:text-sm font-bold uppercase truncate"
                style={{ color, textShadow: '1px 1px 0 #2d1b0d' }}
              >
                {acc.name}
              </span>
              <span
                className="text-[11px] md:text-sm font-bold shrink-0 ml-2"
                style={{ color, textShadow: '1px 1px 0 #2d1b0d' }}
              >
                {acc.score}
              </span>
            </div>
          );
        })}

        <button
          onClick={onBack}
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-none flex items-center justify-center"
          style={{ top: `${BACK_BUTTON_TOP}%`, width: '34%', height: '7%' }}
        >
          <span
            className="font-retro text-xs md:text-base text-[#f4d58d] uppercase tracking-wider"
            style={{ textShadow: '-1px -1px 0 #3d2b1f, 1px -1px 0 #3d2b1f, -1px 1px 0 #3d2b1f, 1px 1px 0 #3d2b1f, 0 2px 3px rgba(0,0,0,0.6)' }}
          >
            {t('back')}
          </span>
        </button>
      </div>
    </motion.div>
  );
}

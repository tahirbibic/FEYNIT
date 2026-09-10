import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getIqLevel } from '../components/IqLevel';
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

const ROW_TOPS = [20, 27.5, 35, 42.5, 50, 57.5, 65, 72.5, 80];

export function Leaderboard({ onBack, iqPoints, username }: LeaderboardProps) {
  const { lang } = useLanguage();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
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

      setEntries(rows.slice(0, 9));
    })();
  }, [username, iqPoints]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 w-full h-full font-silkscreen"
    >
      <img
        src="/assets/leaderboard.jpeg"
        alt="Rang Lista"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ pointerEvents: 'none' }}
      />

      <div className="absolute inset-0">
        {entries.map((acc, idx) => (
          <div
            key={idx}
            className="absolute inset-x-0 flex items-center"
            style={{ top: `${ROW_TOPS[idx]}%`, height: '6%' }}
          >
            <span
              className="absolute text-[10px] md:text-xs font-bold"
              style={{ left: '39.25%', color: acc.isMe ? '#FFD700' : idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#f5e6ce' }}
            >
              {acc.score}
            </span>

            <span
              className="absolute text-[10px] md:text-xs font-bold uppercase truncate"
              style={{ left: '44%', maxWidth: '14%', color: acc.isMe ? '#FFD700' : idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#f5e6ce' }}
            >
              {acc.name}
            </span>

            <span
              className="absolute text-[9px] md:text-[11px] font-bold uppercase"
              style={{ left: '58%', color: acc.isMe ? '#FFD700' : idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#f5e6ce' }}
            >
              {getIqLevel(acc.score, lang)}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onBack}
        className="absolute cursor-pointer bg-transparent border-none"
        style={{ left: '37%', top: '88%', width: '26%', height: '9%' }}
        aria-label="Vrati se nazad"
      />
    </motion.div>
  );
}

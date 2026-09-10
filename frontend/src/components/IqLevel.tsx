import React from 'react';
import { Brain } from 'lucide-react';
import { useLanguage } from '../lib/language';
import { Lang } from '../lib/translations';

interface IqLevelProps {
  iqPoints: number;
  className?: string;
}

export const getIqLevel = (points: number, lang: Lang = 'sr'): string => {
  if (lang === 'en') {
    if (points < 100) return 'BEGINNER';
    if (points < 115) return 'REASONABLE';
    if (points < 135) return 'SMART';
    if (points < 155) return 'GENIUS';
    if (points < 180) return 'EXTREME';
    return 'MYSTERY';
  }
  if (points < 100) return 'POČETNIK';
  if (points < 115) return 'RAZUMAN';
  if (points < 135) return 'PAMETAN';
  if (points < 155) return 'GENIJE';
  if (points < 180) return 'EKSTREMAN';
  return 'MISTERIJA';
};

// Native size of iq_frame.png is 1672x941. We scale the whole frame's height down 25%
// (not crop) — the full artwork stays visible, just flatter — so the container's aspect
// ratio uses height*0.75.
const FRAME_ASPECT = `${1672} / ${941 * 0.75}`;

const TEXT_OUTLINE = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 3px rgba(0,0,0,0.5)';

export function IqLevel({ iqPoints, className = '' }: IqLevelProps) {
  const { lang, t } = useLanguage();
  const level = getIqLevel(iqPoints, lang);

  return (
    <div className={`flex items-center ${className}`}>
      <div
        className="relative w-44 md:w-52 overflow-hidden"
        style={{ aspectRatio: FRAME_ASPECT }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/assets/iq_frame.png"
            alt=""
            className="w-full h-auto select-none pointer-events-none"
            style={{ imageRendering: 'pixelated', transform: 'scaleY(0.75)' }}
            draggable={false}
          />
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 px-5"
          style={{ textShadow: TEXT_OUTLINE }}
        >
          <div className="shrink-0 bg-[#4ade80] p-1 border-2 border-[#052e16]">
            <Brain size={16} className="text-[#052e16]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-retro text-[8px] md:text-[9px] text-[#f9f2e3] leading-none mb-1 truncate">{t('iqLevelLabel')}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-retro text-white text-[11px] md:text-xs truncate">{level}</span>
              <span className="font-retro text-[#4ade80] text-[10px] md:text-xs shrink-0">({iqPoints})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

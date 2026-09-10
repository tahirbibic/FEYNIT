import React from 'react';
import { useLanguage } from '../lib/language';
import { PixelButton } from '../components/ui/Pixel';

interface GreenboardMenuProps {
  onBack: () => void;
  onTeach: () => void;
  onTest: () => void;
}

export function GreenboardMenu({ onBack, onTeach, onTest }: GreenboardMenuProps) {
  const { t } = useLanguage();
  return (
    <div className="w-full h-full bg-black relative flex items-center justify-center font-silkscreen overflow-hidden">
      <div className="relative w-full max-w-6xl aspect-video bg-[#3a2818] shadow-2xl overflow-hidden">
        <img
          src="/assets/greenboard-bg.jpg"
          alt="Greenboard Menu"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            document.getElementById('greenboard-fallback')!.style.display = 'flex';
          }}
        />
        <div id="greenboard-fallback" className="absolute inset-0 hidden flex-col items-center justify-center text-white text-center p-8 bg-[#3a2818]">
          <div className="mt-8 flex gap-4">
            <PixelButton variant="danger" onClick={onBack}>{t('back')}</PixelButton>
            <PixelButton variant="primary" onClick={onTest}>{t('handOutExams')}</PixelButton>
            <PixelButton variant="secondary" onClick={onTeach}>{t('teachLessonBtn')}</PixelButton>
          </div>
        </div>

        <button
          onClick={onTest}
          className="absolute left-[15.5%] top-[65.5%] w-[32%] h-[16.5%] bg-transparent hover:bg-white/20 cursor-pointer transition-colors border-2 border-transparent hover:border-green-300/80 rounded-[12px] z-10"
          title={t('handOutExams')}
        >
          <span className="sr-only">Podeli testove</span>
        </button>

        <button
          onClick={onTeach}
          className="absolute left-[52%] top-[65.5%] w-[32%] h-[16.5%] bg-transparent hover:bg-white/20 cursor-pointer transition-colors border-2 border-transparent hover:border-green-300/80 rounded-[12px] z-10"
          title={t('teachLessonBtn')}
        >
          <span className="sr-only">Predaj lekciju</span>
        </button>

        <PixelButton variant="danger" size="lg" onClick={onBack} className="absolute top-4 left-4 z-20 text-xl">
          {t('backToDesk')}
        </PixelButton>
      </div>
    </div>
  );
}

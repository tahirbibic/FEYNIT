import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { generateContentProxy } from '../lib/ai';
import { Message, SessionRecord } from '../App';
import {
  Trophy,
  Target,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Award,
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
} from 'lucide-react';
import { useLanguage } from '../lib/language';
import { PixelTrendChart, TrendPoint } from '../components/PixelTrendChart';
import { PixelButton, PixelPanel, PixelLoader } from '../components/ui/Pixel';

interface AnalyticsProps {
  transcript: Message[];
  confusion: number;
  lessonText: string;
  history: SessionRecord[];
  onBack: () => void;
  onSave: (record: SessionRecord) => void;
}

interface AnalysisResult {
  score: number;
  goodPoints: string[];
  badPoints: string[];
  summary: string;
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  suffix?: string;
  accent: string;
}) {
  return (
    <PixelPanel variant="paper" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-wider text-[#8b5a33] uppercase font-retro">{label}</span>
        <div style={{ color: accent }}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl md:text-5xl font-retro leading-none" style={{ color: accent }}>
          {value}
        </span>
        {suffix && <span className="text-sm text-[#8b5a33]/70">{suffix}</span>}
      </div>
    </PixelPanel>
  );
}

export function Analytics({ transcript, confusion, lessonText, history, onBack, onSave }: AnalyticsProps) {
  const { lang, t } = useLanguage();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    const generateReport = async () => {
      try {
        const chatText = transcript.map(m => `${m.sender}: ${m.text}`).join('\n');
        const prompt = `
          Analiziraj sesiju predavanja koristeći Feynmanovu tehniku.

          ${lessonText ? `TEMA LEKCIJE:\n${lessonText.substring(0, 500)}\n` : ''}
          TRANSKRIPT:
          ${chatText}

          NIVO ZBUNJENOSTI UČENIKA: ${confusion}%

          Return ONLY a valid JSON object ${lang === 'en' ? 'in ENGLISH' : 'na SRPSKOM jeziku'}:
          {
            "score": 1-100 (pedagoški skor),
            "goodPoints": ["lista pozitivnih stvari"],
            "badPoints": ["stvari za poboljšanje"],
            "summary": "kratak zaključak od 3 rečenice"
          }
        `;

        const response = await generateContentProxy({
          model: 'openai/gpt-oss-120b',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        });

        let text = response.text || "{}";
        // Strip markdown code fences if present
        const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (fenceMatch) {
          text = fenceMatch[1];
        } else {
          // Extract first JSON object from the text in case of preamble
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) text = jsonMatch[0];
        }

        const result = JSON.parse(text.trim()) as AnalysisResult;
        setData(result);

        if (!hasSaved) {
          const record: SessionRecord = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('sr-RS'),
            topic: lessonText.substring(0, 50) || "Opšta tema",
            confusion,
            report: result.summary,
            grade: result.score
          };
          onSave(record);
          setHasSaved(true);
        }
      } catch (err) {
        console.error(err);
        setData({
          score: Math.max(0, 100 - confusion),
          goodPoints: ["Predavanje je završeno."],
          badPoints: ["Greška pri AI analizi."],
          summary: "Analiza trenutno nije dostupna, ali vaš napredak je sačuvan."
        });
      }
      setIsLoading(false);
    };

    generateReport();
  }, []);

  // Chronological (oldest -> newest) view of history for the trend chart / aggregates.
  const chronological = useMemo(() => [...history].reverse(), [history]);

  const totalScore = useMemo(
    () => chronological.reduce((sum, r) => sum + r.grade, 0),
    [chronological]
  );
  const averageScore = useMemo(
    () => (chronological.length ? Math.round(totalScore / chronological.length) : (data?.score ?? 0)),
    [chronological, totalScore, data]
  );
  const bestScore = useMemo(
    () => (chronological.length ? Math.max(...chronological.map(r => r.grade)) : (data?.score ?? 0)),
    [chronological, data]
  );
  const totalSessions = chronological.length;

  const trendData: TrendPoint[] = useMemo(
    () =>
      chronological.slice(-10).map((r, i, arr) => ({
        label: `#${chronological.length - arr.length + i + 1}`,
        value: r.grade,
        date: r.date,
      })),
    [chronological]
  );

  const recentActivity = useMemo(() => history.slice(0, 5), [history]);

  const currentScore = data?.score ?? 0;
  const scoreDelta = currentScore - averageScore;

  return (
    <div className="relative w-full h-full bg-[#2d1b0d] text-[#f9f2e3] flex flex-col font-pixel overflow-y-auto custom-scrollbar">
      {/* faint wood-grain wash instead of a flat void behind the report card */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ background: 'repeating-linear-gradient(180deg, #3d2b1f 0px, #3d2b1f 2px, #2d1b0d 2px, #2d1b0d 4px)' }}
      />
      <div className="relative z-[1] w-full max-w-5xl mx-auto p-4 md:p-6">
        {/* HEADER — single breadcrumb-style back control, on a wood bar */}
        <header className="flex items-center justify-between gap-3 mb-6 md:mb-8 border-4 border-[#5e411b] bg-[#8b5a33] px-4 py-3" style={{ boxShadow: '4px 4px 0 #000' }}>
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="shrink-0 p-2.5 md:p-3 bg-[#4ade80] border-4 border-[#166534]" style={{ boxShadow: '3px 3px 0 #000' }}>
              <BarChart3 size={24} className="text-[#052e16]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-retro tracking-tight truncate text-[#f9f2e3]">{t('lectureAnalytics')}</h1>
              <p className="text-[11px] md:text-sm text-[#f9f2e3]/70 truncate">{t('analyticsSubtitle')}</p>
            </div>
          </div>

          <PixelButton variant="danger" size="md" onClick={onBack} aria-label={t('back')}>
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">{t('back')}</span>
          </PixelButton>
        </header>

        {isLoading ? (
          <div className="h-[55vh] flex items-center justify-center">
            <PixelLoader label={t('writingReport')} />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 md:space-y-8 pb-10"
          >
            {/* KEY METRICS */}
            <section aria-label={t('performanceBreakdown')} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StatCard icon={<Layers size={20} />} label={t('totalScore')} value={totalScore} accent="#2563eb" />
              <StatCard icon={<Target size={20} />} label={t('averageScore')} value={averageScore} suffix="/100" accent="#0d9488" />
              <StatCard icon={<Trophy size={20} />} label={t('bestScore')} value={bestScore} suffix="/100" accent="#b45309" />
              <StatCard icon={<Award size={20} />} label={t('totalSessions')} value={totalSessions} accent="#7c3aed" />
            </section>

            {/* MAIN ANALYTICS — this session + trend, framed like a paper report card */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <PixelPanel variant="paper" className="lg:col-span-1 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -top-2 -right-2 opacity-10 pointer-events-none text-[#8b5a33]">
                  <Trophy size={110} />
                </div>
                <div>
                  <h2 className="text-xs md:text-sm text-[#8b5a33] mb-2 uppercase tracking-wider font-retro">{t('pedagogicalRating')}</h2>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl md:text-7xl font-retro text-[#3d2b1f]">{currentScore}</span>
                    <span className="text-xl text-[#8b5a33]/70">/ 100</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs md:text-sm">
                    {scoreDelta > 0 && <TrendingUp size={16} className="text-green-700" />}
                    {scoreDelta < 0 && <TrendingDown size={16} className="text-red-700" />}
                    {scoreDelta === 0 && <Minus size={16} className="text-[#8b5a33]" />}
                    <span className={scoreDelta > 0 ? 'text-green-700' : scoreDelta < 0 ? 'text-red-700' : 'text-[#8b5a33]'}>
                      {scoreDelta > 0 ? '+' : ''}{scoreDelta} {t('vsAverage')}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-[#5e411b] text-sm leading-relaxed">{data?.summary}</p>
              </PixelPanel>

              <PixelPanel variant="paper" className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs md:text-sm text-[#8b5a33] uppercase tracking-wider font-retro">{t('scoreTrend')}</h2>
                  <span className="text-[10px] text-[#8b5a33]/70">0–100</span>
                </div>
                {trendData.length >= 2 ? (
                  <PixelTrendChart data={trendData} ariaLabel={t('scoreTrend')} theme="paper" />
                ) : (
                  <div className="h-[220px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#c2964e] text-center px-6">
                    <BarChart3 size={40} className="text-[#c2964e]" />
                    <p className="text-sm font-retro text-[#8b5a33]">{t('notEnoughData')}</p>
                    <p className="text-xs text-[#8b5a33]/70 max-w-xs">{t('notEnoughDataDesc')}</p>
                  </div>
                )}
              </PixelPanel>
            </section>

            {/* SECONDARY DATA */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <PixelPanel variant="sage" borderColor="#166534">
                <h3 className="text-sm font-bold text-green-300 mb-3 flex items-center gap-2 uppercase tracking-wider font-retro">
                  <Target size={16} className="text-green-400" /> {t('whatWasGood')}
                </h3>
                <ul className="space-y-2.5">
                  {data?.goodPoints.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#e2e8f0]">
                      <span className="text-green-400 shrink-0">►</span> {p}
                    </li>
                  ))}
                </ul>
              </PixelPanel>

              <PixelPanel bgColor="rgba(127,29,29,0.28)" borderColor="#7f1d1d">
                <h3 className="text-sm font-bold text-red-300 mb-3 flex items-center gap-2 uppercase tracking-wider font-retro">
                  <AlertTriangle size={16} className="text-red-400" /> {t('forImprovement')}
                </h3>
                <ul className="space-y-2.5">
                  {data?.badPoints.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#e2e8f0]">
                      <span className="text-red-400 shrink-0">►</span> {p}
                    </li>
                  ))}
                </ul>
              </PixelPanel>

              <PixelPanel variant="wood">
                <h3 className="text-sm font-bold text-[#3d2b1f] mb-3 flex items-center gap-2 uppercase tracking-wider font-retro">
                  <Clock size={16} className="text-[#5e411b]" /> {t('recentActivity')}
                </h3>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-[#5e411b]/70 italic">{t('notEnoughData')}</p>
                ) : (
                  <ul className="space-y-2">
                    {recentActivity.map((r, i) => (
                      <li key={r.id} className="flex items-center gap-2 text-xs md:text-sm">
                        <span className="text-[#5e411b]/70 w-16 shrink-0">{r.date}</span>
                        <span className="flex-1 truncate text-[#3d2b1f]">{i === 0 ? t('thisSession') : r.topic}</span>
                        <span
                          className="font-retro shrink-0"
                          style={{ color: r.grade >= 70 ? '#166534' : r.grade >= 40 ? '#854d0e' : '#7f1d1d' }}
                        >
                          {r.grade}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </PixelPanel>
            </section>

            {/* Confusion, kept as a compact secondary stat rather than competing with the hero score */}
            <section>
              <PixelPanel variant="paper" className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 border-2 ${confusion > 50 ? 'border-red-700 bg-red-100 text-red-700' : 'border-green-700 bg-green-100 text-green-700'}`}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className="text-[11px] uppercase tracking-wider text-[#8b5a33] font-retro">{t('confusionFinalLabel')}</h3>
                    <p className="text-xs text-[#8b5a33]/70">{t('sessionResult')}</p>
                  </div>
                </div>
                <span className={`text-3xl font-retro ${confusion > 50 ? 'text-red-700' : 'text-green-700'}`}>
                  {confusion}%
                </span>
              </PixelPanel>
            </section>
          </motion.div>
        )}
      </div>
    </div>
  );
}

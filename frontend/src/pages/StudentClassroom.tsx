import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, HelpCircle, ArrowLeft, GraduationCap, Library, FileText, Loader2 } from 'lucide-react';
import { generateContentProxy } from '../lib/ai';
import { useLanguage } from '../lib/language';
import { PixelButton } from '../components/ui/Pixel';
import { PixelModal } from '../components/ui/PixelModal';

interface BibliotekaDoc {
  filename: string;
  name: string;
}

interface StudentClassroomProps {
  onBack: () => void;
  onStartLearning: () => void;
  lessonText: string;
  setLessonText: React.Dispatch<React.SetStateAction<string>>;
  learningLevel: 'basic' | 'medium' | 'advanced';
  setLearningLevel: (level: 'basic' | 'medium' | 'advanced') => void;
}

export function StudentClassroom({ onBack, onStartLearning, lessonText, setLessonText, learningLevel, setLearningLevel }: StudentClassroomProps) {
  const { t } = useLanguage();
  const [activePopup, setActivePopup] = useState<'material' | null>(null);
  const [popupTab, setPopupTab] = useState<'upload' | 'biblioteka'>('upload');
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<BibliotekaDoc[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      if (file.type === 'text/plain') {
        setLessonText(await file.text());
      } else if (file.type === 'application/pdf') {
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const base64 = base64Data.split(',')[1];
        const res = await fetch('/api/extract-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data: base64 }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        setLessonText((await res.json()).text || '');
      } else {
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const base64 = base64Data.split(',')[1];
        const mimeType = file.type || 'application/octet-stream';
        const result = await generateContentProxy({
          model: 'openai/gpt-oss-120b',
          contents: [{
            role: 'user',
            parts: [
              { inlineData: { data: base64, mimeType } },
              { text: "Izvuci sav tekst iz ove slike koji bi bio koristan za lekciju. Vrati isključivo čitak tekst lekcije, bez dodatnih komentara." }
            ]
          }]
        });
        setLessonText(result.text || '');
      }
    } catch (error) {
      console.error(error);
      alert("Greška pri čitanju fajla.");
    }
    setIsExtracting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fetchDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch('/api/content-pdfs');
      if (res.ok) setDocuments(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    if (popupTab === 'biblioteka') fetchDocuments();
  }, [popupTab, fetchDocuments]);

  const loadFromBiblioteka = async (doc: BibliotekaDoc) => {
    setIsExtracting(true);
    try {
      const res = await fetch(`/api/content-pdfs/${encodeURIComponent(doc.filename)}`);
      if (!res.ok) throw new Error((await res.json()).error);
      const { text } = await res.json();
      setLessonText(text);
      setActivePopup(null);
    } catch (err: any) {
      alert('Greška pri učitavanju: ' + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="w-full h-full relative font-silkscreen overflow-hidden bg-[#88a898]">
      <img src="/assets/desk-student.jpg" alt="Student Desk" className="w-full h-full object-contain" />

      <button
        onClick={() => setActivePopup('material')}
        className="absolute top-[18%] left-[37%] w-[26%] h-[34%] bg-transparent hover:bg-yellow-400/5 cursor-pointer transition-all border-4 border-transparent hover:border-yellow-400/40 rounded-xl z-10 group"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white p-2 text-[10px] font-pixel whitespace-nowrap mb-2">
          {t('clickToSetMaterial')}
        </div>
      </button>

      {lessonText && (
        <div className="absolute top-[28%] left-[37%] w-[26%] h-[24%] pointer-events-none opacity-40 overflow-hidden">
          <p className="text-[8px] font-pixel text-[#5d4037] text-center line-clamp-6 leading-tight">{lessonText}</p>
        </div>
      )}

      <div className="absolute top-10 right-10 flex gap-6 z-20">
        <PixelButton variant="danger" size="lg" onClick={onBack}>
          <ArrowLeft size={20} /> {t('back')}
        </PixelButton>
        <PixelButton variant="primary" size="lg" onClick={onStartLearning} disabled={!lessonText}>
          <GraduationCap size={20} /> {t('teachMe')}
        </PixelButton>
      </div>

      <AnimatePresence>
        {activePopup === 'material' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 sm:p-8"
          >
            <PixelModal
              onClose={() => setActivePopup(null)}
              maxWidthClass="max-w-5xl"
              tabs={[
                { id: 'upload', label: t('uploadFile'), icon: <BookOpen size={18} /> },
                { id: 'biblioteka', label: t('library'), icon: <Library size={18} /> },
              ]}
              activeTab={popupTab}
              onTabChange={(id) => setPopupTab(id as 'upload' | 'biblioteka')}
            >
                {popupTab === 'upload' && (
                  <div className="flex flex-col lg:flex-row gap-8 flex-1">
                    <div className="flex-[2] flex flex-col gap-6">
                      <div className="flex gap-4">
                        <PixelButton variant="secondary" size="lg" className="flex-1 justify-center" onClick={() => fileInputRef.current?.click()} disabled={isExtracting}>
                          {isExtracting ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><GraduationCap size={24} /></motion.div> : <BookOpen size={24} />}
                          {isExtracting ? t('analyzing') : t('uploadPdfImage')}
                        </PixelButton>
                        <input type="file" className="hidden" ref={fileInputRef} accept="application/pdf,image/*,text/plain" onChange={handleFileUpload} />
                      </div>
                      <div className="flex-1 flex flex-col min-h-[300px]">
                        <div className="flex justify-between items-end mb-2">
                          <label className="text-sm font-bold text-[#5e411b] uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-600 rounded-full" /> {t('journalContent')}
                          </label>
                          <span className="text-[10px] text-[#8b5a33]/70">{lessonText.length} {t('characters')}</span>
                        </div>
                        <textarea value={lessonText} onChange={(e) => setLessonText(e.target.value)} className="w-full flex-1 bg-[#f9f2e3] border-4 border-[#c2964e] p-6 text-lg md:text-xl text-[#3d2b1f] resize-none focus:outline-none focus:border-[#8b5a33] transition-colors leading-relaxed custom-scrollbar shadow-inner" placeholder={t('pasteLessonText')} />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-8">
                      <div className="bg-[#d4bb72]/40 border-4 border-[#c2964e] p-6">
                        <h3 className="font-retro text-xl mb-4 text-[#5e411b] border-b-2 border-[#c2964e]/40 pb-2">{t('lectureLevel')}</h3>
                        <div className="flex flex-col gap-3">
                          {(['basic', 'medium', 'advanced'] as const).map((level) => (
                            <button key={level} onClick={() => setLearningLevel(level)} className={`w-full px-4 py-3 border-4 font-retro text-sm transition-all text-left flex justify-between items-center ${learningLevel === level ? 'bg-[#8b5a33] border-[#5e411b] text-white translate-x-2' : 'bg-white/40 border-[#c2964e]/50 text-[#5e411b]/70 hover:bg-white/70'}`}>
                              {level === 'basic' ? t('basicLevel') : level === 'medium' ? t('mediumLevel') : t('advancedLevel')}
                              {learningLevel === level && <GraduationCap size={16} />}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="bg-[#d4e6f1] border-4 border-[#2e86c1] p-6">
                        <div className="flex items-center gap-2 mb-3 text-[#1b4f72]"><HelpCircle size={20} /><h4 className="font-retro text-sm">{t('instructionsTitle')}</h4></div>
                        <ul className="text-[10px] font-pixel text-[#1b4f72] space-y-2">
                          <li>• {t('uploadPdfOrWrite')}</li>
                          <li>• {t('aiWillAnalyze')}</li>
                          <li>• {t('chooseDifficulty')}</li>
                        </ul>
                      </div>
                      <div className="mt-auto pt-6">
                        <PixelButton variant="primary" size="lg" className="w-full justify-center text-2xl" onClick={() => setActivePopup(null)}>
                          {t('saveAndGo')}
                        </PixelButton>
                      </div>
                    </div>
                  </div>
                )}

                {popupTab === 'biblioteka' && (
                  <div className="flex flex-col flex-1">
                    {isLoadingDocs ? (
                      <div className="flex-1 flex items-center justify-center text-[#5e411b]">
                        <Loader2 size={40} className="animate-spin mr-3" />
                        <span className="font-retro text-xl">{t('loading')}</span>
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-[#5e411b] opacity-50">
                        <Library size={64} className="mb-4" />
                        <p className="font-retro text-xl">{t('libraryEmpty')}</p>
                        <p className="font-pixel text-sm mt-2">{t('professorNeedsToAdd')}</p>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {documents.map((doc) => (
                          <button key={doc.filename} onClick={() => loadFromBiblioteka(doc)} disabled={isExtracting} className="w-full text-left bg-[#f9f2e3] border-4 border-[#c2964e] p-5 hover:border-[#8b5a33] transition-all flex items-center gap-4 group disabled:opacity-50">
                            <FileText size={32} className="text-[#c2964e] flex-shrink-0 group-hover:text-[#8b5a33]" />
                            <div className="flex-1 min-w-0">
                              <p className="font-retro text-xl text-[#5e411b] truncate">{doc.name}</p>
                            </div>
                            <span className="font-retro text-sm text-green-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">{t('load')} →</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
            </PixelModal>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

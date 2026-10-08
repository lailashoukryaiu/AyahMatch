import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  BookOpen,
  Check,
  X,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Eye,
  Pause,
  Play,
} from 'lucide-react';
import { MutashabihaQuestion, UserProgress } from '../types.ts';
import { DifferenceViewer } from './DifferenceViewer.tsx';
import { recitationService } from '../services/audioRecitationService.ts';
import { sound } from '../services/soundService.ts';

interface QuizViewProps {
  questions: MutashabihaQuestion[];
  onCompleteQuiz: (score: number, total: number) => void;
  progress: UserProgress;
  onAddXp: (amount: number) => void;
  onOpenSurahSelector: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  questions,
  onCompleteQuiz,
  progress,
  onAddXp,
  onOpenSurahSelector,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answersMap, setAnswersMap] = useState<Record<number, boolean>>({});
  const answersRef = useRef<Record<number, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers and reset when questions list changes
  useEffect(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsChecked(false);
    setIsCorrect(false);
    setAnswersMap({});
    answersRef.current = {};
    setShowExplanation(false);
    recitationService.stop();
    setIsPlayingAudio(false);
  }, [questions]);

  // Reset answer states when advancing to next question within the same session
  useEffect(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    setSelectedOptionId(null);
    setIsChecked(false);
    setIsCorrect(false);
    setShowExplanation(false);
    recitationService.stop();
    setIsPlayingAudio(false);
  }, [currentIndex]);

  const currentQ = questions[currentIndex];

  if (!currentQ || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center font-arabic" dir="rtl">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-700">
          <BookOpen className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-stone-900 mb-1.5">
          لا توجد مواضع تدريب مطابقة للنطاق المحدد
        </h2>
        <p className="text-stone-600 mb-5 text-xs">
          يرجى تحديد سور إضافية أو اختيار نطاق «تشمل المقارنة مع سائر سور القرآن».
        </p>
        <button
          onClick={onOpenSurahSelector}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تحديد نطاق التدريب ❯</span>
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex) / questions.length) * 100);

  // Advance to next question immediately
  const advanceToNext = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate true score: strictly the count of true answers from answersRef!
      const correctScore = Object.values(answersRef.current).filter(Boolean).length;
      onCompleteQuiz(correctScore, questions.length);
    }
  };

  // Directly evaluate selected option on tap and auto-advance
  const handleSelectOption = (optId: string) => {
    if (isChecked) return;

    setSelectedOptionId(optId);
    const chosen = currentQ.options.find((o) => o.id === optId);
    const correct = Boolean(chosen?.isCorrect);

    setIsChecked(true);
    setIsCorrect(correct);

    answersRef.current[currentIndex] = correct;
    setAnswersMap({ ...answersRef.current });

    if (correct) {
      sound.playCorrect();
      onAddXp(15);
    } else {
      sound.playWrong();
    }

    // Auto-advance directly if enabled!
    if (autoAdvance) {
      autoAdvanceTimerRef.current = setTimeout(() => {
        advanceToNext();
      }, 1250); // 1.25s pause so the user sees the green/red result
    }
  };

  const handlePauseAutoAdvanceToRead = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    setShowExplanation(true);
  };

  const handleManualNext = () => {
    advanceToNext();
  };

  const handlePlayRecitation = async () => {
    if (isPlayingAudio) {
      recitationService.stop();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    await recitationService.playAyah(
      currentQ.surahNumber,
      currentQ.ayahNumber,
      progress.voiceReciter,
      (playing) => setIsPlayingAudio(playing)
    );
  };

  return (
    <div className="max-w-xl mx-auto py-3 sm:py-5 px-3 sm:px-4 pb-20 font-arabic" dir="rtl">
      {/* Top Header Controls: Compact & Responsive */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <button
          onClick={onOpenSurahSelector}
          className="px-2.5 py-1 rounded-lg bg-stone-200/90 hover:bg-stone-300 text-stone-800 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
          title="تغيير واختيار سور أخرى"
        >
          <RefreshCw className="w-3 h-3" />
          <span>تغيير السور ({progress.selectedSurahIds.length})</span>
        </button>

        {/* Auto advance toggle & question count */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 border ${
              autoAdvance
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-stone-100 text-stone-600 border-stone-200'
            }`}
            title="الانتقال التلقائي للسؤال التالي بعد الإجابة مباشرة"
          >
            <span>انطلاق تلقائي:</span>
            <span className="font-extrabold">{autoAdvance ? 'مفعّل ✓' : 'يدوي'}</span>
          </button>

          <span className="text-[11px] font-black text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200 tabular-nums">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-stone-200 h-1.5 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Surah Reference Tag */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-xs font-black text-emerald-800">
          سورة {currentQ.surahName} · الآية {currentQ.ayahNumber}
        </span>
        {currentQ.comparisonSurahName && (
          <span className="text-[11px] text-stone-500">
            مقابل: سورة {currentQ.comparisonSurahName} ({currentQ.comparisonAyahNumber})
          </span>
        )}
      </div>

      {/* Main Question Card - Compact & Clean */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5 mb-3">
        {/* The Question Prompt */}
        <h2 className="text-base sm:text-lg font-black text-stone-900 mb-3 leading-relaxed text-right">
          {currentQ.promptArabic || currentQ.prompt}
        </h2>

        {/* Verse Display */}
        <div className="bg-amber-50/70 rounded-xl p-3.5 sm:p-4 border border-amber-200/80 mb-2">
          <p
            className="font-quran text-xl sm:text-2xl text-stone-900 leading-loose text-center select-none"
            dir="rtl"
          >
            {currentQ.verseSnippet}
          </p>

          {/* Audio Recitation Button */}
          <div className="flex items-center justify-center mt-2.5 pt-2 border-t border-amber-200/50">
            <button
              onClick={handlePlayRecitation}
              className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce text-emerald-600' : ''}`} />
              <span>{isPlayingAudio ? 'جارٍ الاستماع...' : '🔊 استمع للتلاوة'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Authentic Quranic Options */}
      <div className="space-y-2.5 mb-4">
        <div className="text-[11px] font-bold text-stone-500 px-1">
          اختر اللفظ الصحيح في هذا الموضع:
        </div>

        {currentQ.options.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const arabicLetters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];
          const letter = arabicLetters[idx] || `${idx + 1}`;

          // Separate pure Quranic text from any parenthetical book reference
          const cleanQuranText = option.text.replace(/\s*\(.*?\)\s*/g, '').trim();
          const hint = option.text.match(/\((.*?)\)/)?.[1];

          let optionStyle = 'bg-white border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-stone-900';

          if (isChecked) {
            if (option.isCorrect) {
              optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400/50';
            } else if (isSelected && !option.isCorrect) {
              optionStyle = 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-400/40';
            } else {
              optionStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
            }
          }

          return (
            <button
              key={option.id}
              disabled={isChecked}
              onClick={() => handleSelectOption(option.id)}
              className={`w-full p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between text-right shadow-xs select-none ${optionStyle}`}
            >
              <div className="flex-1 text-right">
                <span className="font-quran text-lg sm:text-xl font-bold block" dir="rtl">
                  {cleanQuranText}
                </span>
                {hint && (
                  <span className="inline-block text-[11px] font-sans text-stone-600 font-medium mt-1 bg-stone-100/90 px-2 py-0.5 rounded border border-stone-200">
                    {hint}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mr-3 shrink-0">
                {isChecked && option.isCorrect && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                {isChecked && isSelected && !option.isCorrect && (
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center">
                    <X className="w-3.5 h-3.5" />
                  </div>
                )}
                {!isChecked && (
                  <span className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center text-[11px] font-bold text-stone-500 tabular-nums">
                    {letter}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Immediate Result Card */}
      {isChecked && (
        <div className="animate-fadeIn space-y-3 mb-6">
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <div className="text-right">
                <div className="text-xs font-black">
                  {isCorrect ? 'أحسنت! إجابة صحيحة ومتقنة' : 'إجابة تحتاج لمراجعة'}
                </div>
                <div className="text-[11px] opacity-80">
                  {isCorrect ? '+15 نقطة إتقان' : 'تأمل الضابط والموضع المقابل أدناه'}
                </div>
              </div>
            </div>

            {/* Manual next button in case auto-advance paused */}
            <button
              onClick={handleManualNext}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span>{currentIndex + 1 === questions.length ? 'إنهاء التدريب' : 'التالي ❯'}</span>
            </button>
          </div>

          {/* Reconstructed Full Verse Preview */}
          <div className="p-3 bg-stone-100/80 rounded-xl border border-stone-200/90 text-right">
            <div className="text-[11px] font-bold text-emerald-800 mb-1 flex items-center gap-1">
              <span>📖</span>
              <span>الآية الكريمة مكتملة:</span>
            </div>
            <p className="font-quran text-lg sm:text-xl text-stone-900 leading-loose" dir="rtl">
              ﴿ {currentQ.verseSnippet.replace('[___]', currentQ.options.find(o => o.isCorrect)?.text.replace(/\s*\(.*?\)\s*/g, '').trim() || '')} ﴾
            </p>
          </div>

          {/* Explanation Button & Difference Note */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-right">
            <div className="text-xs text-stone-700 font-medium">
              <span className="font-bold text-stone-900">الضابط القرآني: </span>
              <span>{currentQ.exactDifferenceNote}</span>
            </div>
            <button
              onClick={handlePauseAutoAdvanceToRead}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 border border-stone-300 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0"
              title="عرض وتلوين الفارق كاملاً"
            >
              <Eye className="w-3 h-3 text-stone-600" />
              <span>تفصيل المقارنة</span>
            </button>
          </div>
        </div>
      )}

          {/* Expanded Difference & Colorized View (when user clicks explanation) */}
          {showExplanation && (
            <div className="animate-fadeIn">
              <DifferenceViewer question={currentQ} />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleManualNext}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md"
                >
                  <span>متابعة للسؤال التالي ❯</span>
                </button>
              </div>
            </div>
          )}
    </div>
  );
};

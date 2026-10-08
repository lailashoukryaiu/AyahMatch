import React, { useState } from 'react';
import { Volume2, CheckCircle, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';
import { MutashabihaQuestion } from '../types.ts';
import { recitationService } from '../services/audioRecitationService.ts';

interface DifferenceViewerProps {
  question: MutashabihaQuestion;
}

export const DifferenceViewer: React.FC<DifferenceViewerProps> = ({ question }) => {
  const [playingTarget, setPlayingTarget] = useState(false);
  const [playingComp, setPlayingComp] = useState(false);

  const handlePlayTarget = async () => {
    if (playingTarget) {
      recitationService.stop();
      setPlayingTarget(false);
      return;
    }
    recitationService.stop();
    setPlayingComp(false);
    setPlayingTarget(true);
    await recitationService.playAyah(question.surahNumber, question.ayahNumber, 'alafasy', (state) => {
      setPlayingTarget(state);
    });
  };

  const handlePlayComparison = async () => {
    if (!question.comparisonSurahNumber || !question.comparisonAyahNumber) return;
    if (playingComp) {
      recitationService.stop();
      setPlayingComp(false);
      return;
    }
    recitationService.stop();
    setPlayingTarget(false);
    setPlayingComp(true);
    await recitationService.playAyah(
      question.comparisonSurahNumber,
      question.comparisonAyahNumber,
      'alafasy',
      (state) => {
        setPlayingComp(state);
      }
    );
  };

  // Find target highlight phrase and comparison highlight phrase
  const targetHighlight = question.options.find((o) => o.isCorrect)?.highlightPart || '';
  const compHighlight = question.options.find((o) => !o.isCorrect)?.highlightPart || '';

  // Helper to remove Arabic diacritics for flexible matching
  const stripDiacritics = (str: string) => {
    return str.replace(/[\u064B-\u0652\u0670\u0640]/g, '').trim();
  };

  // Render verse text highlighting the differing word/phrase with a distinct colored badge
  const renderHighlightedVerse = (verse: string, highlightText: string, isTarget: boolean) => {
    if (!highlightText) {
      return <span>{verse}</span>;
    }

    // Clean brackets/labels/annotations
    const cleanWord = highlightText.split('(')[0].replace(/[«»\[\]]/g, '').trim();

    if (!cleanWord) {
      return <span>{verse}</span>;
    }

    // Attempt direct exact index
    let index = verse.indexOf(cleanWord);
    let matchLen = cleanWord.length;

    // Fallback: Diacritic-agnostic matching if exact not found
    if (index === -1) {
      const strippedVerse = stripDiacritics(verse);
      const strippedWord = stripDiacritics(cleanWord);
      const strippedIdx = strippedVerse.indexOf(strippedWord);

      if (strippedIdx !== -1) {
        // Map back to original verse indices
        let origIdx = 0;
        let sCount = 0;
        while (origIdx < verse.length && sCount < strippedIdx) {
          if (!/[\u064B-\u0652\u0670\u0640]/.test(verse[origIdx])) {
            sCount++;
          }
          origIdx++;
        }
        index = origIdx;

        let endIdx = origIdx;
        let matchCount = 0;
        while (endIdx < verse.length && matchCount < strippedWord.length) {
          if (!/[\u064B-\u0652\u0670\u0640]/.test(verse[endIdx])) {
            matchCount++;
          }
          endIdx++;
        }
        matchLen = Math.max(1, endIdx - origIdx);
      }
    }

    if (index === -1) {
      return <span>{verse}</span>;
    }

    const before = verse.slice(0, index);
    const match = verse.slice(index, index + matchLen);
    const after = verse.slice(index + matchLen);

    return (
      <span>
        {before && <span className="text-stone-800 bg-sky-50/90 px-1 rounded">{before}</span>}
        <mark
          className={`px-2 py-0.5 rounded-lg mx-1 inline-block ${
            isTarget
              ? 'bg-emerald-200 text-emerald-950 border border-emerald-600 font-extrabold shadow-2xs'
              : 'bg-amber-200 text-amber-950 border border-amber-600 font-extrabold shadow-2xs'
          }`}
        >
          {match}
        </mark>
        {after && <span className="text-stone-800 bg-sky-50/90 px-1 rounded">{after}</span>}
      </span>
    );
  };

  return (
    <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 sm:p-5 my-4 font-arabic" dir="rtl">
      {/* Visual Difference Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
            مقارنة المتشابه وتلوين موضع الاختلاف
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-bold">
          <span className="flex items-center gap-1 text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <span>الجزء المتماثل المشترك (أزرق)</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>لفظ هذا الموضع (أخضر)</span>
          </span>
          <span className="flex items-center gap-1 text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>الموضع المقابل (برتقالي)</span>
          </span>
        </div>
      </div>

      {/* Side-by-side or stacked Verse Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Correct Target Verse */}
        <div className="p-3.5 bg-emerald-50/70 border-2 border-emerald-300 rounded-xl relative">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-emerald-200/60">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              سورة {question.surahName} [الآية {question.ayahNumber}]
            </span>
            <button
              onClick={handlePlayTarget}
              className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              title="استمع لتلاوة الآية"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{playingTarget ? 'جارٍ التلاوة...' : '🔊 تلاوة'}</span>
            </button>
          </div>

          <p className="font-quran text-lg sm:text-xl text-stone-900 leading-loose text-right" dir="rtl">
            {renderHighlightedVerse(question.fullVerseArabic, targetHighlight, true)}
          </p>
        </div>

        {/* Similar / Comparison Verse */}
        {question.comparisonVerseArabic && (
          <div className="p-3.5 bg-amber-50/70 border-2 border-amber-300 rounded-xl relative">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-amber-200/60">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                الموضع الشبيه: سورة {question.comparisonSurahName || question.surahName} [الآية {question.comparisonAyahNumber}]
              </span>
              {question.comparisonSurahNumber && question.comparisonAyahNumber && (
                <button
                  onClick={handlePlayComparison}
                  className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                  title="استمع للموضع الشبيه"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{playingComp ? 'جارٍ التلاوة...' : '🔊 تلاوة'}</span>
                </button>
              )}
            </div>

            <p className="font-quran text-lg sm:text-xl text-stone-900 leading-loose text-right" dir="rtl">
              {renderHighlightedVerse(question.comparisonVerseArabic, compHighlight, false)}
            </p>
          </div>
        )}
      </div>

      {/* Exact Difference Callout */}
      <div className="bg-white rounded-xl p-3.5 border border-stone-200 mb-3 shadow-2xs">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <span>الفارق الدقيق في الحفظ والتلاوة:</span>
        </div>
        <p className="text-sm font-bold text-stone-900 leading-relaxed text-right" dir="rtl">
          {question.exactDifferenceNote}
        </p>
      </div>

      {/* Mnemonic / Rule (قاعدة الضبط) */}
      <div className="bg-emerald-950 text-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold mb-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>ضابط الحفظ وقاعدة التوجيه (كيف تضبطها دون تردد):</span>
        </div>
        <p className="text-sm font-medium leading-relaxed text-emerald-50 text-right" dir="rtl">
          {question.explanation}
        </p>
      </div>
    </div>
  );
};

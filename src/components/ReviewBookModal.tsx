import React, { useState, useMemo } from 'react';
import { BookOpen, Search, ArrowRight, BookCheck, Sparkles, Filter } from 'lucide-react';
import { MUTASHABIHAT_QUESTIONS } from '../data/mutashabihat.ts';
import { ALL_SURAHS } from '../data/surahs.ts';
import { DifferenceViewer } from './DifferenceViewer.tsx';

interface ReviewBookModalProps {
  onPracticeSurah: (surahNumber: number) => void;
}

export const ReviewBookModal: React.FC<ReviewBookModalProps> = ({
  onPracticeSurah,
}) => {
  const [selectedSurahFilter, setSelectedSurahFilter] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate count of entries per Surah (matching either target or comparison)
  const countBySurah = useMemo(() => {
    const map: Record<number, number> = {};
    MUTASHABIHAT_QUESTIONS.forEach((q) => {
      map[q.surahNumber] = (map[q.surahNumber] || 0) + 1;
      if (q.comparisonSurahNumber) {
        map[q.comparisonSurahNumber] = (map[q.comparisonSurahNumber] || 0) + 1;
      }
    });
    return map;
  }, []);

  const filteredQuestions = useMemo(() => {
    return MUTASHABIHAT_QUESTIONS.filter((q) => {
      // Check both target surah and comparison surah!
      if (
        selectedSurahFilter !== 'all' &&
        q.surahNumber !== selectedSurahFilter &&
        q.comparisonSurahNumber !== selectedSurahFilter
      ) {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        q.surahName.includes(term) ||
        (q.comparisonSurahName && q.comparisonSurahName.includes(term)) ||
        (q.promptArabic && q.promptArabic.includes(term)) ||
        q.fullVerseArabic.includes(term) ||
        (q.comparisonVerseArabic && q.comparisonVerseArabic.includes(term)) ||
        q.exactDifferenceNote.includes(term) ||
        q.explanation.includes(term)
      );
    });
  }, [selectedSurahFilter, searchTerm]);

  const selectedSurahObj = ALL_SURAHS.find((s) => s.number === selectedSurahFilter);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 font-arabic" dir="rtl">
      {/* Book Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                كتاب ضبط المتشابهات اللفظية
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 text-right">
              دليل موثق لضبط المتشابهات داخل السور وفيما بينها، مع بيان الفروق الدقيقة وقواعد الضبط والتوجيه لمنع الخلط والتردد.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-lg border border-emerald-200">
              {filteredQuestions.length} موضعاً معروضاً
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-stone-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بكلمة أو آية أو ضابط..."
              className="w-full pr-9 pl-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-right"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSurahFilter}
              onChange={(e) =>
                setSelectedSurahFilter(
                  e.target.value === 'all' ? 'all' : Number(e.target.value)
                )
              }
              className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-stone-700 cursor-pointer"
            >
              <option value="all">
                جميع السور في كتاب الضبط ({MUTASHABIHAT_QUESTIONS.length} موضعاً)
              </option>
              {ALL_SURAHS.map((s) => {
                const count = countBySurah[s.number] || 0;
                return (
                  <option key={s.number} value={s.number}>
                    سورة {s.name} {count > 0 ? `(${count} مواضع)` : '(0)'}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Guidebook Entries */}
      <div className="space-y-6">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm hover:border-emerald-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center tabular-nums">
                  {idx + 1}
                </span>
                <span className="font-extrabold text-stone-900 text-base">
                  سورة {q.surahName} (الآية {q.ayahNumber})
                </span>
                {q.comparisonSurahName && (
                  <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                    مقابل: سورة {q.comparisonSurahName} (الآية {q.comparisonAyahNumber})
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {q.questionType === 'single_letter'
                    ? '🎯 فارق حرف'
                    : q.questionType === 'single_word'
                    ? '📖 فارق كلمة'
                    : q.questionType === 'sequence_order'
                    ? '🔄 تقديم وتأخير'
                    : q.questionType === 'ayah_ending'
                    ? '🏁 فاصلة آية'
                    : '✨ فارق عبارة'}
                </span>
              </div>

              <button
                onClick={() => onPracticeSurah(q.surahNumber)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-lg transition-colors w-fit shadow-xs"
              >
                <span>تدرّب على هذه السورة</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            {/* Embedded interactive difference viewer */}
            <DifferenceViewer question={q} />
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
            <BookCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-stone-800 text-base mb-1">
              {selectedSurahObj
                ? `لم يُسجل موضع مباشر لسورة ${selectedSurahObj.name} في كتاب الضبط حالياً`
                : 'لا توجد مواضع مطابقة لبحثك'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              يمكنك تصفح جميع المواضع المسجلة في كتاب المتشابهات أو اختيار إحدى السور ذات المواضع الموثقة.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedSurahFilter('all');
                  setSearchTerm('');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                عرض جميع مواضع الكتاب ({MUTASHABIHAT_QUESTIONS.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

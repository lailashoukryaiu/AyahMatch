import React, { useState, useMemo } from 'react';
import { Search, Volume2, BookOpen, Sparkles, ArrowRight, CheckCircle, AlertTriangle, Layers } from 'lucide-react';
import { MUTASHABIHAT_QUESTIONS } from '../data/mutashabihat.ts';
import { DifferenceViewer } from './DifferenceViewer.tsx';

interface AyahSimilaritySearchProps {
  onPracticeSurah: (surahNumber: number) => void;
}

export const AyahSimilaritySearch: React.FC<AyahSimilaritySearchProps> = ({
  onPracticeSurah,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Quick chips for popular mutashabihat
  const POPULAR_SEARCHES = [
    'تستطع وتسطع',
    'فلا خوف عليهم',
    'ادخلوا هذه القرية',
    'قولوا آمنا',
    'تجري تحتها الأنهار',
    'عينان تجريان',
    'عن صلاتهم ساهون',
    'وما أهل به لغير الله',
    'الشفاعة والعدل',
    'لا أعبد ما تعبدون',
  ];

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return MUTASHABIHAT_QUESTIONS;

    return MUTASHABIHAT_QUESTIONS.filter((q) => {
      return (
        q.fullVerseArabic.includes(term) ||
        (q.comparisonVerseArabic && q.comparisonVerseArabic.includes(term)) ||
        q.verseSnippet.includes(term) ||
        q.exactDifferenceNote.includes(term) ||
        q.explanation.includes(term) ||
        q.surahName.includes(term) ||
        (q.comparisonSurahName && q.comparisonSurahName.includes(term)) ||
        q.promptArabic.includes(term)
      );
    });
  }, [searchTerm]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4" dir="rtl">
      {/* Search Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm mb-6 font-arabic">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            البحث في متشابهات أي آية
          </h1>
        </div>
        <p className="text-sm text-stone-600 mb-5">
          اكتب أي كلمة أو عبارة من الآية للبحث عن جميع المواضع القرآنية المتشابهة معها ومعرفة الفارق الدقيق بينها.
        </p>

        {/* Search Input Box */}
        <div className="relative mb-4">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بكلمة أو جزء من آية (مثال: خوف عليهم، تستطع، تجري تحتها، ادخلوا)..."
            className="w-full pr-12 pl-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-base font-arabic focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-right"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700 bg-stone-200 px-2 py-1 rounded-md cursor-pointer"
            >
              مسح
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <label className="text-xs font-bold text-stone-500 block mb-2">
            مواضع شائعة ومشكوك فيها:
          </label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((item) => (
              <button
                key={item}
                onClick={() => setSearchTerm(item)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  searchTerm === item
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4 font-arabic">
        <h2 className="text-base font-black text-stone-900">
          المواضع المتشابهة ({searchResults.length})
        </h2>
        {searchTerm && (
          <span className="text-xs text-stone-500">
            نتائج البحث عن: «{searchTerm}»
          </span>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-6">
        {searchResults.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm hover:border-emerald-300 transition-colors font-arabic"
          >
            {/* Top row with Surah tags and action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center tabular-nums">
                  {idx + 1}
                </span>
                <span className="font-extrabold text-stone-900 text-base">
                  سورة {q.surahName} (الآية {q.ayahNumber})
                </span>
                {q.comparisonSurahName && (
                  <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
                    الموضع الشبيه: سورة {q.comparisonSurahName} (الآية {q.comparisonAyahNumber})
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
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
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-colors w-fit shadow-xs"
              >
                <span>تدرّب على هذا الموضع</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            {/* Embedded interactive difference viewer */}
            <DifferenceViewer question={q} />
          </div>
        ))}

        {searchResults.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 font-arabic">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-stone-800 text-base mb-1">
              لم نعثر على آية مطابقة لبحثك
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              جرّب البحث بكلمة أقل أو اضغط على أحد الاقتراحات السريعة بالأعلى.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold cursor-pointer"
            >
              عرض جميع المواضع المتشابهة
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, Circle, RefreshCw, Check, X, Layers, BookOpen, SlidersHorizontal } from 'lucide-react';
import { ALL_SURAHS, JUZ_MAPPINGS, QURAN_PARTITIONS } from '../data/surahs.ts';
import { MUTASHABIHAT_QUESTIONS } from '../data/mutashabihat.ts';
import { QuestionType } from '../types.ts';

interface SurahSelectorProps {
  selectedSurahIds: number[];
  onChangeSelected: (ids: number[]) => void;
  selectedQuestionTypes: QuestionType[];
  onChangeQuestionTypes: (types: QuestionType[]) => void;
  comparisonScope: 'internal_only' | 'all_quran';
  onChangeComparisonScope: (scope: 'internal_only' | 'all_quran') => void;
  onStartQuiz: (ids?: number[], types?: QuestionType[], scope?: 'internal_only' | 'all_quran') => void;
}

const QUESTION_TYPE_OPTIONS: { id: QuestionType; label: string; icon: string }[] = [
  { id: 'single_letter', label: 'حرف واحد', icon: '🎯' },
  { id: 'single_word', label: 'كلمة واحدة', icon: '📖' },
  { id: 'phrase_diff', label: 'عبارة وتراكيب', icon: '✨' },
  { id: 'sequence_order', label: 'تقديم وتأخير', icon: '🔄' },
  { id: 'ayah_ending', label: 'فواصل وخواتيم', icon: '🏁' },
];

export const SurahSelector: React.FC<SurahSelectorProps> = ({
  selectedSurahIds,
  onChangeSelected,
  selectedQuestionTypes,
  onChangeQuestionTypes,
  comparisonScope,
  onChangeComparisonScope,
  onStartQuiz,
}) => {
  const [activeMode, setActiveMode] = useState<'partitions' | 'juz' | 'surahs'>('surahs');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Count available questions based on comparisonScope
  const countMatches = (surahIds: number[], scope: 'internal_only' | 'all_quran') => {
    return MUTASHABIHAT_QUESTIONS.filter((q) => {
      if (!selectedQuestionTypes.includes(q.questionType)) return false;

      if (scope === 'internal_only') {
        if (surahIds.length === 1) {
          return q.surahNumber === surahIds[0] && (!q.comparisonSurahNumber || q.comparisonSurahNumber === surahIds[0]);
        }
        return surahIds.includes(q.surahNumber) && (!q.comparisonSurahNumber || surahIds.includes(q.comparisonSurahNumber));
      } else {
        return surahIds.includes(q.surahNumber) || (q.comparisonSurahNumber && surahIds.includes(q.comparisonSurahNumber));
      }
    }).length;
  };

  const totalSelectedQuestions = useMemo(() => {
    return countMatches(selectedSurahIds, comparisonScope);
  }, [selectedSurahIds, selectedQuestionTypes, comparisonScope]);

  const filteredSurahs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return ALL_SURAHS;
    return ALL_SURAHS.filter((s) => {
      return (
        s.name.includes(term) ||
        s.englishName.toLowerCase().includes(term) ||
        String(s.number).includes(term)
      );
    });
  }, [searchTerm]);

  const toggleSurah = (surahNumber: number) => {
    if (selectedSurahIds.includes(surahNumber)) {
      onChangeSelected(selectedSurahIds.filter((id) => id !== surahNumber));
    } else {
      onChangeSelected([...selectedSurahIds, surahNumber]);
    }
  };

  const selectOnlyThisSurah = (surahNumber: number) => {
    onChangeSelected([surahNumber]);
  };

  const toggleQuestionType = (type: QuestionType) => {
    if (selectedQuestionTypes.includes(type)) {
      if (selectedQuestionTypes.length === 1) return; // Keep at least one
      onChangeQuestionTypes(selectedQuestionTypes.filter((t) => t !== type));
    } else {
      onChangeQuestionTypes([...selectedQuestionTypes, type]);
    }
  };

  const handleSelectAll = () => {
    onChangeSelected(ALL_SURAHS.map((s) => s.number));
  };

  const handleDeselectAll = () => {
    onChangeSelected([]);
  };

  const handleSelectJuz = (juzNumber: number, exclusive = false) => {
    const juzObj = JUZ_MAPPINGS.find((j) => j.number === juzNumber);
    if (!juzObj) return;

    if (exclusive) {
      onChangeSelected(juzObj.surahIds);
      return;
    }

    const allSelected = juzObj.surahIds.every((id) => selectedSurahIds.includes(id));
    if (allSelected) {
      onChangeSelected(selectedSurahIds.filter((id) => !juzObj.surahIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedSurahIds, ...juzObj.surahIds]));
      onChangeSelected(merged);
    }
  };

  const handleSelectPartition = (surahIds: number[], exclusive = false) => {
    if (exclusive) {
      onChangeSelected(surahIds);
      return;
    }
    const allSelected = surahIds.every((id) => selectedSurahIds.includes(id));
    if (allSelected) {
      onChangeSelected(selectedSurahIds.filter((id) => !surahIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedSurahIds, ...surahIds]));
      onChangeSelected(merged);
    }
  };

  const handleStartNow = () => {
    onStartQuiz(selectedSurahIds, selectedQuestionTypes, comparisonScope);
  };

  return (
    <div className="max-w-3xl mx-auto py-3 sm:py-5 px-3 sm:px-4 pb-24 font-arabic" dir="rtl">
      {/* Launch Banner - Compact & Mobile Friendly */}
      <div className="bg-emerald-50 border border-emerald-400 rounded-2xl p-3 sm:p-4 mb-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-black text-emerald-950 flex items-center gap-2">
              <span>
                المحدد: <span className="font-extrabold text-base underline decoration-emerald-500">{selectedSurahIds.length}</span> سورة
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-emerald-800">
                <span className="font-extrabold text-base">{totalSelectedQuestions}</span> موضع للتدريب
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              {comparisonScope === 'internal_only'
                ? selectedSurahIds.length === 1
                  ? 'النطاق: متشابهات داخل السورة المحددة فقط (مع نفسها).'
                  : 'النطاق: متشابهات داخل السور المحددة أو فيما بينها فقط.'
                : 'النطاق: تشمل المقارنة مع سائر سور القرآن.'}
            </p>
          </div>

          <button
            disabled={totalSelectedQuestions === 0}
            onClick={handleStartNow}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              totalSelectedQuestions > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ابدأ التدريب الآن ({totalSelectedQuestions}) 🚀</span>
          </button>
        </div>
      </div>

      {/* Scope Option Card: Internal vs All Quran (Important User Request) */}
      <div className="bg-white rounded-xl border border-stone-200 p-3 mb-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-black text-stone-800">
            نطاق المقارنة المطلوب:
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg">
            <button
              onClick={() => onChangeComparisonScope('internal_only')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                comparisonScope === 'internal_only'
                  ? 'bg-white text-emerald-900 shadow-2xs font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="إذا اخترت سورة واحدة يظهر فقط تشابهها مع نفسها، وإذا اخترت سورتين يظهر فقط ما بينهما"
            >
              داخل السور المحددة فقط (متشابه داخلي)
            </button>

            <button
              onClick={() => onChangeComparisonScope('all_quran')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                comparisonScope === 'all_quran'
                  ? 'bg-white text-emerald-900 shadow-2xs font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              مع كل سور القرآن
            </button>
          </div>
        </div>

        {/* Collapsible Question Types filter */}
        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-[11px] font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>تخصيص أنواع المتشابه ({selectedQuestionTypes.length})</span>
          </button>

          {showAdvancedFilters && (
            <div className="w-full flex flex-wrap gap-1.5 pt-1">
              {QUESTION_TYPE_OPTIONS.map((type) => {
                const isSelected = selectedQuestionTypes.includes(type.id);
                return (
                  <button
                    key={type.id}
                    onClick={() => toggleQuestionType(type.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                    {isSelected && <Check className="w-3 h-3 mr-0.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mode Switcher: قائمة السور (114) | الأقسام | الأجزاء */}
      <div className="flex items-center p-1 bg-stone-100 rounded-xl mb-3">
        <button
          onClick={() => setActiveMode('surahs')}
          className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
            activeMode === 'surahs'
              ? 'bg-white text-emerald-950 shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          قائمة السور (114)
        </button>
        <button
          onClick={() => setActiveMode('partitions')}
          className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
            activeMode === 'partitions'
              ? 'bg-white text-emerald-950 shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          أرباع وأقسام القرآن
        </button>
        <button
          onClick={() => setActiveMode('juz')}
          className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
            activeMode === 'juz'
              ? 'bg-white text-emerald-950 shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          الأجزاء (1 – 30)
        </button>
      </div>

      {/* Mode 1: Individual Surahs (1 - 114) with CLEAR & ADJACENT Deselect/Select All */}
      {activeMode === 'surahs' && (
        <div className="space-y-2.5">
          {/* Action Row DIRECTLY adjacent to Surahs grid */}
          <div className="bg-white rounded-xl border border-stone-200 p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
            {/* Quick Action Buttons placed right where the user looks! */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleDeselectAll}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>إلغاء تحديد الكل</span>
              </button>
              <button
                onClick={handleSelectAll}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>تحديد كل السور</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن اسم السورة..."
                className="w-full pr-8 pl-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right"
              />
            </div>
          </div>

          {/* Surahs Grid: Compact & Mobile-Optimized */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2">
            {filteredSurahs.map((surah) => {
              const isSelected = selectedSurahIds.includes(surah.number);

              return (
                <div
                  key={surah.number}
                  className={`p-2 rounded-xl border text-right transition-all flex items-center justify-between gap-1 select-none ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/80 font-bold text-emerald-950 shadow-2xs'
                      : 'border-stone-200 bg-white hover:border-emerald-300 text-stone-800'
                  }`}
                >
                  <button
                    onClick={() => toggleSurah(surah.number)}
                    className="flex-1 flex items-center gap-1.5 cursor-pointer text-right min-w-0"
                  >
                    <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold flex items-center justify-center shrink-0 tabular-nums">
                      {surah.number}
                    </span>

                    <span className="text-xs truncate">
                      سورة {surah.name}
                    </span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => selectOnlyThisSurah(surah.number)}
                      title="تدريب هذه السورة وحدها فقط"
                      className="text-[10px] font-bold text-stone-500 hover:text-emerald-700 bg-stone-100 hover:bg-emerald-100 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      فقط
                    </button>
                    <button
                      onClick={() => toggleSurah(surah.number)}
                      className="cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-300" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Major Quran Partitions */}
      {activeMode === 'partitions' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {QURAN_PARTITIONS.map((part) => {
              const allSelected = part.surahIds.every((id) => selectedSurahIds.includes(id));
              const someSelected = part.surahIds.some((id) => selectedSurahIds.includes(id));

              return (
                <div
                  key={part.id}
                  className={`p-3 rounded-xl border transition-all text-right ${
                    allSelected
                      ? 'border-emerald-500 bg-emerald-50/80 shadow-2xs'
                      : someSelected
                      ? 'border-amber-400 bg-amber-50/40'
                      : 'border-stone-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div>
                      <h3 className="font-black text-stone-900 text-xs">
                        {part.title}
                      </h3>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        {part.description}
                      </p>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                      {part.surahIds.length} سورة
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-stone-100 gap-2">
                    <button
                      onClick={() => handleSelectPartition(part.surahIds, true)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                    >
                      تحديد هذا فقط
                    </button>

                    <button
                      onClick={() => handleSelectPartition(part.surahIds, false)}
                      className="px-2.5 py-1 rounded-lg border border-stone-300 text-stone-700 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                    >
                      {allSelected ? 'إلغاء الإضافة' : 'إضافة للتحديد'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 3: By Juz (1 - 30) */}
      {activeMode === 'juz' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {JUZ_MAPPINGS.map((juz) => {
              const allSelected = juz.surahIds.every((id) => selectedSurahIds.includes(id));
              const someSelected = juz.surahIds.some((id) => selectedSurahIds.includes(id));

              return (
                <div
                  key={juz.number}
                  className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    allSelected
                      ? 'border-emerald-500 bg-emerald-50/80 shadow-2xs'
                      : someSelected
                      ? 'border-amber-400 bg-amber-50/40'
                      : 'border-stone-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-extrabold text-stone-900 text-xs">
                      {juz.name}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {juz.surahIds.length} سورة
                    </span>
                  </div>

                  <div className="flex items-center gap-1 pt-1.5 border-t border-stone-100">
                    <button
                      onClick={() => handleSelectJuz(juz.number, true)}
                      className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer text-center"
                    >
                      فقط
                    </button>
                    <button
                      onClick={() => handleSelectJuz(juz.number, false)}
                      className="px-2 py-1 rounded border border-stone-300 text-stone-700 text-[10px] font-bold cursor-pointer"
                    >
                      {allSelected ? '✓' : '+'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

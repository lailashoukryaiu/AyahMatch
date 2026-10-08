import React from 'react';
import { Flame, Sparkles, Volume2, VolumeX, ShieldCheck, Search } from 'lucide-react';
import { UserProgress } from '../types.ts';

interface HeaderProps {
  progress: UserProgress;
  onToggleSound: () => void;
  activeTab: 'surahs' | 'quiz' | 'search' | 'book' | 'stats';
  setActiveTab: (tab: 'surahs' | 'quiz' | 'search' | 'book' | 'stats') => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  onToggleSound,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between font-arabic" dir="rtl">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('surahs')}
            className="flex items-center gap-2.5 group text-right cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-xs group-hover:bg-emerald-700 transition-colors">
              ح
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-stone-900 group-hover:text-emerald-700 transition-colors">
                حافِظ
              </span>
              <span className="text-[11px] text-stone-500 block -mt-1 font-arabic">
                مُتَشَابِهَاتُ القُرْآنِ الكَرِيم
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-stone-600">
          <button
            onClick={() => setActiveTab('surahs')}
            className={`transition-colors cursor-pointer py-1 ${
              activeTab === 'surahs'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'hover:text-stone-900'
            }`}
          >
            تحديد النطاق ({progress.selectedSurahIds.length} سورة)
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`transition-colors cursor-pointer py-1 ${
              activeTab === 'quiz'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'hover:text-stone-900'
            }`}
          >
            التدريب
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'hover:text-stone-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>البحث في المتشابهات</span>
          </button>
          <button
            onClick={() => setActiveTab('book')}
            className={`transition-colors cursor-pointer py-1 ${
              activeTab === 'book'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'hover:text-stone-900'
            }`}
          >
            كتاب المتشابهات
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`transition-colors cursor-pointer py-1 ${
              activeTab === 'stats'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'hover:text-stone-900'
            }`}
          >
            الإنجازات
          </button>
        </nav>

        {/* Gamified Stats (No confusing hearts!) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Daily Streak */}
          <div className="flex items-center gap-1.5 text-orange-600 font-extrabold text-sm" title="أيام التتابع">
            <Flame className="w-5 h-5 fill-orange-500 text-orange-600 animate-pulse" />
            <span className="tabular-nums">{progress.currentStreak}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 text-amber-600 font-extrabold text-sm" title="نقاط وياقوتات الإتقان">
            <Sparkles className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span className="tabular-nums">{progress.gems}</span>
          </div>

          {/* Mastered Verses */}
          <div className="hidden sm:flex items-center gap-1.5 text-emerald-700 font-extrabold text-sm" title="مواضع مضبوطة تماماً">
            <ShieldCheck className="w-4 h-4" />
            <span className="tabular-nums">{progress.masteredVersesCount}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
            title={progress.soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            aria-label="تبديل الصوت"
          >
            {progress.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-stone-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex md:hidden border-t border-stone-200 px-1 py-2 bg-stone-50 justify-around text-xs font-bold font-arabic" dir="rtl">
        <button
          onClick={() => setActiveTab('surahs')}
          className={`py-1 px-2 rounded-lg ${activeTab === 'surahs' ? 'bg-emerald-100 text-emerald-900 font-black' : 'text-stone-600'}`}
        >
          النطاق
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`py-1 px-2 rounded-lg ${activeTab === 'quiz' ? 'bg-emerald-100 text-emerald-900 font-black' : 'text-stone-600'}`}
        >
          التدريب
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`py-1 px-2 rounded-lg ${activeTab === 'search' ? 'bg-emerald-100 text-emerald-900 font-black' : 'text-stone-600'}`}
        >
          بحث
        </button>
        <button
          onClick={() => setActiveTab('book')}
          className={`py-1 px-2 rounded-lg ${activeTab === 'book' ? 'bg-emerald-100 text-emerald-900 font-black' : 'text-stone-600'}`}
        >
          الكتاب
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`py-1 px-2 rounded-lg ${activeTab === 'stats' ? 'bg-emerald-100 text-emerald-900 font-black' : 'text-stone-600'}`}
        >
          الإنجازات
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { Flame, Sparkles, Award, ShieldCheck, Volume2, RotateCcw } from 'lucide-react';
import { UserProgress } from '../types.ts';
import { RECITERS, ReciterId } from '../services/audioRecitationService.ts';

interface StatsViewProps {
  progress: UserProgress;
  onUpdateProgress: (updated: Partial<UserProgress>) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const BADGES = [
    {
      id: 'first_quiz',
      title: 'الخطوة الأولى في التثبيت',
      description: 'أتممت أول جلسة في تمييز المتشابهات اللفظية بنجاح.',
      unlocked: progress.completedQuizzes >= 1,
      icon: '🌱',
    },
    {
      id: 'streak_3',
      title: 'همّة الحافظ المستمرة',
      description: 'حافظت على حماسك وتدريبك لمدة 3 أيام متتالية.',
      unlocked: progress.currentStreak >= 3,
      icon: '🔥',
    },
    {
      id: 'letter_master',
      title: 'حارس الحرف الواحد',
      description: 'أجبت عن أسئلة المتشابهات ذات الفارق بحرف واحد بدقة تامة.',
      unlocked: progress.masteredVersesCount >= 5,
      icon: '🎯',
    },
    {
      id: 'quiz_master',
      title: 'بطل متشابهات القرآن',
      description: 'أتممت 10 جلسات تدريبية متقنة دون أي خلط أو تردد في الآيات.',
      unlocked: progress.completedQuizzes >= 10,
      icon: '👑',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 font-arabic" dir="rtl">
      {/* Top Banner with Trophy */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-6">
        <img
          src="/src/assets/images/trophy_quran_star_1791381460241.jpg"
          alt="وسام نجمة القرآن"
          className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-300 shadow-md bg-amber-50"
        />
        <div className="flex-1 text-center sm:text-right">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
              رتبة الحافظ: مُتقن في طريق الرسوخ
            </span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            سجل إنجازاتك في ضبط المتشابهات
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            «خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ» · ضبط المتشابهات يعصم اللسان من الزلل ويثبت الحفظ في الصدور.
          </p>
        </div>
      </div>

      {/* Gamified Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl border border-stone-200 text-center shadow-xs">
          <Flame className="w-6 h-6 text-orange-500 fill-orange-500 mx-auto mb-1" />
          <div className="text-2xl font-black text-stone-900 tabular-nums">
            {progress.currentStreak}
          </div>
          <div className="text-xs font-bold text-stone-500">أيام متتالية 🔥</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 text-center shadow-xs">
          <Sparkles className="w-6 h-6 text-amber-500 fill-amber-400 mx-auto mb-1" />
          <div className="text-2xl font-black text-stone-900 tabular-nums">
            {progress.totalXp}
          </div>
          <div className="text-xs font-bold text-stone-500">نقاط الخبرة</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 text-center shadow-xs">
          <Award className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
          <div className="text-2xl font-black text-stone-900 tabular-nums">
            {progress.completedQuizzes}
          </div>
          <div className="text-xs font-bold text-stone-500">جلسات تدريب مكتملة</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 text-center shadow-xs">
          <ShieldCheck className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <div className="text-2xl font-black text-stone-900 tabular-nums">
            {progress.masteredVersesCount}
          </div>
          <div className="text-xs font-bold text-stone-500">آيات مضبوطة تماماً</div>
        </div>
      </div>

      {/* Settings & Voice Reciter Selection */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-emerald-600" />
          <span>إعدادات التلاوة الصوتية</span>
        </h2>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
            القارئ الصوتي لتلاوة الآيات المشتبهة:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(Object.keys(RECITERS) as ReciterId[]).map((reciterId) => {
              const reciter = RECITERS[reciterId];
              const isSelected = progress.voiceReciter === reciterId;
              return (
                <button
                  key={reciterId}
                  onClick={() => onUpdateProgress({ voiceReciter: reciterId })}
                  className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-950 ring-1 ring-emerald-400'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="text-sm font-bold">{reciter.nameArabic}</div>
                  <div className="text-xs text-stone-500">رواية حفص عن عاصم</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges and Milestones */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h2 className="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>أوسمة ورتب الحفظ المكتسبة</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BADGES.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
                b.unlocked
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-stone-50/70 border-stone-200 opacity-60'
              }`}
            >
              <div className="text-3xl">{b.icon}</div>
              <div>
                <div className="text-sm font-black text-stone-900">
                  {b.title}
                </div>
                <div className="text-xs text-stone-600 mt-0.5">{b.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

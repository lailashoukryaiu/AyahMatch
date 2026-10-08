import React, { useEffect } from 'react';
import { launchConfetti } from '../services/confetti.ts';
import { Sparkles, CheckCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { sound } from '../services/soundService.ts';

interface CompletionModalProps {
  score: number;
  total: number;
  onPlayAgain: () => void;
  onSelectSurahs: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  score,
  total,
  onPlayAgain,
  onSelectSurahs,
}) => {
  useEffect(() => {
    sound.playFanfare();
    launchConfetti();
  }, []);

  const percentage = Math.round((score / Math.max(1, total)) * 100);
  const isPerfect = score === total;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-stone-200 animate-scaleUp font-arabic" dir="rtl">
        {/* Trophy visual */}
        <div className="relative w-28 h-28 mx-auto mb-4">
          <img
            src="/src/assets/images/trophy_quran_star_1791381460241.jpg"
            alt="وسام التميز"
            className="w-full h-full rounded-2xl object-cover border-4 border-amber-300 shadow-lg"
          />
          <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-1.5 shadow">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-stone-900 mb-1">
          {isPerfect
            ? '🌟 إتقان تام للمتشابهات! ما شاء الله تبارك الله'
            : 'أحسنت! أتممت جلسة المتشابهات بنجاح'}
        </h2>

        <p className="text-sm text-stone-600 mb-6">
          {isPerfect
            ? 'ضبط دقيق ومتقن للحروف والكلمات والعبارات دون خلط أو تردد!'
            : 'المراجعة والاستمرار سر ثبات القرآن ورسوخه في الصدور'}
        </p>

        {/* Score metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-stone-50 p-4 rounded-2xl border border-stone-200">
          <div>
            <div className="text-xs font-bold uppercase text-stone-500 mb-0.5">نسبة الإتقان</div>
            <div className="text-2xl font-black text-emerald-700 tabular-nums">
              {percentage}%
            </div>
            <div className="text-xs text-stone-500">
              {score} من أصل {total} صحيحة
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase text-stone-500 mb-0.5">المكافأة المكتسبة</div>
            <div className="text-2xl font-black text-amber-600 tabular-nums flex items-center justify-center gap-1">
              <Sparkles className="w-5 h-5 fill-amber-400" />
              <span>+{score * 15}</span>
            </div>
            <div className="text-xs text-stone-500">+5 ياقوتات 💎</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onPlayAgain}
            className="w-full btn-duo-green py-3.5 rounded-xl text-white font-black text-sm uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة التدريب والمراجعة</span>
          </button>

          <button
            onClick={onSelectSurahs}
            className="w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>اختيار سور أخرى للتثبيت</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

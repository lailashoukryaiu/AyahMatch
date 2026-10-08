import React from 'react';
import { ShieldCheck, BookOpen, FileText, CheckCircle2, Folder, Terminal, Sparkles, X } from 'lucide-react';
import { getKnowledgeBaseStats } from '../services/knowledgeBaseService.ts';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const stats = getKnowledgeBaseStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-arabic" dir="rtl">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-stone-100 p-5 sm:p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">
                قاعدة المعرفة المعتمدة (100% موثقة)
              </h2>
              <p className="text-xs text-stone-500">
                ضمان قطعي لحصر جميع الأسئلة والبدائل في كتب المتشابهات دون أي هلوسة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Guarantee Banner */}
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4.5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-emerald-950 mb-1">
                  حصر شامل وضمان عدم الخطأ في القرآن الكريم
                </h3>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  جميع الأسئلة وخيارات الإجابة والبدائل (Distractors) وقواعد الضبط مستخرجة ومحصورة حصرياً داخل نصوص القرآن الكريم ومراجع المتشابهات المعتمدة. لا يتم اختلاق أو تأليف أي بديل من خارج الآيات المشابهة في المرجع.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 text-center">
              <span className="block text-2xl font-black text-stone-900 tabular-nums">
                {stats.totalQuestions}
              </span>
              <span className="text-[11px] font-bold text-stone-500">موضع متشابه موثق</span>
            </div>
            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 text-center">
              <span className="block text-2xl font-black text-emerald-700 tabular-nums">
                {stats.coveredSurahsCount}
              </span>
              <span className="text-[11px] font-bold text-stone-500">سورة مغطاة</span>
            </div>
            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 text-center">
              <span className="block text-2xl font-black text-amber-700 tabular-nums">
                {stats.totalRulesCount}
              </span>
              <span className="text-[11px] font-bold text-stone-500">قاعدة وضابط حفظ</span>
            </div>
          </div>

          {/* Active Reference Sources */}
          <div>
            <h4 className="text-xs font-black text-stone-800 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>المراجع والكتب المعتمدة حالياً في قاعدة المعرفة:</span>
            </h4>
            <div className="space-y-2.5">
              {stats.sources.map((source) => (
                <div key={source.id} className="p-3.5 bg-white border border-stone-200 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-stone-900">{source.title}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      موثق في النظام
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 mb-1">المحقق / المؤلف: {source.author}</div>
                  <div className="text-[11px] text-stone-500">{source.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ingestion Guide for User's PDFs */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4.5">
            <h4 className="text-xs font-black text-amber-950 mb-2 flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-amber-700" />
              <span>كيفية إضافة وفهرسة ملفات PDF الخاصة بك:</span>
            </h4>
            <ol className="text-xs text-amber-900 space-y-2 pr-4 list-decimal leading-relaxed">
              <li>
                ضع ملفات الـ <strong>PDF</strong> الخاصة بك في المجلد المخصص بالمشروع:
                <code className="block mt-1 font-mono text-[11px] bg-amber-100/80 px-2 py-1 rounded text-amber-950 dir-ltr text-left">
                  knowledge_base/sources/
                </code>
              </li>
              <li>
                شغّل أمر الفهرسة التلقائية في موجه الأوامر (Terminal):
                <div className="flex items-center gap-2 mt-1 bg-stone-900 text-stone-100 px-3 py-1.5 rounded-lg font-mono text-xs dir-ltr text-left">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>npm run ingest:kb</span>
                </div>
              </li>
              <li>
                سيقوم النظام فوراً باستخراج مواضع المتشابهات وقواعدها وحصر الأسئلة والخيارات داخلها بنسبة 100%.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 sm:p-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

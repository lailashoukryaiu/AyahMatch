export type QuestionType = 
  | 'single_letter'       // اختلاف حرف واحد (تستطع vs تسطع)
  | 'single_word'         // اختلاف كلمة واحدة (تجريان vs نضاختان، تحتها vs من تحتها)
  | 'phrase_diff'         // اختلاف عبارة وتراكيب (قولوا آمنا وما أنزل إلينا vs قل آمنا وما أنزل علينا)
  | 'sequence_order'      // تقديم وتأخير وترتيب (الشفاعة والعدل، التزكية والتعليم)
  | 'ayah_ending';        // فواصل وخواتيم الآيات (غفور رحيم vs عزيز حكيم)

export interface SurahMeta {
  number: number;
  name: string;        // Arabic name (e.g. البقرة)
  englishName: string; // e.g. Al-Baqarah
  englishMeaning: string;
  numberOfAyahs: number;
  juz: number[];
  category: 'makkah' | 'madinah';
}

export interface MutashabihaOption {
  id: string;
  text: string;
  isCorrect: boolean;
  highlightPart?: string;
}

export interface MutashabihaQuestion {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  verseSnippet: string;       // The verse with [___] blank
  fullVerseArabic: string;    // Full correct verse
  comparisonSurahNumber?: number;
  comparisonSurahName?: string;
  comparisonAyahNumber?: number;
  comparisonVerseArabic?: string; // The similar verse it gets confused with
  questionType: QuestionType;
  prompt: string;
  promptArabic: string;
  options: MutashabihaOption[];
  explanation: string;        // The memorization rule / mnemonic (قاعدة الضبط)
  exactDifferenceNote: string;
  audioAyahUrl?: string;
  isKidsRecommended?: boolean;
}

export interface UserProgress {
  totalXp: number;
  currentStreak: number;
  bestStreak: number;
  gems: number;
  completedQuizzes: number;
  masteredVersesCount: number;
  selectedSurahIds: number[];
  selectedQuestionTypes: QuestionType[];
  comparisonScope: 'internal_only' | 'all_quran'; // داخل السور المحددة فقط أو مع كل القرآن
  autoAdvance: boolean; // الانتقال التلقائي للسؤال التالي بعد الإجابة
  soundEnabled: boolean;
  voiceReciter: 'alafasy' | 'minshawi' | 'husary';
}

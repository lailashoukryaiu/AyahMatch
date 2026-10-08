import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { QuizView } from './components/QuizView.tsx';
import { SurahSelector } from './components/SurahSelector.tsx';
import { AyahSimilaritySearch } from './components/AyahSimilaritySearch.tsx';
import { ReviewBookModal } from './components/ReviewBookModal.tsx';
import { StatsView } from './components/StatsView.tsx';
import { CompletionModal } from './components/CompletionModal.tsx';
import { UserProgress, MutashabihaQuestion, QuestionType } from './types.ts';
import { MUTASHABIHAT_QUESTIONS } from './data/mutashabihat.ts';
import { sound } from './services/soundService.ts';

const STORAGE_KEY = 'hafiz_quran_user_progress_v4';

const ALL_TYPES: QuestionType[] = [
  'single_letter',
  'single_word',
  'phrase_diff',
  'sequence_order',
  'ayah_ending',
];

const DEFAULT_PROGRESS: UserProgress = {
  totalXp: 120,
  currentStreak: 3,
  bestStreak: 7,
  gems: 35,
  completedQuizzes: 4,
  masteredVersesCount: 8,
  selectedSurahIds: [18, 2, 3, 4, 5, 6, 7, 9, 10, 12, 20, 36, 55, 56, 67, 78, 79, 81, 82, 84, 87, 89, 93, 97, 98, 102, 107, 109, 110, 112, 113, 114],
  selectedQuestionTypes: ALL_TYPES,
  comparisonScope: 'all_quran',
  autoAdvance: true,
  soundEnabled: true,
  voiceReciter: 'alafasy',
};

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_PROGRESS,
            ...parsed,
            selectedQuestionTypes: parsed.selectedQuestionTypes || ALL_TYPES,
            comparisonScope: parsed.comparisonScope || 'all_quran',
            autoAdvance: parsed.autoAdvance !== undefined ? parsed.autoAdvance : true,
          };
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_PROGRESS;
  });

  const [activeTab, setActiveTab] = useState<'surahs' | 'quiz' | 'search' | 'book' | 'stats'>('surahs');
  const [activeQuestions, setActiveQuestions] = useState<MutashabihaQuestion[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [lastQuizScore, setLastQuizScore] = useState({ score: 0, total: 0 });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
    sound.enabled = progress.soundEnabled;
  }, [progress]);

  // Strictly filter questions matching selectedSurahIds, question types, and comparisonScope
  useEffect(() => {
    const scope = progress.comparisonScope || 'all_quran';
    const filtered = MUTASHABIHAT_QUESTIONS.filter((q) => {
      if (!progress.selectedQuestionTypes.includes(q.questionType)) return false;

      if (scope === 'internal_only') {
        if (progress.selectedSurahIds.length === 1) {
          return (
            q.surahNumber === progress.selectedSurahIds[0] &&
            (!q.comparisonSurahNumber || q.comparisonSurahNumber === progress.selectedSurahIds[0])
          );
        }
        return (
          progress.selectedSurahIds.includes(q.surahNumber) &&
          (!q.comparisonSurahNumber || progress.selectedSurahIds.includes(q.comparisonSurahNumber))
        );
      } else {
        return (
          progress.selectedSurahIds.includes(q.surahNumber) ||
          (q.comparisonSurahNumber && progress.selectedSurahIds.includes(q.comparisonSurahNumber))
        );
      }
    });

    if (filtered.length > 0) {
      setActiveQuestions([...filtered].sort(() => Math.random() - 0.5));
    } else {
      setActiveQuestions([]);
    }
  }, [progress.selectedSurahIds, progress.selectedQuestionTypes, progress.comparisonScope]);

  const handleToggleSound = () => {
    setProgress((prev) => {
      const next = !prev.soundEnabled;
      sound.enabled = next;
      return { ...prev, soundEnabled: next };
    });
  };

  const handleAddXp = (amount: number) => {
    setProgress((prev) => ({
      ...prev,
      totalXp: prev.totalXp + amount,
      gems: prev.gems + 1,
    }));
  };

  const handleCompleteQuiz = (score: number, total: number) => {
    setLastQuizScore({ score, total });
    setShowCompletion(true);
    setProgress((prev) => ({
      ...prev,
      completedQuizzes: prev.completedQuizzes + 1,
      totalXp: prev.totalXp + score * 15,
      gems: prev.gems + 5,
      masteredVersesCount: prev.masteredVersesCount + score,
    }));
  };

  const handlePlayAgain = () => {
    setShowCompletion(false);
    const scope = progress.comparisonScope || 'all_quran';
    const filtered = MUTASHABIHAT_QUESTIONS.filter((q) => {
      if (!progress.selectedQuestionTypes.includes(q.questionType)) return false;

      if (scope === 'internal_only') {
        if (progress.selectedSurahIds.length === 1) {
          return (
            q.surahNumber === progress.selectedSurahIds[0] &&
            (!q.comparisonSurahNumber || q.comparisonSurahNumber === progress.selectedSurahIds[0])
          );
        }
        return (
          progress.selectedSurahIds.includes(q.surahNumber) &&
          (!q.comparisonSurahNumber || progress.selectedSurahIds.includes(q.comparisonSurahNumber))
        );
      } else {
        return (
          progress.selectedSurahIds.includes(q.surahNumber) ||
          (q.comparisonSurahNumber && progress.selectedSurahIds.includes(q.comparisonSurahNumber))
        );
      }
    });
    setActiveQuestions([...filtered].sort(() => Math.random() - 0.5));
    setActiveTab('quiz');
  };

  const handleSelectSurahs = () => {
    setShowCompletion(false);
    setActiveTab('surahs');
  };

  const handleStartQuizFromSelector = (
    ids?: number[],
    types?: QuestionType[],
    scope?: 'internal_only' | 'all_quran'
  ) => {
    const effectiveIds = ids ?? progress.selectedSurahIds;
    const effectiveTypes = types ?? progress.selectedQuestionTypes;
    const effectiveScope = scope ?? progress.comparisonScope ?? 'all_quran';

    setProgress((prev) => ({
      ...prev,
      selectedSurahIds: effectiveIds,
      selectedQuestionTypes: effectiveTypes,
      comparisonScope: effectiveScope,
    }));

    const filtered = MUTASHABIHAT_QUESTIONS.filter((q) => {
      if (!effectiveTypes.includes(q.questionType)) return false;

      if (effectiveScope === 'internal_only') {
        if (effectiveIds.length === 1) {
          return (
            q.surahNumber === effectiveIds[0] &&
            (!q.comparisonSurahNumber || q.comparisonSurahNumber === effectiveIds[0])
          );
        }
        return (
          effectiveIds.includes(q.surahNumber) &&
          (!q.comparisonSurahNumber || effectiveIds.includes(q.comparisonSurahNumber))
        );
      } else {
        return (
          effectiveIds.includes(q.surahNumber) ||
          (q.comparisonSurahNumber && effectiveIds.includes(q.comparisonSurahNumber))
        );
      }
    });

    setActiveQuestions([...filtered].sort(() => Math.random() - 0.5));
    setActiveTab('quiz');
  };

  const handlePracticeSpecificSurah = (surahNumber: number) => {
    setProgress((prev) => ({
      ...prev,
      selectedSurahIds: [surahNumber],
      comparisonScope: 'internal_only',
    }));
    const filtered = MUTASHABIHAT_QUESTIONS.filter(
      (q) => q.surahNumber === surahNumber || q.comparisonSurahNumber === surahNumber
    );
    if (filtered.length > 0) {
      setActiveQuestions([...filtered].sort(() => Math.random() - 0.5));
    }
    setActiveTab('quiz');
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans" dir="rtl">
      {/* Top Header */}
      <Header
        progress={progress}
        onToggleSound={handleToggleSound}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'surahs' && (
          <SurahSelector
            selectedSurahIds={progress.selectedSurahIds}
            onChangeSelected={(ids) =>
              setProgress((prev) => ({ ...prev, selectedSurahIds: ids }))
            }
            selectedQuestionTypes={progress.selectedQuestionTypes}
            onChangeQuestionTypes={(types) =>
              setProgress((prev) => ({ ...prev, selectedQuestionTypes: types }))
            }
            comparisonScope={progress.comparisonScope || 'all_quran'}
            onChangeComparisonScope={(scope) =>
              setProgress((prev) => ({ ...prev, comparisonScope: scope }))
            }
            onStartQuiz={handleStartQuizFromSelector}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            questions={activeQuestions}
            onCompleteQuiz={handleCompleteQuiz}
            progress={progress}
            onAddXp={handleAddXp}
            onOpenSurahSelector={() => setActiveTab('surahs')}
          />
        )}

        {activeTab === 'search' && (
          <AyahSimilaritySearch
            onPracticeSurah={handlePracticeSpecificSurah}
          />
        )}

        {activeTab === 'book' && (
          <ReviewBookModal
            onPracticeSurah={handlePracticeSpecificSurah}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            progress={progress}
            onUpdateProgress={(updated) =>
              setProgress((prev) => ({ ...prev, ...updated }))
            }
          />
        )}
      </main>

      {/* Completion Modal */}
      {showCompletion && (
        <CompletionModal
          score={lastQuizScore.score}
          total={lastQuizScore.total}
          onPlayAgain={handlePlayAgain}
          onSelectSurahs={handleSelectSurahs}
        />
      )}
    </div>
  );
}

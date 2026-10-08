import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { QuizView } from './components/QuizView.tsx';
import { SurahSelector } from './components/SurahSelector.tsx';
import { AyahSimilaritySearch } from './components/AyahSimilaritySearch.tsx';
import { ReviewBookModal } from './components/ReviewBookModal.tsx';
import { StatsView } from './components/StatsView.tsx';
import { CompletionModal } from './components/CompletionModal.tsx';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal.tsx';
import { UserProgress, MutashabihaQuestion, QuestionType } from './types.ts';
import { queryKnowledgeBase } from './services/knowledgeBaseService.ts';
import { sound } from './services/soundService.ts';

const STORAGE_KEY = 'hafiz_quran_user_progress_v5';

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
  selectedSurahIds: [2, 3], // Default: Al-Baqarah (2) and Al-Imran (3)
  selectedQuestionTypes: ALL_TYPES,
  comparisonScope: 'internal_only', // Default: تشابه داخلي فقط
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
  const [showKbModal, setShowKbModal] = useState(false);
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

  // Strictly query questions from verified Knowledge Base
  useEffect(() => {
    const filtered = queryKnowledgeBase({
      surahIds: progress.selectedSurahIds,
      questionTypes: progress.selectedQuestionTypes,
      comparisonScope: progress.comparisonScope || 'all_quran',
    });
    setActiveQuestions(filtered);
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
    const filtered = queryKnowledgeBase({
      surahIds: progress.selectedSurahIds,
      questionTypes: progress.selectedQuestionTypes,
      comparisonScope: progress.comparisonScope || 'all_quran',
    });
    setActiveQuestions(filtered);
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

    const filtered = queryKnowledgeBase({
      surahIds: effectiveIds,
      questionTypes: effectiveTypes,
      comparisonScope: effectiveScope,
    });

    setActiveQuestions(filtered);
    setActiveTab('quiz');
  };

  const handlePracticeSpecificSurah = (surahNumber: number) => {
    setProgress((prev) => ({
      ...prev,
      selectedSurahIds: [surahNumber],
      comparisonScope: 'internal_only',
    }));
    const filtered = queryKnowledgeBase({
      surahIds: [surahNumber],
      comparisonScope: 'internal_only',
    });
    setActiveQuestions(filtered);
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
        onOpenKnowledgeBase={() => setShowKbModal(true)}
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

      {/* Knowledge Base Quality & Sources Modal */}
      <KnowledgeBaseModal
        isOpen={showKbModal}
        onClose={() => setShowKbModal(false)}
      />
    </div>
  );
}

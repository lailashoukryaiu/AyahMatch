import { MutashabihaQuestion } from '../types.ts';
import { queryKnowledgeBase } from './knowledgeBaseService.ts';
import { ALL_SURAHS } from '../data/surahs.ts';

/**
 * Strict Knowledge Base Provider:
 * Guarantees zero AI hallucination by resolving all requests directly against
 * the verified Knowledge Base extracted from accredited similarity literature.
 */
export async function fetchGeminiQuestions(surahNames: string[], count: number = 3): Promise<MutashabihaQuestion[]> {
  const surahIds = ALL_SURAHS
    .filter((s) => surahNames.includes(s.name) || surahNames.includes(s.englishName))
    .map((s) => s.number);

  return queryKnowledgeBase({
    surahIds: surahIds.length > 0 ? surahIds : undefined,
    limit: count,
  });
}

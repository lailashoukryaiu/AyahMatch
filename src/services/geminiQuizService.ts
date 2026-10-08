import { MutashabihaQuestion } from '../types.ts';
import { MUTASHABIHAT_QUESTIONS } from '../data/mutashabihat.ts';

export async function fetchGeminiQuestions(surahNames: string[], count: number = 3): Promise<MutashabihaQuestion[]> {
  try {
    const res = await fetch('/api/gemini/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ surahNames, count }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Using local curated Mutashabihat bank:', err);
  }

  // Fallback to local curated question bank
  return MUTASHABIHAT_QUESTIONS.filter(q => surahNames.includes(q.surahName));
}

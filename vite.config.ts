import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {GoogleGenAI, Type} from '@google/genai';

function geminiQuizPlugin(): Plugin {
  return {
    name: 'gemini-quiz-api',
    configureServer(server) {
      server.middlewares.use('/api/gemini/quiz', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const surahNames = data.surahNames || ['البقرة'];
            const count = data.count || 3;

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }));
              return;
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const prompt = `You are a world-class Quranic scholar specializing in "علم المتشابهات اللفظية" (Mutashabihat al-Qur'an / Similar Quranic Verses) and the classical books of Dabit (مثل درة التنزيل وملاك التأويل والبرهان ودليل الحيران).
Generate ${count} high-precision Multiple Choice Questions (MCQ) testing similar verses for the following Surah(s): ${surahNames.join(', ')}.

CRITICAL RULES:
1. Focus on similarities WITHIN the Surah or with another Surah that often cause memorizers to confuse verses.
2. Even a single letter difference (مثل: تسطع vs تستطع, أك vs أكن, وسارعوا vs سارعوا, اسطاعوا vs استطاعوا) or single word difference is key.
3. Every question must have exactly 3 options, exactly 1 correct option.
4. Provide the exact Surah number, Surah name, Ayah number, verse snippet with [___] for the blank, and full verse in Arabic with full Tashkeel.
5. Provide a clear memorization mnemonic / rule (قاعدة الضبط والتوجيه) explaining why the difference exists so the student never mixes them again.
6. Provide an exact difference note explaining the exact letter or word difference.`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      surahNumber: { type: Type.INTEGER },
                      surahName: { type: Type.STRING },
                      ayahNumber: { type: Type.INTEGER },
                      questionType: { type: Type.STRING },
                      verseSnippet: { type: Type.STRING },
                      fullVerseArabic: { type: Type.STRING },
                      comparisonSurahName: { type: Type.STRING },
                      comparisonAyahNumber: { type: Type.INTEGER },
                      comparisonVerseArabic: { type: Type.STRING },
                      prompt: { type: Type.STRING },
                      promptArabic: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            text: { type: Type.STRING },
                            isCorrect: { type: Type.BOOLEAN },
                            highlightPart: { type: Type.STRING },
                          },
                          required: ['id', 'text', 'isCorrect'],
                        },
                      },
                      explanation: { type: Type.STRING },
                      exactDifferenceNote: { type: Type.STRING },
                    },
                    required: [
                      'id',
                      'surahNumber',
                      'surahName',
                      'ayahNumber',
                      'verseSnippet',
                      'fullVerseArabic',
                      'prompt',
                      'promptArabic',
                      'options',
                      'explanation',
                      'exactDifferenceNote',
                    ],
                  },
                },
              },
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(response.text);
          } catch (err: unknown) {
            console.error('Gemini error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            const message = err instanceof Error ? err.message : 'Unknown error';
            res.end(JSON.stringify({ error: message }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiQuizPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

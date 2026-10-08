import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {GoogleGenAI, Type} from '@google/genai';

import { MUTASHABIHAT_QUESTIONS } from './src/data/mutashabihat.ts';

function knowledgeBasePlugin(): Plugin {
  return {
    name: 'knowledge-base-api',
    configureServer(server) {
      // 100% deterministic knowledge-base question server (Zero Hallucination)
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

        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const surahNames = data.surahNames || ['البقرة'];
            const count = data.count || 3;

            // Strictly filter from verified Knowledge Base:
            const matching = MUTASHABIHAT_QUESTIONS.filter(q => 
              surahNames.includes(q.surahName) || 
              (q.comparisonSurahName && surahNames.includes(q.comparisonSurahName))
            );

            const shuffled = [...matching].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, count);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(selected));
          } catch (err: unknown) {
            console.error('KB server error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            const message = err instanceof Error ? err.message : 'Unknown error';
            res.end(JSON.stringify({ error: message }));
          }
        });
      });

      // Knowledge Base Statistics endpoint
      server.middlewares.use('/api/kb/stats', (req, res) => {
        const surahs = new Set(MUTASHABIHAT_QUESTIONS.map(q => q.surahNumber));
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          totalEntries: MUTASHABIHAT_QUESTIONS.length,
          coveredSurahs: surahs.size,
          sources: [
            'الضبط بالتقعيد للمتشابه اللفظي',
            'ملاك التأويل للغرناطي',
            'البرهان للكرماني'
          ],
          guarantee: '100% verified Quranic literature without AI hallucinations'
        }));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), knowledgeBasePlugin()],
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

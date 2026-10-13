import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCES_DIR = path.join(ROOT_DIR, 'knowledge_base', 'sources');
const EXTRACTED_DIR = path.join(ROOT_DIR, 'knowledge_base', 'extracted');
const VERIFIED_DB_PATH = path.join(ROOT_DIR, 'knowledge_base', 'verified_database.json');

dotenv.config({
  path: [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
  ],
});

function resolveApiKey() {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
}

function consolidateExtractedJson() {
  const jsonFiles = fs.existsSync(EXTRACTED_DIR)
    ? fs.readdirSync(EXTRACTED_DIR).filter((f) => f.toLowerCase().endsWith('.json'))
    : [];

  const allExtracted: unknown[] = [];

  for (const fileName of jsonFiles) {
    try {
      const filePath = path.join(EXTRACTED_DIR, fileName);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Array.isArray(content)) allExtracted.push(...content);
    } catch {
      // Ignore malformed files and continue merging valid ones.
    }
  }

  if (fs.existsSync(VERIFIED_DB_PATH)) {
    try {
      const verified = JSON.parse(fs.readFileSync(VERIFIED_DB_PATH, 'utf-8'));
      if (Array.isArray(verified)) {
        allExtracted.push(...verified);
      }
    } catch {
      // Ignore malformed verified database.
    }
  }

  const merged = allExtracted.filter((entry, index, array) => {
    if (!entry || typeof entry !== 'object') return false;
    const id = (entry as { id?: string }).id;
    return (
      typeof id === 'string' &&
      array.findIndex((item) => {
        if (!item || typeof item !== 'object') return false;
        return (item as { id?: string }).id === id;
      }) === index
    );
  });

  const appKbPath = path.join(ROOT_DIR, 'src', 'data', 'customKnowledgeBase.json');
  fs.writeFileSync(appKbPath, JSON.stringify(merged, null, 2), 'utf-8');
  fs.writeFileSync(VERIFIED_DB_PATH, JSON.stringify(merged, null, 2), 'utf-8');

  return merged;
}

async function main() {
  console.log('====================================================');
  console.log('📖 نظام فهرسة وتوثيق كتب المتشابهات (PDF Knowledge Base Ingestion)');
  console.log('====================================================\n');

  if (!fs.existsSync(SOURCES_DIR)) {
    fs.mkdirSync(SOURCES_DIR, { recursive: true });
  }
  if (!fs.existsSync(EXTRACTED_DIR)) {
    fs.mkdirSync(EXTRACTED_DIR, { recursive: true });
  }

  const existingJsonCount = fs.existsSync(EXTRACTED_DIR)
    ? fs.readdirSync(EXTRACTED_DIR).filter((f) => f.toLowerCase().endsWith('.json')).length
    : 0;

  if (existingJsonCount > 0) {
    console.log(
      `📦 تم العثور على ${existingJsonCount} ملف JSON مُستخرج سابقاً. سيتم دمجه مع قاعدة المعرفة الحالية.`
    );
    const merged = consolidateExtractedJson();
    console.log(`✅ تم دمج ${merged.length} عنصر من قاعدة المعرفة المحفوظة.`);
  }

  const files = fs.readdirSync(SOURCES_DIR);
  const pdfFiles = files.filter((f) => f.toLowerCase().endsWith('.pdf'));

  if (pdfFiles.length === 0) {
    console.log(`ℹ️ لم يتم العثور على ملفات PDF جديدة في المجلد:\n   ${SOURCES_DIR}\n`);
    console.log('📌 للبدء في استخراج وفهرسة كتاب جديد:');
    console.log('   1. ضع ملف الـ PDF داخل مجلد "knowledge_base/sources/"');
    console.log('   2. تأكد من ضبط مفتاح GEMINI_API_KEY في ملف .env.local أو .env');
    console.log('   3. أعد تشغيل الأمر: npm run ingest:kb\n');
    console.log('✅ إذا كانت ملفات JSON قد تم استخراجها مسبقاً، فالأمر سيقوم بدمجها تلقائياً.');
    return;
  }

  console.log(`🔍 تم العثور على (${pdfFiles.length}) ملف PDF للفهرسة:`);
  pdfFiles.forEach((file, idx) => console.log(`   ${idx + 1}. ${file}`));
  console.log('');

  const apiKey = resolveApiKey();
  if (!apiKey) {
    console.error('❌ خطأ: لم يتم العثور على GEMINI_API_KEY في .env.local أو .env لمعالجة ملفات الـ PDF.');
    console.log('يرجى إنشاء ملف .env.local يحتوي على:');
    console.log('GEMINI_API_KEY="YOUR_KEY_HERE"');
    console.log('ثم أعد تشغيل الأمر: npm run ingest:kb');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  for (const pdfFile of pdfFiles) {
    console.log(`\n📄 جارٍ قراءة وتحليل: ${pdfFile}...`);
    const filePath = path.join(SOURCES_DIR, pdfFile);
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');

    const prompt = `أنت عالم متخصص في علوم القرآن الكريم وتحقيق كتب المتشابهات اللفظية.
قم باستخراج جميع مواضع المتشابهات اللفظية الواردة في هذا المستند بدقة متناهية وبدون أي تصرف أو اختلاق.

شروط وقواعد الحصر الصارم (ZERO HALLUCINATION):
1. كل سؤال وموضع مستخرج يجب أن يكون من القرآن الكريم بنصه الدقيق وتشكيله الصحيح.
2. المشتتات والبدائل (Options / Distractors) يجب أن تقتصر حصرياً وبشكل قطعي على اللفظ في الآية الأصلية واللفظ في الآية المقارنة.
3. استخرج رقم السورة واسمها ورقم الآية بدقة (1-114).
4. استخرج ضابط وقاعدة الحفظ المذكورة في الكتاب لتثبيت الفرق.
5. سجّل اسم الكتاب ورقم الصفحة المذكورة فيها هذه المقارنة.

أعد النتيجة فقط كـ JSON array من كائنات السؤال التالية:
[
  {
    id: string,
    surahNumber: number,
    surahName: string,
    ayahNumber: number,
    questionType: 'single_letter' | 'single_word' | 'phrase_diff' | 'sequence_order' | 'ayah_ending',
    verseSnippet: string,
    fullVerseArabic: string,
    comparisonSurahNumber: number,
    comparisonSurahName: string,
    comparisonAyahNumber: number,
    comparisonVerseArabic: string,
    prompt: string,
    promptArabic: string,
    options: [{ id: string, text: string, isCorrect: boolean, highlightPart?: string }],
    explanation: string,
    exactDifferenceNote: string,
    sourceBook: string,
    sourcePage: string
  }
]`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: base64Data,
                },
              },
              { text: prompt },
            ],
          },
        ],
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
                questionType: {
                  type: Type.STRING,
                  enum: ['single_letter', 'single_word', 'phrase_diff', 'sequence_order', 'ayah_ending'],
                },
                verseSnippet: { type: Type.STRING },
                fullVerseArabic: { type: Type.STRING },
                comparisonSurahNumber: { type: Type.INTEGER },
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
                sourceBook: { type: Type.STRING },
                sourcePage: { type: Type.STRING },
              },
              required: [
                'id',
                'surahNumber',
                'surahName',
                'ayahNumber',
                'questionType',
                'verseSnippet',
                'fullVerseArabic',
                'promptArabic',
                'options',
                'explanation',
                'exactDifferenceNote',
              ],
            },
          },
        },
      });

      const extractedEntries = JSON.parse(response.text || '[]');
      const outJsonName = pdfFile.replace(/\.pdf$/i, '.json');
      const outPath = path.join(EXTRACTED_DIR, outJsonName);

      fs.writeFileSync(outPath, JSON.stringify(extractedEntries, null, 2), 'utf-8');
      console.log(`✅ تم استخراج (${extractedEntries.length}) موضعاً موثقاً وحفظها في:`);
      console.log(`   ${outPath}`);
    } catch (err: unknown) {
      console.error(`❌ حدث خطأ أثناء معالجة الملف ${pdfFile}:`, err);
      console.log('💡 إذا كان الخطأ بسبب المفتاح، تأكد من وجود .env.local أو .env مع GEMINI_API_KEY.');
    }
  }

  const merged = consolidateExtractedJson();
  console.log(`\n📦 تم تحديث قاعدة بيانات التطبيق المعتمدة بنجاح: (${merged.length} موضعاً إضافياً).`);
  console.log('✨ تمت عملية الفهرسة بنجاح.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

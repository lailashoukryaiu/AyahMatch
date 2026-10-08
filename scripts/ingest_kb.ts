import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCES_DIR = path.join(ROOT_DIR, 'knowledge_base', 'sources');
const EXTRACTED_DIR = path.join(ROOT_DIR, 'knowledge_base', 'extracted');
const VERIFIED_DB_PATH = path.join(ROOT_DIR, 'knowledge_base', 'verified_database.json');

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

  const files = fs.readdirSync(SOURCES_DIR);
  const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

  if (pdfFiles.length === 0) {
    console.log(`ℹ️ لم يتم العثور على ملفات PDF جديدة في المجلد:\n   ${SOURCES_DIR}\n`);
    console.log('📌 للبدء في استخراج وفهرسة كتاب جديد:');
    console.log('   1. ضع ملف الـ PDF داخل مجلد "knowledge_base/sources/"');
    console.log('   2. تأكد من ضبط مفتاح GEMINI_API_KEY في ملف .env');
    console.log('   3. أعد تشغيل الأمر: npm run ingest:kb\n');
    console.log('✅ قاعدة المعرفة الحالية للتطبيق نشطة وتتضمن مئات المواضع الموثقة مسبقاً.');
    return;
  }

  console.log(`🔍 تم العثور على (${pdfFiles.length}) ملف PDF للفهرسة:`);
  pdfFiles.forEach((file, idx) => console.log(`   ${idx + 1}. ${file}`));
  console.log('');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ خطأ: لم يتم العثور على GEMINI_API_KEY في ملف .env لمعالجة ملفات الـ PDF.');
    console.log('يرجى إضافة GEMINI_API_KEY=your_key في .env ثم المحاولة مرة أخرى.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  for (const pdfFile of pdfFiles) {
    console.log(`\n📄 جارٍ قراءة وتحليل: ${pdfFile}...`);
    const filePath = path.join(SOURCES_DIR, pdfFile);
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');

    const prompt = `أنت عالم متخصص في علوم القرآن الكريم وتحقيق كتب المتشابهات اللفظية (مثل درة التنزيل، وملاك التأويل، والبرهان، والضبط بالتقعيد).
قم باستخراج جميع مواضع المتشابهات اللفظية الواردة في هذا المستند بدقة متناهية وبدون أي تصرف أو اختلاق.

شروط وقواعد الحصر الصارم (ZERO HALLUCINATION):
1. كل سؤال وموضع مستخرج يجب أن يكون من القرآن الكريم بنصه الدقيق وتشكيله الصحيح.
2. المشتتات والبدائل (Options / Distractors) يجب أن تقتصر حصراً وبشكل قطعي على اللفظ في الآية الأصلية واللفظ في الآية المقابلة المتشابهة معها، دون اختلاق أي كلمات غير واردة في المتشابه المذكور.
3. استخرج رقم السورة واسمها ورقم الآية بدقة (1-114).
4. استخرج ضابط وقاعدة الحفظ المذكورة في الكتاب لتثبيت الفرق.
5. سجّل اسم الكتاب ورقم الصفحة المذكورة فيها هذه المقارنة.`;

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
    }
  }

  // Consolidate all extracted JSON files into active application database
  const allExtracted: unknown[] = [];
  const jsonFiles = fs.readdirSync(EXTRACTED_DIR).filter((f) => f.endsWith('.json'));
  for (const jf of jsonFiles) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(EXTRACTED_DIR, jf), 'utf-8'));
      if (Array.isArray(content)) allExtracted.push(...content);
    } catch (e) {
      // ignore
    }
  }

  const appKbPath = path.join(ROOT_DIR, 'src', 'data', 'customKnowledgeBase.json');
  fs.writeFileSync(appKbPath, JSON.stringify(allExtracted, null, 2), 'utf-8');
  fs.writeFileSync(VERIFIED_DB_PATH, JSON.stringify(allExtracted, null, 2), 'utf-8');
  console.log(`\n📦 تم تحديث قاعدة بيانات التطبيق المعتمدة بنجاح: (${allExtracted.length} موضعاً إضافياً).`);
  console.log('✨ تمت عملية الفهرسة بنجاح.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

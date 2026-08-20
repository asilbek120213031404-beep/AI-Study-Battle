import { GoogleGenAI } from '@google/genai';
import type { Question, Difficulty } from '../types';

export const getStoredGeminiKey = (): string => {
  return localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
};

const PRESET_SUBJECT_QUESTIONS: Record<string, Question[]> = {
  'programming': [
    {
      id: 'p1',
      question: 'React 19 da useState Hook nima qaytaradi?',
      options: [
        'State va setState metodlariga ega ob\'ekt',
        'Joriy qiymat va yangilovchi funksiyadan iborat massiv (tuple)',
        'Komponent kalitini anglatuvchi bitta satr qiymat',
        'Nishon elementga to\'g\'ridan-to\'g\'ri DOM havolasi'
      ],
      correctAnswer: 1,
      explanation: 'useState [joriyHolat, yangilashFunksiyasi] juftligini qaytaradi.'
    },
    {
      id: 'p2',
      question: 'TypeScript da o\'zgaruvchilar turini avtomatik aniqlaydigan xususiyat nima deyiladi?',
      options: ['Type Casting', 'Type Inference (Turlarni chiqarish)', 'Type Injection', 'Type Assertion'],
      correctAnswer: 1,
      explanation: 'Type Inference biriktirilgan qiymatga qarab turini avtomatik aniqlaydi.'
    },
    {
      id: 'p3',
      question: 'PostgreSQL Supabase dagi Row Level Security (RLS) ning asosiy vazifasi nima?',
      options: ['Ustunlarni shifrlash', 'Har bir qator uchun ruxsat qoidalarini belgilash', 'Ma\'lumotlar bazasi indekslarini optimallashtirish', 'Avtomatik zaxira nusxalash'],
      correctAnswer: 1,
      explanation: 'RLS siyosati foydalanuvchilar qaysi qatorlarni ko\'rishi va o\'zgartirishi mumkinligini cheklaydi.'
    },
    {
      id: 'p4',
      question: 'Tailwind CSS v4 da asosiy ramka stillari qanday import qilinadi?',
      options: ['@tailwind utilities;', '@import "tailwindcss";', '@use "tailwind";', 'include tailwind;'],
      correctAnswer: 1,
      explanation: 'Tailwind CSS v4 da standart CSS `@import "tailwindcss";` ishlatiladi.'
    },
    {
      id: 'p5',
      question: 'Transformer modellarida barcha soʻzlarni bir vaqtning oʻzida tahlil qilish imkonini beruvchi mexanizm qaysi?',
      options: ['Konvolyutsion filtrlar', 'Self-Attention (Oʻz-oʻziga eʼtibor) mexanizmi', 'Rekurrent xotira katakchalari', 'Qarorlar daraxti'],
      correctAnswer: 1,
      explanation: 'Self-Attention barcha tokenlar oʻrtasidagi kontekstual bogʻliqlikni parallel ravishda hisoblaydi.'
    }
  ]
};

export const generateAIQuiz = async (
  topic: string,
  difficulty: Difficulty = 'medium',
  count: number = 5
): Promise<Question[]> => {
  const apiKey = getStoredGeminiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `"${topic}" mavzusi va "${difficulty}" qiyinchilik darajasi bo'yicha ${count} ta ko'p variantli (multiple-choice) test savollarini strictly O'ZBEK TILIDA yaratib ber.
Javob faqat STRICT JSON massivi ko'rinishida bo'lsin:
[
  {
    "id": "q1",
    "question": "Savol matni O'zbek tilida?",
    "options": ["Variant A O'zbekcha", "Variant B O'zbekcha", "Variant C O'zbekcha", "Variant D O'zbekcha"],
    "correctAnswer": 0,
    "explanation": "Qisqa tushuntirish O'zbek tilida"
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: Question[] = JSON.parse(cleanJson);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q, idx) => ({
          ...q,
          id: `ai_gen_${Date.now()}_${idx}`,
          correctAnswer: Number(q.correctAnswer) || 0
        }));
      }
    } catch (err) {
      console.warn('Gemini API soʻrovi muvaffaqiyatsiz boʻldi, standart savollarga oʻtildi:', err);
    }
  }

  const baseQuestions = PRESET_SUBJECT_QUESTIONS['programming'];
  return [...baseQuestions].sort(() => 0.5 - Math.random()).slice(0, count);
};

export const getAIOpponentChoice = (
  correctAnswer: number,
  optionCount: number,
  botDifficulty: Difficulty
): { chosenAnswer: number; delayMs: number } => {
  let accuracyRate = 0.75;
  let minDelay = 1800;
  let maxDelay = 3800;

  if (botDifficulty === 'easy') {
    accuracyRate = 0.55;
    minDelay = 2500;
    maxDelay = 5000;
  } else if (botDifficulty === 'hard') {
    accuracyRate = 0.88;
    minDelay = 1200;
    maxDelay = 2800;
  }

  const isCorrect = Math.random() < accuracyRate;
  let chosenAnswer = correctAnswer;

  if (!isCorrect) {
    const wrongOptions = Array.from({ length: optionCount }, (_, i) => i).filter(i => i !== correctAnswer);
    chosenAnswer = wrongOptions[Math.floor(Math.random() * wrongOptions.length)] ?? 0;
  }

  const delayMs = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  return { chosenAnswer, delayMs };
};

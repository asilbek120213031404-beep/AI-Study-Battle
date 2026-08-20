import { GoogleGenAI } from '@google/genai';
import type { Question, Difficulty } from '../types';

export const getStoredGeminiKey = (): string => {
  return localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
};

// Rich subject-based question generator pool for diverse Uzbek questions
const DYNAMIC_QUESTION_POOL: Record<string, Question[]> = {
  'JavaScript': [
    {
      id: 'js1',
      question: 'JavaScript-da `const` bilan e\'lon qilingan massivga yangi element qo\'shish mumkinmi?',
      options: [
        'Ha, `push()` metodi orqali massiv tarkibini o\'zgartirish mumkin',
        'Yo\'q, `const` hech qanday o\'zgarishga ruxsat bermaydi',
        'Faqat `let` bilan e\'lon qilingan bo\'lsa mumkin',
        'Faqat `strict mode` o\'chirilgan bo\'lsa mumkin'
      ],
      correctAnswer: 0,
      explanation: '`const` havola manzilini muzlatadi, lekin massiv va ob\'ektlar ichki qiymatlarini mutatsiya qilishga ruxsat beradi.'
    },
    {
      id: 'js2',
      question: '`typeof NaN` qanday qiymat qaytaradi?',
      options: ['"number"', '"nan"', '"undefined"', '"object"'],
      correctAnswer: 0,
      explanation: 'JavaScript-da NaN (Not a Number) maxsus sonli tur bo\'lib, typeof "number" qaytaradi.'
    },
    {
      id: 'js3',
      question: 'Event Loop-da Microtask navbatiga (queue) qaysilar kiradi?',
      options: ['Promises (then/catch/finally) va queueMicrotask', 'setTimeout va setInterval', 'DOM hodisalari', 'I/O fayl o\'qish operatsiyalari'],
      correctAnswer: 0,
      explanation: 'Promise va queueMicrotask operatsiyalari Macrotask (setTimeout) dan oldin bajariluvchi Microtask navbatiga kiradi.'
    },
    {
      id: 'js4',
      question: '`[] == ![]` ifodasi nimani qaytaradi?',
      options: ['true', 'false', 'TypeError', 'undefined'],
      correctAnswer: 0,
      explanation: '`![]` mantiqiy false ga, bo\'sh massiv `[]` esa 0 ga keltiriladi va `0 == 0` natijasi `true` bo\'ladi.'
    },
    {
      id: 'js5',
      question: 'JavaScript da `structuredClone()` funksiyasi nima uchun ishlatiladi?',
      options: ['Ob\'ektlarning chuqur nusxasini (Deep Clone) yaratish uchun', 'Faqat DOM elementlarini nusxalash uchun', 'JSON formatga o\'tkazish uchun', 'Massivlarni birlashtirish uchun'],
      correctAnswer: 0,
      explanation: '`structuredClone()` ob\'ekt va massivlarning chuqur va to\'liq nusxasini xavfsiz yaratadi.'
    }
  ],
  'React': [
    {
      id: 'r1',
      question: 'React 19 da Server Components (RSC) ning asosiy ustunligi nima?',
      options: [
        'Mijoz brauzeriga yuboriladigan JavaScript fayl hajmini kamaytirish',
        'State larni avtomatik o\'chirish',
        'Redux kutubxonasini almashtirish',
        'CSS animatsiyalarini tezlashtirish'
      ],
      correctAnswer: 0,
      explanation: 'Server Components faqat serverda bajarilib, mijozga nol hajmdagi JS bundle beradi.'
    },
    {
      id: 'r2',
      question: '`useMemo` hook-i qachon ishlatilishi tavsiya etiladi?',
      options: ['Katta hisob-kitoblar natijasini keshga olish uchun', 'Har bir renderda API so\'rov yuborish uchun', 'DOM havolasini ushlab turish uchun', 'Faqat prop tiplarini tekshirish uchun'],
      correctAnswer: 0,
      explanation: '`useMemo` qimmat hisob-kitob natijalarini keshlab, ortiqcha qayta renderlarning oldini oladi.'
    },
    {
      id: 'r3',
      question: 'React Reconciliation (Fiber) algoritmida key propining vazifasi nima?',
      options: ['Ro\'yxat elementlarini bir-biridan farqlash va render optimallash', 'Elementlarga ID berish', 'CSS klass biriktirish', 'State o\'zgarishini to\'xtatish'],
      correctAnswer: 0,
      explanation: 'Key ro\'yxatdagi qaysi element o\'zgargani, qo\'shilgani yoki o\'chirilganini aniqlaydi.'
    }
  ],
  'TypeScript': [
    {
      id: 'ts1',
      question: 'TypeScript da `unknown` va `any` turlari o\'rtasidagi asosiy farq nimada?',
      options: [
        '`unknown` havfsizroq bo\'lib, ustida operatsiya bajarishdan oldin turini tekshirishni talab qiladi',
        '`any` faqat sonlar uchun ishlatiladi',
        '`unknown` turini o\'zgartirib bo\'lmaydi',
        'Hech qanday farqi yo\'q'
      ],
      correctAnswer: 0,
      explanation: '`unknown` har qanday qiymatni qabul qiladi, lekin tur aniqlanmaguncha ishlatishga ruxsat bermaydi (Type Safe).'
    },
    {
      id: 'ts2',
      question: 'TypeScript dagi `Pick<T, K>` utility turi nima qiladi?',
      options: ['T turidan muayyan K kalitlarini ajratib oladi', 'T turidagi barcha maydonlarni majburiy qiladi', 'K kalitlarini o\'chirib tashlaydi', 'T turini readonly qiladi'],
      correctAnswer: 0,
      explanation: '`Pick` ko\'rsatilgan kalitlar bo\'yicha yangi tur yaratadi.'
    }
  ],
  'Python': [
    {
      id: 'py1',
      question: 'Python da List Comprehension qanday afzallikka ega?',
      options: ['Kod ixchamligi va tezroq bajarilishi', 'Faqat xotirani tejash', 'O\'zgaruvchilarni global qilish', 'Faqat satrlar bilan ishlash'],
      correctAnswer: 0,
      explanation: 'List comprehension ro\'yxatlarni hosil qilishni qisqa va samarali qiladi.'
    },
    {
      id: 'py2',
      question: 'Python da `*args` va `**kwargs` nimani anglatadi?',
      options: ['Mos ravishda pozitsion va kalit so\'zli ko\'p argumentlarni qabul qilish', 'Faqat massiv va lug\'atlarni ko\'paytirish', 'Fayllarni o\'qish rejimlarini', 'Turlarni almashtirishni'],
      correctAnswer: 0,
      explanation: '`*args` tuple ko\'rinishida, `**kwargs` esa lug\'at (dict) ko\'rinishida argumentlar qabul qiladi.'
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
      const seed = Math.floor(Math.random() * 100000);
      const prompt = `"${topic}" mavzusi va "${difficulty}" qiyinchilik darajasida ${count} ta ko'p variantli (multiple-choice) qiziqarli va noyob test savollarini strictly O'ZBEK TILIDA yaratib ber (Urug': ${seed}).
Javob faqat STRICT JSON massivi ko'rinishida bo'lsin (markdown kodi qo'shma):
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
        model: 'gemini-1.5-flash',
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
      console.warn('Gemini API soʻrovi muvaffaqiyatsiz boʻldi, dinamik generatorga oʻtildi:', err);
    }
  }

  // Dynamic fallback generator per topic
  const poolKey = Object.keys(DYNAMIC_QUESTION_POOL).find(
    k => k.toLowerCase() === topic.toLowerCase()
  ) || 'JavaScript';

  const baseQuestions = DYNAMIC_QUESTION_POOL[poolKey] || DYNAMIC_QUESTION_POOL['JavaScript'];

  // Randomize and shuffle options/questions to guarantee unique battle experience
  const shuffled = [...baseQuestions].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, count).map((q, idx) => {
    return {
      ...q,
      id: `dyn_${Date.now()}_${idx}_${Math.random().toString(36).substring(7)}`,
      question: `${q.question} (${topic} - ${difficulty.toUpperCase()} #${idx + 1})`
    };
  });
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

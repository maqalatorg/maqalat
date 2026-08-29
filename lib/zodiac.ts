/** Western zodiac (الأبراج الفلكية) by Gregorian birth date. */

export type Zodiac = {
  key: string;
  nameAr: string;
  nameEn: string;
  symbol: string; // Unicode astrological symbol
  element: "نار" | "تراب" | "هواء" | "ماء";
  fromMonth: number;
  fromDay: number;
  toMonth: number;
  toDay: number;
  traitsAr: string;
};

export const ZODIACS: Zodiac[] = [
  { key: "aries", nameAr: "الحمل", nameEn: "Aries", symbol: "♈", element: "نار", fromMonth: 3, fromDay: 21, toMonth: 4, toDay: 19, traitsAr: "قيادي، مبادر، شجاع" },
  { key: "taurus", nameAr: "الثور", nameEn: "Taurus", symbol: "♉", element: "تراب", fromMonth: 4, fromDay: 20, toMonth: 5, toDay: 20, traitsAr: "صبور، موثوق، عملي" },
  { key: "gemini", nameAr: "الجوزاء", nameEn: "Gemini", symbol: "♊", element: "هواء", fromMonth: 5, fromDay: 21, toMonth: 6, toDay: 20, traitsAr: "فضولي، تواصلي، سريع البديهة" },
  { key: "cancer", nameAr: "السرطان", nameEn: "Cancer", symbol: "♋", element: "ماء", fromMonth: 6, fromDay: 21, toMonth: 7, toDay: 22, traitsAr: "حسّاس، عاطفي، ولوف" },
  { key: "leo", nameAr: "الأسد", nameEn: "Leo", symbol: "♌", element: "نار", fromMonth: 7, fromDay: 23, toMonth: 8, toDay: 22, traitsAr: "واثق، كريم، طَموح" },
  { key: "virgo", nameAr: "العذراء", nameEn: "Virgo", symbol: "♍", element: "تراب", fromMonth: 8, fromDay: 23, toMonth: 9, toDay: 22, traitsAr: "دقيق، منظّم، عملي" },
  { key: "libra", nameAr: "الميزان", nameEn: "Libra", symbol: "♎", element: "هواء", fromMonth: 9, fromDay: 23, toMonth: 10, toDay: 22, traitsAr: "عادل، دبلوماسي، جمالي" },
  { key: "scorpio", nameAr: "العقرب", nameEn: "Scorpio", symbol: "♏", element: "ماء", fromMonth: 10, fromDay: 23, toMonth: 11, toDay: 21, traitsAr: "قوي، عميق، غامض" },
  { key: "sagittarius", nameAr: "القوس", nameEn: "Sagittarius", symbol: "♐", element: "نار", fromMonth: 11, fromDay: 22, toMonth: 12, toDay: 21, traitsAr: "مغامر، متفائل، صريح" },
  { key: "capricorn", nameAr: "الجدي", nameEn: "Capricorn", symbol: "♑", element: "تراب", fromMonth: 12, fromDay: 22, toMonth: 1, toDay: 19, traitsAr: "منضبط، طموح، مسؤول" },
  { key: "aquarius", nameAr: "الدلو", nameEn: "Aquarius", symbol: "♒", element: "هواء", fromMonth: 1, fromDay: 20, toMonth: 2, toDay: 18, traitsAr: "مبتكر، مستقل، إنساني" },
  { key: "pisces", nameAr: "الحوت", nameEn: "Pisces", symbol: "♓", element: "ماء", fromMonth: 2, fromDay: 19, toMonth: 3, toDay: 20, traitsAr: "حالم، رقيق، فنّي" },
];

export function getZodiac(date: Date): Zodiac {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  for (const z of ZODIACS) {
    if (z.fromMonth === z.toMonth) {
      if (m === z.fromMonth && d >= z.fromDay && d <= z.toDay) return z;
    } else {
      // Capricorn wraps year end
      if ((m === z.fromMonth && d >= z.fromDay) || (m === z.toMonth && d <= z.toDay)) return z;
    }
  }
  return ZODIACS[0];
}

/** Chinese zodiac (الأبراج الصينية) by birth year. Approximation: Chinese
 *  New Year varies (late Jan – mid Feb). We use Feb 4 as the average cutoff. */

export type ChineseZodiac = {
  key: string;
  nameAr: string;
  nameEn: string;
  symbol: string; // Unicode animal emoji-free alt: fallback letter
  traitsAr: string;
};

export const CHINESE_ZODIACS: ChineseZodiac[] = [
  { key: "rat",     nameAr: "الفأر",     nameEn: "Rat",     symbol: "鼠", traitsAr: "ذكي، متكيّف، سريع البديهة" },
  { key: "ox",      nameAr: "الثور",     nameEn: "Ox",      symbol: "牛", traitsAr: "مجتهد، صبور، موثوق" },
  { key: "tiger",   nameAr: "النمر",     nameEn: "Tiger",   symbol: "虎", traitsAr: "شجاع، مغامر، جذّاب" },
  { key: "rabbit",  nameAr: "الأرنب",    nameEn: "Rabbit",  symbol: "兔", traitsAr: "لطيف، دبلوماسي، فنّان" },
  { key: "dragon",  nameAr: "التنين",   nameEn: "Dragon",  symbol: "龍", traitsAr: "طَموح، كاريزماتي، محظوظ" },
  { key: "snake",   nameAr: "الأفعى",   nameEn: "Snake",   symbol: "蛇", traitsAr: "حكيم، غامض، عميق" },
  { key: "horse",   nameAr: "الحصان",   nameEn: "Horse",   symbol: "馬", traitsAr: "طليق، مفعم بالحياة، اجتماعي" },
  { key: "goat",    nameAr: "الماعز",   nameEn: "Goat",    symbol: "羊", traitsAr: "لطيف، رقيق، عاطفي" },
  { key: "monkey",  nameAr: "القرد",     nameEn: "Monkey",  symbol: "猴", traitsAr: "ذكي، فضولي، مرح" },
  { key: "rooster", nameAr: "الديك",     nameEn: "Rooster", symbol: "雞", traitsAr: "واثق، صريح، منظّم" },
  { key: "dog",     nameAr: "الكلب",    nameEn: "Dog",     symbol: "狗", traitsAr: "وفي، مخلص، حنون" },
  { key: "pig",     nameAr: "الخنزير",  nameEn: "Pig",     symbol: "豬", traitsAr: "كريم، صادق، طيّب" },
];

// 2020 = Rat. Use year % 12 with offset 4 (since 2020 % 12 = 4 → Rat, index 0).
export function getChineseZodiac(date: Date): ChineseZodiac {
  let year = date.getFullYear();
  // If birthday is before ~Feb 4, use previous Chinese year
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if (m === 1 || (m === 2 && d < 4)) year -= 1;
  const idx = ((year - 2020) % 12 + 12) % 12;
  return CHINESE_ZODIACS[idx];
}

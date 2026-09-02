/**
 * Hijri (Umm al-Qura) ↔ Gregorian conversion — pure browser/Node runtime.
 * Uses Intl.DateTimeFormat with the Umm al-Qura calendar (Saudi Arabia standard).
 * No external library needed.
 */

export type HijriDate = { year: number; month: number; day: number };

/** Format a Gregorian JS Date as Umm al-Qura parts. */
export function gregorianToHijri(date: Date): HijriDate {
  const fmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    numberingSystem: "latn",
    timeZone: "Asia/Riyadh",
  });
  const parts = fmt.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  return {
    year: parseInt(get("year"), 10),
    month: parseInt(get("month"), 10),
    day: parseInt(get("day"), 10),
  };
}

const HIJRI_MONTHS_AR = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

export function hijriMonthName(m: number): string {
  return HIJRI_MONTHS_AR[m - 1] ?? "";
}

/**
 * Convert a Hijri date to Gregorian by searching a ±60-day window
 * around an approximate Gregorian anchor.
 * Accurate for all Umm al-Qura dates (1300 AH – 1500 AH).
 */
export function hijriToGregorian(h: HijriDate): Date {
  // Rough anchor: Hijri year 1 = 622-07-16 CE. Hijri year is ~354.367 days.
  const approx = new Date(Date.UTC(622, 6, 16));
  approx.setUTCDate(
    approx.getUTCDate() +
      Math.round((h.year - 1) * 354.367 + (h.month - 1) * 29.53 + (h.day - 1)),
  );
  // Refine by iterating ±60 days until Umm al-Qura output matches target
  for (let offset = -60; offset <= 60; offset++) {
    const candidate = new Date(approx.getTime() + offset * 86400000);
    const g = gregorianToHijri(candidate);
    if (g.year === h.year && g.month === h.month && g.day === h.day) {
      return candidate;
    }
  }
  return approx; // fallback (should not happen for valid inputs)
}

/** Format a Gregorian date in Arabic (long form). */
export function formatGregorianAr(date: Date): string {
  return new Intl.DateTimeFormat("ar-SA-u-nu-latn-ca-gregory", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(date);
}

/** Format a Hijri date in Arabic (long form). */
export function formatHijriAr(date: Date): string {
  const h = gregorianToHijri(date);
  return `${h.day} ${hijriMonthName(h.month)} ${h.year}هـ`;
}

/** Format day-of-week in Arabic (السبت، الأحد…). */
export function formatWeekdayAr(date: Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
    timeZone: "Asia/Riyadh",
  }).format(date);
}

/**
 * Saudi weekend adjustment for government payment dates.
 *
 * Official MoF rule (mof.gov.sa 2026 payroll schedule):
 *   - Friday (day 5)   → Thursday BEFORE (subtract 1 day)
 *   - Saturday (day 6) → Sunday AFTER  (add 1 day)
 *
 * This matches the published behaviour for salary payments, retiree
 * pensions, and Citizen Account (ca.gov.sa published 2024+).
 * Some legacy sources only mention the Thursday-before rule; the
 * unified rule above is what the Ministry of Finance actually applies.
 */
export function adjustForSaudiWeekend(date: Date): Date {
  const day = date.getDay();
  if (day === 5) return new Date(date.getTime() - 86400000); // Fri → Thu
  if (day === 6) return new Date(date.getTime() + 86400000); // Sat → Sun
  return date;
}

/** Given a Hijri (year, month), return the Gregorian date of a specific Hijri day. */
export function hijriDayToGregorian(hijriYear: number, hijriMonth: number, day: number): Date {
  return hijriToGregorian({ year: hijriYear, month: hijriMonth, day });
}

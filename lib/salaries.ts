/**
 * Saudi salary + government payment schedules.
 *
 * Sources verified 2026-09-02:
 *   - Government employee salary: 27 of every GREGORIAN month
 *     (Ministry of Finance official schedule — mof.gov.sa/mediacenter/Payroll)
 *   - GOSI retirement pensions:   1 of every GREGORIAN month
 *     (Unified since May 1, 2024 — Saudi Gazette + GOSI announcement)
 *   - Citizen Account:            10 of every GREGORIAN month (ca.gov.sa)
 *   - Developed Social Security:  1 of every GREGORIAN month (hrsd.gov.sa)
 *   - Old Social Security:        8 of every HIJRI month (legacy — for
 *     beneficiaries who did not migrate to the developed programme)
 *
 * Sanad (تعويض التعطّل) is administered by GOSI. Its exact monthly
 * disbursement date is not published officially in the same way; we
 * omit it from the calendar until we can cite a primary source.
 *
 * Weekend rule (adjustForSaudiWeekend in ./hijri.ts):
 *   Friday   → Thursday BEFORE
 *   Saturday → Sunday   AFTER
 */

import { adjustForSaudiWeekend, gregorianToHijri, hijriDayToGregorian } from "./hijri";

export type PaymentType = {
  id: string;
  nameAr: string;
  shortAr: string;
  calendar: "hijri" | "gregorian";
  day: number;
  colorClass: string; // Tailwind bg utility for the pill
};

export const PAYMENT_TYPES: PaymentType[] = [
  {
    id: "gov_salary",
    nameAr: "راتب الموظف الحكومي",
    shortAr: "الراتب",
    calendar: "gregorian",
    day: 27,
    colorClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  {
    id: "retirement",
    nameAr: "رواتب المتقاعدين (التأمينات)",
    shortAr: "المتقاعدين",
    calendar: "gregorian",
    day: 1,
    colorClass: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  },
  {
    id: "citizen_account",
    nameAr: "حساب المواطن",
    shortAr: "حساب المواطن",
    calendar: "gregorian",
    day: 10,
    colorClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    id: "social_security",
    nameAr: "الضمان الاجتماعي المطوّر",
    shortAr: "الضمان",
    calendar: "gregorian",
    day: 1,
    colorClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  },
  {
    id: "old_pension",
    nameAr: "معاش الضمان القديم",
    shortAr: "الضمان القديم",
    calendar: "hijri",
    day: 8,
    colorClass: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  },
];

export type Payment = {
  type: PaymentType;
  date: Date; // adjusted (post-weekend rule)
  rawDate: Date; // pre-weekend adjustment
};

/**
 * Return N months of upcoming payment dates for all payment types.
 * Automatically drops past dates.
 */
export function getUpcomingPayments(now: Date, monthsAhead = 12): Payment[] {
  const results: Payment[] = [];
  const startHijri = gregorianToHijri(now);

  for (const type of PAYMENT_TYPES) {
    if (type.calendar === "hijri") {
      for (let i = 0; i < monthsAhead + 1; i++) {
        let month = startHijri.month + i;
        let year = startHijri.year;
        while (month > 12) {
          month -= 12;
          year += 1;
        }
        const raw = hijriDayToGregorian(year, month, type.day);
        const adjusted = adjustForSaudiWeekend(raw);
        if (adjusted >= startOfDay(now)) {
          results.push({ type, date: adjusted, rawDate: raw });
        }
      }
    } else {
      // Gregorian
      for (let i = 0; i < monthsAhead + 1; i++) {
        const raw = new Date(now.getFullYear(), now.getMonth() + i, type.day);
        const adjusted = adjustForSaudiWeekend(raw);
        if (adjusted >= startOfDay(now)) {
          results.push({ type, date: adjusted, rawDate: raw });
        }
      }
    }
  }

  return results
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, PAYMENT_TYPES.length * monthsAhead);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Milliseconds → "X يوم Y ساعة Z دقيقة". */
export function formatCountdown(ms: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds };
}

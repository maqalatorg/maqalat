/**
 * Saudi + Islamic events used for countdown tools.
 * Islamic events use Hijri anchors; Saudi civic use Gregorian.
 */

import { adjustForSaudiWeekend, gregorianToHijri, hijriDayToGregorian } from "./hijri";

export type Event = {
  id: string;
  nameAr: string;
  shortAr: string;
  descAr: string;
  calendar: "hijri" | "gregorian";
  // Hijri events use (month, day). Gregorian events use (month, day) in current year.
  month: number;
  day: number;
  colorClass: string;
};

export const EVENTS: Event[] = [
  {
    id: "ramadan",
    nameAr: "شهر رمضان المبارك",
    shortAr: "رمضان",
    descAr: "شهر الصيام والقيام — أول أيام رمضان (١ رمضان هجرياً)",
    calendar: "hijri",
    month: 9,
    day: 1,
    colorClass: "from-emerald-500 to-emerald-800",
  },
  {
    id: "eid_fitr",
    nameAr: "عيد الفطر المبارك",
    shortAr: "عيد الفطر",
    descAr: "أول أيام شوّال بعد نهاية شهر رمضان",
    calendar: "hijri",
    month: 10,
    day: 1,
    colorClass: "from-amber-500 to-amber-700",
  },
  {
    id: "hajj",
    nameAr: "يوم الوقوف بعرفة",
    shortAr: "يوم عرفة",
    descAr: "٩ ذي الحجة — يوم الحج الأكبر",
    calendar: "hijri",
    month: 12,
    day: 9,
    colorClass: "from-teal-500 to-teal-800",
  },
  {
    id: "eid_adha",
    nameAr: "عيد الأضحى المبارك",
    shortAr: "عيد الأضحى",
    descAr: "١٠ ذي الحجة — يوم النحر",
    calendar: "hijri",
    month: 12,
    day: 10,
    colorClass: "from-orange-500 to-red-700",
  },
  {
    id: "hijri_new_year",
    nameAr: "رأس السنة الهجرية",
    shortAr: "رأس السنة الهجرية",
    descAr: "١ محرم — بداية السنة الهجرية الجديدة",
    calendar: "hijri",
    month: 1,
    day: 1,
    colorClass: "from-indigo-500 to-indigo-800",
  },
  {
    id: "national_day",
    nameAr: "اليوم الوطني السعودي",
    shortAr: "اليوم الوطني",
    descAr: "٢٣ سبتمبر — ذكرى توحيد المملكة العربية السعودية",
    calendar: "gregorian",
    month: 9,
    day: 23,
    colorClass: "from-emerald-600 to-emerald-900",
  },
  {
    id: "founding_day",
    nameAr: "يوم التأسيس السعودي",
    shortAr: "يوم التأسيس",
    descAr: "٢٢ فبراير — ذكرى تأسيس الدولة السعودية الأولى",
    calendar: "gregorian",
    month: 2,
    day: 22,
    colorClass: "from-blue-600 to-blue-900",
  },
  {
    id: "gregorian_new_year",
    nameAr: "رأس السنة الميلادية",
    shortAr: "السنة الميلادية",
    descAr: "١ يناير — بداية السنة الميلادية الجديدة",
    calendar: "gregorian",
    month: 1,
    day: 1,
    colorClass: "from-purple-500 to-purple-800",
  },
];

export type EventOccurrence = {
  event: Event;
  date: Date; // adjusted (some Saudi civic days shift to weekday when they fall on Fri/Sat — but Hijri religious days do NOT shift)
  rawDate: Date;
};

/** Compute the next upcoming occurrence of an event from `now`. */
export function nextOccurrence(event: Event, now: Date): EventOccurrence {
  if (event.calendar === "hijri") {
    const nowH = gregorianToHijri(now);
    // Try current Hijri year first, then next year
    for (let yearOffset = 0; yearOffset < 3; yearOffset++) {
      const year = nowH.year + yearOffset;
      const raw = hijriDayToGregorian(year, event.month, event.day);
      if (raw >= startOfDay(now)) {
        return { event, date: raw, rawDate: raw };
      }
    }
  } else {
    for (let yearOffset = 0; yearOffset < 3; yearOffset++) {
      const raw = new Date(
        now.getFullYear() + yearOffset,
        event.month - 1,
        event.day,
      );
      if (raw >= startOfDay(now)) {
        return { event, date: raw, rawDate: raw };
      }
    }
  }
  const fallback = new Date(now);
  return { event, date: fallback, rawDate: fallback };
}

/** Next occurrences for all events, sorted ascending. */
export function getAllUpcomingEvents(now: Date): EventOccurrence[] {
  return EVENTS.map((e) => nextOccurrence(e, now)).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

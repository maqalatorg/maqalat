"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Calendar, Clock } from "lucide-react";
import { gregorianToHijri, hijriMonthName, formatWeekdayAr } from "@/lib/hijri";

const GREGORIAN_MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const GREGORIAN_MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi’ al-Awwal", "Rabi’ al-Thani",
  "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha’ban",
  "Ramadan", "Shawwal", "Dhu al-Qi’dah", "Dhu al-Hijjah",
];

function daysInGregorianMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate();
}

function formatWeekdayEn(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Asia/Riyadh",
  }).format(date);
}

export function CurrentDate() {
  const locale = useLocale();
  const isAr = locale !== "en";

  // Seed with a stable initial timestamp; refresh on client mount and every minute.
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const h = gregorianToHijri(now);
  const gDay = now.getDate();
  const gMonth = now.getMonth() + 1;
  const gYear = now.getFullYear();

  const gMonthName = isAr ? GREGORIAN_MONTHS_AR[gMonth - 1] : GREGORIAN_MONTHS_EN[gMonth - 1];
  const hMonthName = isAr ? hijriMonthName(h.month) : HIJRI_MONTHS_EN[h.month - 1];

  const gRemaining = daysInGregorianMonth(gYear, gMonth) - gDay;

  const weekday = isAr ? formatWeekdayAr(now) : formatWeekdayEn(now);

  const time = new Intl.DateTimeFormat(isAr ? "ar-SA" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh",
  }).format(now);

  const L = isAr
    ? {
        today: "اليوم",
        gregorianLabel: "الميلادي",
        hijriLabel: "الهجري (أم القرى)",
        monthOf: (m: number, y: number | string) => `الشهر ${m} من ${y}`,
        summaryPrefix: "التاريخ اليوم:",
        gregSuffix: "م",
        hijrSuffix: "هـ",
        currentMonthMil: (m: number, name: string) => `الشهر الميلادي رقم ${m} (${name})`,
        currentMonthHij: (m: number, name: string) => `الشهر الهجري رقم ${m} (${name})`,
        remaining: (n: number) => `متبقّي من الشهر الميلادي ${n} يوماً`,
        timeLabel: "توقيت الرياض",
        umm: "بيانات أم القرى الرسمية",
      }
    : {
        today: "Today",
        gregorianLabel: "Gregorian",
        hijriLabel: "Hijri (Umm al-Qura)",
        monthOf: (m: number, y: number | string) => `Month ${m} of ${y}`,
        summaryPrefix: "Today:",
        gregSuffix: "CE",
        hijrSuffix: "AH",
        currentMonthMil: (m: number, name: string) => `Gregorian month ${m} (${name})`,
        currentMonthHij: (m: number, name: string) => `Hijri month ${m} (${name})`,
        remaining: (n: number) => `${n} days remaining in the Gregorian month`,
        timeLabel: "Riyadh time",
        umm: "Official Umm al-Qura data",
      };

  return (
    <div className="not-prose my-8 space-y-4" suppressHydrationWarning>
      {/* Hero: weekday + time */}
      <div className="card p-6 md:p-8 text-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-950/30 border-emerald-200 dark:border-emerald-800">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3">
          <Calendar className="w-3.5 h-3.5" />
          {L.today}
        </div>
        <div className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
          {weekday}
        </div>
        <div className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
          <Clock className="w-3.5 h-3.5" />
          {time} · {L.timeLabel}
        </div>
      </div>

      {/* Two big date cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-6 md:p-8">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">
            {L.gregorianLabel}
          </div>
          <div className="flex items-baseline gap-3 mb-2">
            <div className="text-5xl md:text-6xl font-black text-slate-900 dark:text-slate-100 tabular-nums leading-none">
              {gDay}
            </div>
            <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {gMonthName}
            </div>
          </div>
          <div className="text-base text-slate-600 dark:text-slate-400 tabular-nums">
            {L.monthOf(gMonth, gYear)}
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">
            {L.hijriLabel}
          </div>
          <div className="flex items-baseline gap-3 mb-2">
            <div className="text-5xl md:text-6xl font-black text-slate-900 dark:text-slate-100 tabular-nums leading-none">
              {h.day}
            </div>
            <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {hMonthName}
            </div>
          </div>
          <div className="text-base text-slate-600 dark:text-slate-400 tabular-nums">
            {L.monthOf(h.month, `${h.year}${isAr ? "هـ" : " AH"}`)}
          </div>
        </div>
      </div>

      {/* Reference strip */}
      <div className="card p-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        <strong className="text-slate-900 dark:text-slate-100">{L.summaryPrefix}</strong>{" "}
        {weekday}
        {isAr ? "، " : ", "}
        {isAr ? `${gDay} ${gMonthName} ${gYear} ${L.gregSuffix}` : `${gMonthName} ${gDay}, ${gYear} ${L.gregSuffix}`}
        {" — "}
        {isAr ? `${h.day} ${hMonthName} ${h.year}${L.hijrSuffix}` : `${h.day} ${hMonthName} ${h.year} ${L.hijrSuffix}`}
        {". "}
        {L.currentMonthMil(gMonth, gMonthName)}
        {isAr ? "، و" : ", "}
        {L.currentMonthHij(h.month, hMonthName)}
        {". "}
        {L.remaining(gRemaining)}
        {"."}
        <span className="block mt-2 text-xs text-slate-500 dark:text-slate-500">
          {L.umm} · Intl.DateTimeFormat / islamic-umalqura
        </span>
      </div>
    </div>
  );
}

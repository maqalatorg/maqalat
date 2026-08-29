"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { formatCountdown } from "@/lib/salaries";
import { EVENTS, nextOccurrence, getAllUpcomingEvents } from "@/lib/events";
import { formatGregorianAr, formatHijriAr, formatWeekdayAr } from "@/lib/hijri";

/**
 * Live countdown to a single Saudi/Islamic event OR to all events if `all` prop.
 * Usage in MDX:
 *   <EventCountdown eventId="ramadan" />
 *   <EventCountdown all />
 */
export function EventCountdown({
  eventId,
  all,
}: {
  eventId?: string;
  all?: boolean;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!now) return <div className="card p-6 animate-pulse h-40" />;

  if (all) {
    const occurrences = getAllUpcomingEvents(now);
    return (
      <div className="not-prose space-y-4 my-8">
        {occurrences.map((occ) => (
          <CountdownCard key={occ.event.id} occurrence={occ} now={now} compact />
        ))}
      </div>
    );
  }

  const event = EVENTS.find((e) => e.id === eventId);
  if (!event) return null;
  const occ = nextOccurrence(event, now);
  return (
    <div className="not-prose my-8">
      <CountdownCard occurrence={occ} now={now} />
    </div>
  );
}

function CountdownCard({
  occurrence,
  now,
  compact,
}: {
  occurrence: ReturnType<typeof nextOccurrence>;
  now: Date;
  compact?: boolean;
}) {
  const ms = occurrence.date.getTime() - now.getTime();
  const { days, hours, minutes, seconds } = formatCountdown(ms);
  const isToday = days === 0 && hours >= 0;

  const { event, date } = occurrence;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${event.colorClass} text-white p-5 sm:p-6 shadow-card`}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -end-16 -bottom-16 w-56 h-56 rounded-full border-2 border-white" />
        <div className="absolute -end-8 -bottom-8 w-40 h-40 rounded-full border-2 border-white" />
      </div>

      <div className="relative flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur grid place-items-center shrink-0">
          <CalendarClock className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs opacity-90">القادم</div>
          <div className={`font-bold ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}>
            {event.nameAr}
          </div>
          <div className="mt-1 text-sm opacity-90">
            {formatGregorianAr(date)} · {formatWeekdayAr(date)}
            {event.calendar === "hijri" && (
              <> · <span className="opacity-80">{formatHijriAr(date)}</span></>
            )}
          </div>
        </div>
      </div>

      {isToday ? (
        <div className="relative mt-5 text-center py-3 bg-white/15 backdrop-blur rounded-xl font-bold text-lg">
          اليوم! 🎉
        </div>
      ) : (
        <div
          className={`relative mt-5 grid grid-cols-4 gap-2 text-center ${
            compact ? "text-sm" : ""
          }`}
        >
          {[
            { label: "يوم", value: days },
            { label: "ساعة", value: hours },
            { label: "دقيقة", value: minutes },
            { label: "ثانية", value: seconds },
          ].map((u) => (
            <div key={u.label} className="bg-white/15 backdrop-blur rounded-xl p-2 sm:p-3">
              <div className={`font-bold tabular-nums ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}>
                {String(u.value).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-[11px] opacity-80 mt-0.5">{u.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

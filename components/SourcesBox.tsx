import { ShieldCheck } from "lucide-react";

type SourceLink = { label: string; url: string };

type Props = {
  sources: SourceLink[];
  lastVerified?: string;
  locale?: "ar" | "en";
  ymyl?: boolean;
};

export function SourcesBox({ sources, lastVerified, locale = "ar", ymyl = false }: Props) {
  const isEn = locale === "en";
  const titleText = isEn ? "Verified against official sources" : "مصادر التحقّق الرسميّة";
  const verifiedText = isEn ? "Last verified" : "آخر تحقّق";
  const ymylText = isEn
    ? "This article is informational. For a legal, medical, or financial decision, consult a licensed professional or the responsible authority directly."
    : "المقال إعلامي. للقرار القانوني أو الطبّي أو المالي، راجع مختصّاً مرخّصاً أو الجهة المسؤولة مباشرة.";

  return (
    <aside
      className="not-prose my-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30 p-5"
      dir={isEn ? "ltr" : "rtl"}
    >
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 m-0">
          {titleText}
        </h3>
      </div>
      <ul className="text-sm space-y-1.5 mb-0 list-disc list-inside marker:text-emerald-600">
        {sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-800 dark:text-emerald-300 hover:underline"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
      {lastVerified && (
        <p className="mt-3 text-xs text-emerald-800/80 dark:text-emerald-300/80 mb-0">
          {verifiedText}: <time dateTime={lastVerified}>{lastVerified}</time>
        </p>
      )}
      {ymyl && (
        <p className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-900/50 text-xs text-slate-700 dark:text-slate-300 mb-0 leading-relaxed">
          {ymylText}
        </p>
      )}
    </aside>
  );
}

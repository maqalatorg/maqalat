"use client";

import { Mail, Send, Check } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Props = {
  variant?: "card" | "inline";
  source?: string;
};

export function NewsletterSignup({ variant = "card", source = "site" }: Props) {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t("invalidEmail"));
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: trimmed, locale, source }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("sent");
        setEmail("");
      } else {
        setStatus("error");
        setError(
          data.error === "not_configured"
            ? t("serviceUnavailable")
            : t("genericError"),
        );
      }
    } catch {
      setStatus("error");
      setError(t("genericError"));
    }
  };

  const isCard = variant === "card";
  const wrapperClass = isCard
    ? "mt-16 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-8 sm:p-10 text-center"
    : "mt-8 border-t border-slate-200 dark:border-slate-800 pt-8";

  return (
    <section aria-labelledby="newsletter-title" className={wrapperClass}>
      {isCard && (
        <div className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 mb-4">
          <Mail className="w-7 h-7 text-emerald-700 dark:text-emerald-400" strokeWidth={2.2} />
        </div>
      )}
      <h3
        id="newsletter-title"
        className={
          isCard
            ? "text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3"
            : "text-lg font-bold text-slate-900 dark:text-slate-100 mb-2"
        }
      >
        {t("title")}
      </h3>
      <p
        className={
          isCard
            ? "text-slate-600 dark:text-slate-400 mb-6 max-w-lg mx-auto"
            : "text-sm text-slate-600 dark:text-slate-400 mb-4"
        }
      >
        {t("description")}
      </p>

      {status === "sent" ? (
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-bold">
          <Check className="w-4 h-4" strokeWidth={2.4} />
          {t("success")}
        </div>
      ) : (
        <form
          onSubmit={submit}
          className={
            isCard
              ? "max-w-md mx-auto flex flex-col sm:flex-row gap-2"
              : "flex flex-col sm:flex-row gap-2 max-w-md"
          }
        >
          <input
            type="email"
            required
            placeholder={t("placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "sending"}
            className="flex-1 px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            aria-label={t("placeholder")}
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors disabled:opacity-60"
          >
            <Send className="w-4 h-4" strokeWidth={2.2} />
            {status === "sending" ? t("sending") : t("subscribe")}
          </button>
        </form>
      )}

      {error && (
        <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}

      <p
        className={
          isCard ? "mt-4 text-xs text-slate-500" : "mt-3 text-xs text-slate-500"
        }
      >
        {t("privacy")}
      </p>
    </section>
  );
}

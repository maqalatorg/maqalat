import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const path = locale === "ar" ? "/contact" : `/${locale}/contact`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${SITE_URL}${path}` },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactBody />;
}

function ContactBody() {
  const t = useTranslations("contact");
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          {t("h1")}
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
          {t("subtitle")}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="mailto:maqalatorg@gmail.com"
          className="card p-6 hover:no-underline group"
        >
          <Mail className="w-8 h-8 text-emerald-600 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
            {t("emailCardTitle")}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t("emailCardBody")}
          </p>
          <p className="mt-3 text-emerald-700 dark:text-emerald-400 font-mono text-sm">
            maqalatorg@gmail.com
          </p>
        </a>

        <div className="card p-6">
          <MessageCircle className="w-8 h-8 text-emerald-600 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t("commentsCardTitle")}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t("commentsCardBody")}
          </p>
        </div>
      </div>

      <section className="mt-12 card p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          {t("errorTitle")}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {t("errorBody")}
        </p>
      </section>
    </article>
  );
}

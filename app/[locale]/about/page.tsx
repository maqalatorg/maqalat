import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const path = locale === "ar" ? "/about" : `/${locale}/about`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${SITE_URL}${path}` },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutBody />;
}

function AboutBody() {
  const t = useTranslations("about");
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose-maqalat">
      <h1 className="text-4xl font-extrabold mb-4">{t("h1")}</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400">
        {t.rich("intro", { b: (chunks) => <strong>{chunks}</strong> })}
      </p>

      <h2>{t("missionTitle")}</h2>
      <p>{t("missionBody")}</p>

      <h2>{t("whyTitle")}</h2>
      <ul>
        <li>{t.rich("whyItem1", { b: (chunks) => <strong>{chunks}</strong> })}</li>
        <li>{t.rich("whyItem2", { b: (chunks) => <strong>{chunks}</strong> })}</li>
        <li>{t.rich("whyItem3", { b: (chunks) => <strong>{chunks}</strong> })}</li>
        <li>{t.rich("whyItem4", { b: (chunks) => <strong>{chunks}</strong> })}</li>
      </ul>

      <h2>{t("whoTitle")}</h2>
      <p>
        {t.rich("whoBody", {
          b: (chunks) => <strong>{chunks}</strong>,
          link: (chunks) => <Link href="/methodology">{chunks}</Link>,
        })}
      </p>

      <h2>{t("contactTitle")}</h2>
      <p>
        {t.rich("contactBody", {
          link: (chunks) => <Link href="/contact">{chunks}</Link>,
        })}
      </p>

      <h2>{t("policyTitle")}</h2>
      <p>
        {t.rich("policyBody", {
          link: (chunks) => <Link href="/editorial-policy">{chunks}</Link>,
        })}
      </p>
    </article>
  );
}

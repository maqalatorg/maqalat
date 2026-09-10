import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Arabic stays at / (preserves existing indexed URLs).
  // English routes are prefixed with /en.
  localePrefix: "as-needed",
  // Suppress next-intl's blanket Link-header hreflang emission. It ignores
  // whether the target locale-URL actually exists, so AR-only articles get
  // hreflang="en" pointing to a 404 /en/{slug} — Ahrefs flags 178 pages.
  // We emit hreflang deliberately per-page from generateMetadata after
  // checking hasEnglishVersion (article) or knowing both exist (cluster,
  // static, sitemap).
  alternateLinks: false,
});

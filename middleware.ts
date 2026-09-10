import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware({
  ...routing,
  // Don't auto-redirect based on browser Accept-Language — keeps AR URLs stable.
  // Users switch via the LanguageSwitcher component.
  localeDetection: false,
  // Disable next-intl's automatic Link-header hreflang emission. It adds
  // <.../en/{path}>; rel="alternate"; hreflang="en" for EVERY response,
  // even for AR articles whose EN sibling doesn't exist — Ahrefs then flags
  // them as "Hreflang to redirect or broken page" (178 pages).
  // We emit hreflang exactly where warranted from generateMetadata in each
  // page (articles gate on hasEnglishVersion; static + cluster pages both
  // exist for both locales, so they always emit both).
  alternateLinks: false,
});

export const config = {
  matcher: [
    // Match everything except Next.js internals, API routes, static assets, and
    // SEO/system files that must not be locale-rewritten (sitemap, robots, ads.txt,
    // IndexNow 32-char hex key file).
    "/((?!api|admin|_next/static|_next/image|favicon\\.ico|icon|apple-icon|opengraph-image|og-default|sitemap\\.xml|robots\\.txt|ads\\.txt|[a-f0-9]{32}\\.txt|fonts).*)",
  ],
};

import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware({
  ...routing,
  // Don't auto-redirect based on browser Accept-Language — keeps AR URLs stable.
  // Users switch via the LanguageSwitcher component.
  localeDetection: false,
});

export const config = {
  matcher: [
    // Match everything except Next.js internals, API routes, static assets, and
    // SEO/system files that must not be locale-rewritten (sitemap, robots, ads.txt).
    "/((?!api|_next/static|_next/image|favicon\\.ico|icon|apple-icon|opengraph-image|og-default|sitemap\\.xml|robots\\.txt|ads\\.txt|fonts).*)",
  ],
};

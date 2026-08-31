import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Arabic stays at / (preserves existing indexed URLs).
  // English routes are prefixed with /en.
  localePrefix: "as-needed",
});

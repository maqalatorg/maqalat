const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://maqalat.org";
const CONTACT_EMAIL = "maqalatorg@gmail.com";

export type AuthorKind = "person" | "team";

export type Author = {
  slug: string;
  kind: AuthorKind;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  bioAr: string;
  bioEn: string;
  sameAs?: string[];
  email?: string;
  image?: string;
};

export const AUTHORS: Record<string, Author> = {
  founder: {
    slug: "founder",
    kind: "team",
    nameAr: "فريق مقالات",
    nameEn: "Maqalat Editorial Team",
    roleAr: "",
    roleEn: "",
    bioAr:
      "فريق التحرير المسؤول عن محتوى مقالات. كل ادعاء إجرائي أو قانوني أو مالي يُراجَع من مصدر رسمي أوّلي ويُذكر داخل النصّ، وفق سياستنا التحريرية.",
    bioEn:
      "The editorial team responsible for Maqalat's content. Every procedural, legal, or financial claim is verified against an official primary source and cited inline, per our editorial policy.",
    sameAs: [],
    email: CONTACT_EMAIL,
  },
};

export function getAuthor(slug: string): Author | null {
  return AUTHORS[slug] ?? null;
}

export function authorProfileUrl(slug: string, locale: "ar" | "en" = "ar"): string {
  return locale === "ar"
    ? `${SITE_URL}/author/${slug}`
    : `${SITE_URL}/en/author/${slug}`;
}

export function authorName(a: Author, locale: "ar" | "en"): string {
  return locale === "en" ? a.nameEn : a.nameAr;
}

export function authorRole(a: Author, locale: "ar" | "en"): string {
  return locale === "en" ? a.roleEn : a.roleAr;
}

export function authorBio(a: Author, locale: "ar" | "en"): string {
  return locale === "en" ? a.bioEn : a.bioAr;
}

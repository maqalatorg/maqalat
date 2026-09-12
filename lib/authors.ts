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
    roleAr: "فريق التحرير — مقالات",
    roleEn: "Editorial Team — Maqalat",
    bioAr:
      "فريق التحرير المسؤول عن محتوى مقالات. نغطّي الخدمات الحكومية السعودية، الجامعات، الصحّة العامّة، الفقه المالي، والذكاء الاصطناعي. كل ادعاء إجرائي أو قانوني أو مالي أو طبّي يُراجَع من مصدر رسمي أوّلي (وزارة/هيئة/جامعة/دورية طبّية محكّمة) ويُذكر بالرابط داخل النصّ. لا نستخدم Mayo Clinic (تحجب الكراولرز) — بديلنا Harvard Nutrition Source و WHO و NIH و ACOG و NICE. حين نعجز عن التحقّق نكتب صراحة: «لم نجد مصدراً رسمياً محدَّثاً — راجع الجهة». المقالات الطبّية والمالية تحمل تحذير سلامة وتدعو لمراجعة المختصّ.",
    bioEn:
      "The editorial team responsible for Maqalat's content. We cover Saudi government services, universities, public health, Islamic finance, and artificial intelligence. Every procedural, legal, financial, or medical claim is verified against an official primary source (ministry, authority, university, or peer-reviewed medical journal) and cited inline. We do not cite Mayo Clinic (it blocks crawlers) — our substitutes are Harvard Nutrition Source, WHO, NIH, ACOG, and NICE. When verification fails we say so explicitly: 'no updated official source found — consult the authority directly.' Medical and financial articles carry a safety notice directing readers to consult a licensed professional.",
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

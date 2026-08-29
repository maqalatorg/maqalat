/**
 * Cluster (topic) registry — single source of truth for site navigation
 * and category pages. Add a cluster here to expose it globally.
 */

export type Cluster = {
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  icon: string; // lucide-react icon name (rendered dynamically in Header)
  emoji: string; // fallback / social display
  enabled: boolean;
};

export const CLUSTERS: Cluster[] = [
  {
    slug: "calendar",
    titleAr: "التقويم والمناسبات",
    titleEn: "Calendar & Events",
    descriptionAr: "التحويل الهجري الميلادي، الإجازات الرسمية، والمواعيد الفلكية في السعودية.",
    icon: "CalendarDays",
    emoji: "📅",
    enabled: true,
  },
  {
    slug: "universities",
    titleAr: "الجامعات والتعليم",
    titleEn: "Universities & Education",
    descriptionAr: "شروط القبول، التخصصات، الرسوم، وشرح نظام نور.",
    icon: "GraduationCap",
    emoji: "🎓",
    enabled: true,
  },
  {
    slug: "health",
    titleAr: "الصحة والمكمّلات",
    titleEn: "Health & Supplements",
    descriptionAr: "معلومات موثّقة عن الفيتامينات، المكمّلات، والصحة العامة — بمصادر رسمية.",
    icon: "HeartPulse",
    emoji: "❤️",
    enabled: false, // يُفعَّل بعد ٣ شهور — يحتاج E-E-A-T عالٍ
  },
  {
    slug: "finance",
    titleAr: "المال والاستثمار",
    titleEn: "Finance & Investment",
    descriptionAr: "الأسهم السعودية والأمريكية، العملات الرقمية، والادخار.",
    icon: "TrendingUp",
    emoji: "💹",
    enabled: false,
  },
  {
    slug: "cars",
    titleAr: "السيارات",
    titleEn: "Cars",
    descriptionAr: "دليل قطع الغيار، مقارنات الموديلات، وصيانة السيارات.",
    icon: "Car",
    emoji: "🚗",
    enabled: false,
  },
  {
    slug: "tutorials",
    titleAr: "الشروحات",
    titleEn: "Tutorials",
    descriptionAr: "شرح خطوة-بخطوة لأشهر التطبيقات والخدمات الحكومية.",
    icon: "BookOpen",
    emoji: "📖",
    enabled: false,
  },
  {
    slug: "websites",
    titleAr: "المواقع والتطبيقات",
    titleEn: "Websites & Apps",
    descriptionAr: "مراجعات وتوصيات للمواقع والتطبيقات المفيدة.",
    icon: "Globe",
    emoji: "🌐",
    enabled: false,
  },
  {
    slug: "fabrics",
    titleAr: "الأقمشة",
    titleEn: "Fabrics",
    descriptionAr: "دليل أنواع الأقمشة، الخامات، والاختيار الأمثل.",
    icon: "Shirt",
    emoji: "🧵",
    enabled: false,
  },
];

export const ENABLED_CLUSTERS = CLUSTERS.filter((c) => c.enabled);

export function findCluster(slug: string): Cluster | undefined {
  return CLUSTERS.find((c) => c.slug === slug);
}

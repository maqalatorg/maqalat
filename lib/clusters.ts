/**
 * Cluster (topic) registry — single source of truth for site navigation
 * and category pages. Add a cluster here to expose it globally.
 */

export type Cluster = {
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string; // lucide-react icon name (mapped in ClusterIcon.tsx)
  enabled: boolean;
};

export const CLUSTERS: Cluster[] = [
  {
    slug: "calendar",
    titleAr: "التقويم والمناسبات",
    titleEn: "Calendar & Events",
    descriptionAr: "التحويل الهجري الميلادي، الإجازات الرسمية، والمواعيد الفلكية في السعودية.",
    descriptionEn: "Hijri–Gregorian conversion, official holidays, and astronomical dates for Saudi Arabia.",
    icon: "CalendarDays",
    enabled: true,
  },
  {
    slug: "universities",
    titleAr: "الجامعات والتعليم",
    titleEn: "Universities & Education",
    descriptionAr: "شروط القبول، التخصصات، الرسوم، وشرح نظام نور.",
    descriptionEn: "Admissions, majors, tuition, and the Noor system explained.",
    icon: "GraduationCap",
    enabled: true,
  },
  {
    slug: "health",
    titleAr: "الصحة والحاسبات الطبية",
    titleEn: "Health & Medical Calculators",
    descriptionAr: "حاسبات صحية موثّقة (كتلة الجسم، الحمل، الدورة الشهرية) ومعلومات طبية عامة بمصادر رسمية.",
    descriptionEn: "Trusted medical calculators (BMI, pregnancy, menstrual cycle) and general health info from primary authorities.",
    icon: "HeartPulse",
    enabled: true,
  },
  {
    slug: "finance",
    titleAr: "المال والاستثمار",
    titleEn: "Finance & Investment",
    descriptionAr: "الأسهم السعودية والأمريكية، العملات الرقمية، والادخار.",
    descriptionEn: "Saudi and US equities, crypto, and personal saving.",
    icon: "TrendingUp",
    enabled: false,
  },
  {
    slug: "cars",
    titleAr: "السيارات",
    titleEn: "Cars",
    descriptionAr: "دليل قطع الغيار، مقارنات الموديلات، وصيانة السيارات.",
    descriptionEn: "Parts guides, model comparisons, and maintenance.",
    icon: "Car",
    enabled: false,
  },
  {
    slug: "tutorials",
    titleAr: "الشروحات",
    titleEn: "Tutorials",
    descriptionAr: "شرح خطوة-بخطوة لأشهر التطبيقات والخدمات الحكومية.",
    descriptionEn: "Step-by-step walkthroughs for popular apps and government services.",
    icon: "BookOpen",
    enabled: false,
  },
  {
    slug: "ai",
    titleAr: "الذكاء الاصطناعي",
    titleEn: "Artificial Intelligence",
    descriptionAr: "دليل عملي لأدوات الذكاء الاصطناعي، هندسة البرومت، ChatGPT وGemini وClaude، والاستخدام في العمل والمحتوى.",
    descriptionEn: "Practical guide to AI tools, prompt engineering, ChatGPT, Gemini, Claude, and their use in work and content.",
    icon: "Sparkles",
    enabled: true,
  },
  {
    slug: "websites",
    titleAr: "المواقع والتطبيقات",
    titleEn: "Websites & Apps",
    descriptionAr: "مراجعات وتوصيات للمواقع والتطبيقات المفيدة.",
    descriptionEn: "Reviews and recommendations for useful websites and apps.",
    icon: "Globe",
    enabled: false,
  },
  {
    slug: "fabrics",
    titleAr: "الأقمشة",
    titleEn: "Fabrics",
    descriptionAr: "دليل أنواع الأقمشة، الخامات، والاختيار الأمثل.",
    descriptionEn: "Fabric types, materials, and how to choose the right one.",
    icon: "Shirt",
    enabled: false,
  },
];

export const ENABLED_CLUSTERS = CLUSTERS.filter((c) => c.enabled);

export function findCluster(slug: string): Cluster | undefined {
  return CLUSTERS.find((c) => c.slug === slug);
}

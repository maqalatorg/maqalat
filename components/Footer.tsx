import Link from "next/link";
import { ENABLED_CLUSTERS } from "@/lib/clusters";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-cream-50/50 dark:bg-slate-950/50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-2">
              مقالات
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              مرجعك الحديث لكل ما تحتاج معرفته — محتوى عربي أصيل، مصادره رسمية، بلا فبركة.
            </p>
          </div>

          {/* Clusters */}
          <div>
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-3">
              الأقسام
            </div>
            <ul className="space-y-2 text-sm">
              {ENABLED_CLUSTERS.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/c/${c.slug}`}
                    className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    {c.titleAr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-3">
              الموقع
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy" className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                  سياستنا التحريرية
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>© {year} مقالات · جميع الحقوق محفوظة</div>
          <div>
            صُنع بحب في السعودية · maqalat.org
          </div>
        </div>
      </div>
    </footer>
  );
}

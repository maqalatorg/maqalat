import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "طرق التواصل مع فريق مقالات.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          تواصل معنا
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
          نرحّب باقتراحاتك، ملاحظاتك، وتصحيحاتك في أي وقت.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="mailto:maqalatorg@gmail.com"
          className="card p-6 hover:no-underline group"
        >
          <Mail className="w-8 h-8 text-emerald-600 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
            البريد الإلكتروني
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            نرد على كل رسالة خلال ٤٨ ساعة
          </p>
          <p className="mt-3 text-emerald-700 dark:text-emerald-400 font-mono text-sm">
            maqalatorg@gmail.com
          </p>
        </a>

        <div className="card p-6">
          <MessageCircle className="w-8 h-8 text-emerald-600 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            التعليقات على المقالات
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            يمكنك التعليق مباشرة أسفل أي مقال — نراجع كل تعليق ونرد على الأسئلة الجادة.
          </p>
        </div>
      </div>

      <section className="mt-12 card p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          هل رصدت خطأ في مقال؟
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          نحن جادون في دقّة كل ادعاء. إن رصدت معلومة خاطئة، رقماً غير محدَّث، أو مصدراً مكسوراً — أرسل لنا فوراً على البريد أعلاه مع رابط المقال ومكان الخطأ. سنُصحّحه ونشكرك في ذيل المقال.
        </p>
      </section>
    </article>
  );
}

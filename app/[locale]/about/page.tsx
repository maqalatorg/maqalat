import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "من نحن",
  description: "تعرّف على مقالات — من نحن، لماذا نكتب، وما مبادئنا التحريرية.",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose-maqalat">
      <h1 className="text-4xl font-extrabold mb-4">من نحن</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400">
        مرحباً بك في <strong>مقالات</strong> — منصّة عربية مرجعية تُقدّم محتوى موثّقاً في مواضيع شتّى: التقويم والمناسبات، الجامعات والتعليم، الصحة، الماليات، السيارات، وأكثر.
      </p>

      <h2>مهمتنا</h2>
      <p>
        نؤمن أن المستخدم العربي يستحق مرجعاً معاصراً يحترم عقله، ويقدّم له معلومات دقيقة بمصادر رسمية بدلاً من محتوى مُعاد تدويره. مهمتنا: تسهيل الوصول إلى المعرفة الموثوقة بلغة عربية أصيلة.
      </p>

      <h2>لماذا مقالات؟</h2>
      <ul>
        <li><strong>مصادر رسمية موثّقة</strong> لكل ادعاء رقمي أو طبي أو قانوني.</li>
        <li><strong>لغة عربية أصيلة</strong> — لا ترجمة آلية، لا نصوص ركيكة.</li>
        <li><strong>تحديث دوري</strong> للمعلومات الحسّاسة كالتواريخ والرسوم والأنظمة.</li>
        <li><strong>شفافية كاملة</strong> — نُوضّح مصادرنا، ونعترف بما لا نعرفه.</li>
      </ul>

      <h2>من يكتب هنا؟</h2>
      <p>
        فريق تحريري متنوّع الخلفيات، يجمعنا التزام واحد: <strong>لا نكتب إلا ما نستطيع إثباته</strong>. كل ادعاء يمرّ بمراجعة، وكل رقم يُوثَّق بمصدره.
      </p>

      <h2>تواصل معنا</h2>
      <p>
        هل لديك اقتراح، ملاحظة، أو تصحيح؟ زر <Link href="/contact">صفحة التواصل</Link>. نرحّب بكل ملاحظة — خصوصاً التصحيحات.
      </p>

      <h2>سياستنا</h2>
      <p>
        اطّلع على <Link href="/editorial-policy">سياستنا التحريرية</Link> لفهم كيف نختار المواضيع، وكيف نتحقّق من المعلومات، وكيف نتعامل مع الأخطاء.
      </p>
    </article>
  );
}

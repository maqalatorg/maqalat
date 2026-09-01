import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const path = isEn ? "/en/terms" : "/terms";
  return {
    title: isEn ? "Terms of Use" : "شروط الاستخدام",
    description: isEn
      ? "Terms of use for the Maqalat website."
      : "شروط استخدام موقع مقالات.",
    alternates: { canonical: `${SITE_URL}${path}` },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === "en";
  const dateStr = new Date().toLocaleDateString(isEn ? "en-US" : "ar-SA");

  if (isEn) {
    return (
      <article className="max-w-3xl mx-auto px-4 py-12 prose-maqalat">
        <h1 className="text-4xl font-extrabold mb-2">Terms of Use</h1>
        <p className="text-sm text-slate-500">Last updated: {dateStr}</p>

        <h2>Acceptance</h2>
        <p>
          By using <strong>Maqalat</strong>, you accept these terms. If you do not accept them, please do not use the site.
        </p>

        <h2>Purpose</h2>
        <p>
          The site offers general informational content for reference. Content is <strong>not a substitute</strong> for professional medical, legal, or financial advice.
        </p>

        <h2>Intellectual property</h2>
        <p>
          All written content is protected by copyright. Short quotes are permitted with attribution and a link to the original. Full copying without written permission is prohibited.
        </p>

        <h2>Comments</h2>
        <p>
          By posting a comment, you grant us the right to publish and edit it for editorial or moderation reasons. We reserve the right to remove any comment that contains:
        </p>
        <ul>
          <li>Abuse or offensive content</li>
          <li>Promotional content or spam</li>
          <li>Personal information about others</li>
          <li>Content in violation of applicable law</li>
        </ul>

        <h2>Limits of liability</h2>
        <p>
          We make our best effort to ensure accuracy, but we do not guarantee it absolutely. We are not liable for decisions you make based on site content without verifying against official sources.
        </p>

        <h2>External links</h2>
        <p>
          The site may contain links to other websites. We are not responsible for their content or policies.
        </p>

        <h2>Changes</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of the site after any change constitutes acceptance of the new terms.
        </p>
      </article>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose-maqalat">
      <h1 className="text-4xl font-extrabold mb-2">شروط الاستخدام</h1>
      <p className="text-sm text-slate-500">آخر تحديث: {dateStr}</p>

      <h2>القبول بالشروط</h2>
      <p>
        باستخدامك لموقع <strong>مقالات</strong>، فإنك توافق على هذه الشروط. إن لم توافق، يُرجى عدم استخدام الموقع.
      </p>

      <h2>الغرض من الموقع</h2>
      <p>
        الموقع يُقدّم محتوى معلوماتياً عاماً بغرض الفائدة والاطّلاع فقط. المحتوى <strong>ليس بديلاً</strong> عن الاستشارة المتخصّصة في المجالات الطبية، القانونية، أو الاستثمارية.
      </p>

      <h2>الملكية الفكرية</h2>
      <p>
        كل المحتوى المكتوب على الموقع محمي بحقوق الملكية الفكرية. يُسمح باقتباس فقرات قصيرة مع الإشارة للمصدر ورابط للمقال الأصلي. النسخ الكامل ممنوع بلا إذن مكتوب.
      </p>

      <h2>التعليقات</h2>
      <p>
        بكتابة تعليق، فإنك تمنحنا حق نشره وتحريره لأسباب تحريرية أو تنظيمية. نحتفظ بحق حذف أي تعليق يحتوي على:
      </p>
      <ul>
        <li>سباب أو محتوى مسيء</li>
        <li>محتوى دعائي أو سبام</li>
        <li>معلومات شخصية لأطراف أخرى</li>
        <li>محتوى مخالف للأنظمة السعودية</li>
      </ul>

      <h2>حدود المسؤولية</h2>
      <p>
        نبذل جهدنا لضمان دقة المعلومات، لكن لا نضمنها بشكل مطلق. لا نتحمّل مسؤولية أي قرار تتّخذه بناءً على محتوى الموقع دون التحقّق من المصادر الرسمية.
      </p>

      <h2>الروابط الخارجية</h2>
      <p>
        قد يحتوي الموقع على روابط لمواقع أخرى. لسنا مسؤولين عن محتوى أو سياسات تلك المواقع.
      </p>

      <h2>التعديلات</h2>
      <p>
        نحتفظ بحق تعديل هذه الشروط في أي وقت. الاستمرار في استخدام الموقع بعد التعديل يعني قبولك للشروط الجديدة.
      </p>
    </article>
  );
}

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
  const path = isEn ? "/en/privacy" : "/privacy";
  return {
    title: isEn ? "Privacy Policy" : "سياسة الخصوصية",
    description: isEn
      ? "How Maqalat collects and uses your data."
      : "كيف نجمع ونستخدم بياناتك على موقع مقالات.",
    alternates: { canonical: `${SITE_URL}${path}` },
  };
}

export default async function PrivacyPage({
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
        <h1 className="text-4xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: {dateStr}</p>

        <h2>What we collect</h2>
        <p>We collect the minimum needed to run the site:</p>
        <ul>
          <li><strong>Anonymous browsing data</strong> (Google Analytics + Vercel Analytics): browser type, pages visited, referrer, country.</li>
          <li><strong>Comments</strong>: the name and email you voluntarily enter to post a comment. Your email is <strong>never shown</strong> and never contacted — it exists only to reduce spam.</li>
          <li><strong>Ratings</strong>: stored anonymously with no personal identifier.</li>
          <li><strong>Cookies</strong>: used to remember preferences (dark mode, your article rating).</li>
        </ul>

        <h2>Advertising (Google AdSense)</h2>
        <p>
          We use <strong>Google AdSense</strong> to display ads. Google may use cookies to show ads based on your prior visits to this site or others.
        </p>
        <p>
          You can turn off personalised ads at Google Ads Settings:{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            google.com/settings/ads
          </a>
        </p>

        <h2>Third-party services</h2>
        <ul>
          <li><strong>Vercel</strong> — site hosting.</li>
          <li><strong>Cloudflare</strong> — CDN and protection.</li>
          <li><strong>Google Firebase</strong> — storage for comments and ratings.</li>
          <li><strong>Google Analytics + Vercel Analytics</strong> — traffic analytics.</li>
          <li><strong>Google AdSense</strong> — advertising.</li>
          <li><strong>Resend</strong> — newsletter subscription storage and delivery.</li>
        </ul>

        <h2>Your rights</h2>
        <p>
          You can request deletion of any comment you wrote, or ask about your data. Reach us via the <a href="/en/contact">contact page</a> or email: <code>maqalatorg@gmail.com</code>.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The latest change date is shown above. Continued use of the site after any change constitutes acceptance of the new policy.
        </p>
      </article>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose-maqalat">
      <h1 className="text-4xl font-extrabold mb-2">سياسة الخصوصية</h1>
      <p className="text-sm text-slate-500">آخر تحديث: {dateStr}</p>

      <h2>ما البيانات التي نجمعها؟</h2>
      <p>نجمع الحد الأدنى من البيانات لتشغيل الموقع:</p>
      <ul>
        <li><strong>بيانات التصفّح المجهولة</strong> (Google Analytics + Vercel Analytics): نوع المتصفح، الصفحات المزارة، مصدر الزيارة، الدولة.</li>
        <li><strong>التعليقات</strong>: الاسم والإيميل الذي تُدخله طوعياً لكتابة تعليق. الإيميل <strong>لا يُنشر</strong> ولا يُرسل إليه شيء — يُستخدم فقط لمنع الإزعاج.</li>
        <li><strong>التقييمات</strong>: نحفظ تقييمك مجهولاً بلا معرّف شخصي.</li>
        <li><strong>ملفات تعريف الارتباط (Cookies)</strong>: تُستخدم لحفظ تفضيلاتك (الوضع الليلي، تقييمك للمقال).</li>
      </ul>

      <h2>الإعلانات (Google AdSense)</h2>
      <p>
        نستخدم <strong>Google AdSense</strong> لعرض الإعلانات. جوجل قد يستخدم ملفات تعريف الارتباط لعرض إعلانات ذات صلة بناءً على زياراتك السابقة لهذا الموقع أو مواقع أخرى.
      </p>
      <p>
        يمكنك إيقاف الإعلانات المخصّصة من إعدادات إعلانات جوجل:{" "}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
          google.com/settings/ads
        </a>
      </p>

      <h2>خدمات الطرف الثالث</h2>
      <ul>
        <li><strong>Vercel</strong> — استضافة الموقع.</li>
        <li><strong>Cloudflare</strong> — CDN وحماية.</li>
        <li><strong>Google Firebase</strong> — تخزين التعليقات والتقييمات.</li>
        <li><strong>Google Analytics + Vercel Analytics</strong> — إحصاءات الزيارة.</li>
        <li><strong>Google AdSense</strong> — الإعلانات.</li>
        <li><strong>Resend</strong> — تخزين اشتراكات النشرة وإرسالها.</li>
      </ul>

      <h2>حقوقك</h2>
      <p>
        لديك الحق في طلب حذف أي تعليق كتبته، أو الاستفسار عن بياناتك. تواصل معنا عبر <a href="/contact">صفحة التواصل</a> أو الإيميل: <code>maqalatorg@gmail.com</code>.
      </p>

      <h2>التغييرات على هذه السياسة</h2>
      <p>
        قد نُحدّث هذه السياسة من وقت لآخر. آخر تعديل موضّح أعلى الصفحة. الاستمرار في استخدام الموقع بعد التعديل يعني قبولك للسياسة الجديدة.
      </p>
    </article>
  );
}

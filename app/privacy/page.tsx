import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "كيف نجمع ونستخدم بياناتك على موقع مقالات.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose-maqalat">
      <h1 className="text-4xl font-extrabold mb-2">سياسة الخصوصية</h1>
      <p className="text-sm text-slate-500">آخر تحديث: {new Date().toLocaleDateString("ar-SA")}</p>

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
        يمكنك إيقاف الإعلانات المخصّصة من إعدادات إعلانات جوجل: {" "}
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

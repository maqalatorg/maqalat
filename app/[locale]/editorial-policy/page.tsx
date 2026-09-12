import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { staticPageMetadata, staticPageJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return staticPageMetadata({
    locale: locale as "ar" | "en",
    path: "/editorial-policy",
    title: isEn ? "Editorial Policy" : "السياسة التحريرية",
    description: isEn
      ? "How Maqalat picks topics, verifies sources, handles corrections, and separates opinion from reporting — a transparent policy on AI use and reader rights."
      : "كيف نختار المواضيع، نتحقّق من المصادر، نصحّح الأخطاء، ونفصل الرأي عن الخبر — سياسة تحريرية شفّافة عن استخدام الذكاء الاصطناعي وحقوق القارئ.",
  });
}

export default async function EditorialPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === "en";
  const dateStr = new Date().toLocaleDateString(isEn ? "en-US" : "ar-SA");
  const title = isEn ? "Editorial Policy" : "السياسة التحريرية";
  const description = isEn
    ? "How Maqalat picks topics, verifies sources, handles corrections, and separates opinion from reporting — a transparent policy on AI use and reader rights."
    : "كيف نختار المواضيع، نتحقّق من المصادر، نصحّح الأخطاء، ونفصل الرأي عن الخبر — سياسة تحريرية شفّافة عن استخدام الذكاء الاصطناعي وحقوق القارئ.";
  const jsonLd = staticPageJsonLd({
    type: "WebPage",
    path: isEn ? "/en/editorial-policy" : "/editorial-policy",
    title,
    description,
    locale: isEn ? "en" : "ar",
  });

  if (isEn) {
    return (
      <>
      <JsonLd data={jsonLd} />
      <article className="max-w-3xl mx-auto px-4 py-12 prose-maqalat">
        <h1 className="text-4xl font-extrabold mb-4">Editorial Policy</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Not a legal framework — a practical commitment we honour with every article we publish.
        </p>

        <h2>1. Accuracy and honesty</h2>
        <p>
          We publish no numeric, medical, legal, or financial claim without a documented official source. The sources we rely on:
        </p>
        <ul>
          <li><strong>Saudi government bodies</strong>: King Abdulaziz Center, Ministry of Education, Capital Market Authority, Communications and Information Technology Commission, Ministry of Islamic Affairs.</li>
          <li><strong>Global medical authorities</strong>: Harvard T.H. Chan School of Public Health (Nutrition Source), NIH, WHO, CDC, ACOG, Cochrane.</li>
          <li><strong>Financial sources</strong>: Tadawul, CMA, Bloomberg, Reuters.</li>
          <li><strong>Astronomy references</strong>: International Astronomy Center, NASA JPL Horizons.</li>
        </ul>

        <h2>2. Transparency</h2>
        <p>Every article states:</p>
        <ul>
          <li>Original publication date</li>
          <li>Last updated date (when applicable)</li>
          <li>Author — see <a href="/en/author/founder">the editorial team profile</a> for who publishes here.</li>
          <li>Sources used (inline links or an end-of-article list)</li>
        </ul>

        <h2>3. Honesty about limits</h2>
        <p>
          We explicitly commit to fabricating no information, number, source, or quote. When we don't know the answer, we say so plainly: <em>"No trusted source found — we'll update this when one becomes available."</em>
        </p>

        <h2>4. Use of AI</h2>
        <p>
          We use AI tools as an assistant for formatting, spellcheck, and source extraction — <strong>not as a substitute for human verification</strong>. Every article is reviewed by hand before publication. We do not publish machine-generated content without verification.
        </p>

        <h2>5. Corrections policy</h2>
        <p>If we (or you) spot an error in an article:</p>
        <ul>
          <li><strong>Major error</strong> (wrong number, misleading information): we correct it immediately and add a correction note at the end of the article.</li>
          <li><strong>Minor error</strong> (typo, punctuation): we correct it silently.</li>
          <li>The <strong>update date</strong> is shown at the top of the article after any substantive change.</li>
        </ul>
        <p>
          Email <a href="mailto:maqalatorg@gmail.com">maqalatorg@gmail.com</a> with the
          article link and where the error is — we respond within 48 hours.
        </p>

        <h2>6. Independence</h2>
        <p>
          We are editorially independent. Ads (Google AdSense) appear on the site but <strong>do not influence</strong> our content or recommendations. We do not accept payments for sponsored articles.
        </p>

        <h2>7. Links and referrals</h2>
        <p>
          Some articles include external links to sites we find useful. We are not responsible for their content. Any affiliate links are labelled explicitly as "affiliate link."
        </p>

        <h2>8. Your rights as a reader</h2>
        <ul>
          <li>Right to object to any content: email us and we will listen.</li>
          <li>Right to request a source: we provide it immediately.</li>
          <li>Right to delete your comment: fulfilled within 48 hours.</li>
        </ul>

        <h2>9. Date integrity</h2>
        <p>
          The <strong>publication date</strong> shown on every article is the actual first date the article went live on this site. We do not adjust historical publish dates to simulate organic growth or backfill an editorial calendar — Google's Publisher Policies explicitly prohibit misrepresentation, and readers deserve accurate temporal context, especially in fast-moving areas like AI and government regulations.
        </p>
        <p>
          Where relevant, we display a separate <strong>"last updated"</strong> date that reflects a genuine substantive revision (new facts, corrected numbers, updated sources). We never rewrite the past to make content look newer than it is.
        </p>

        <p className="mt-8 text-slate-500 italic">
          This policy is a living document — we update it whenever we learn something new. Last updated: {dateStr}.
        </p>
      </article>
      </>
    );
  }

  return (
    <>
    <JsonLd data={jsonLd} />
    <article className="max-w-3xl mx-auto px-4 py-12 prose-maqalat">
      <h1 className="text-4xl font-extrabold mb-4">السياسة التحريرية</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400">
        هذه السياسة ليست إطاراً قانونياً — بل التزام أخلاقي وعملي نلتزم به مع كل مقال ننشره.
      </p>

      <h2>١. الدقة والصدق</h2>
      <p>لا ننشر أي ادعاء رقمي، طبي، قانوني، أو مالي بلا مصدر رسمي موثّق. المصادر التي نعتمدها:</p>
      <ul>
        <li><strong>الجهات الحكومية السعودية</strong>: مركز الملك عبدالعزيز للحوار الوطني، وزارة التعليم، هيئة السوق المالية، هيئة الاتصالات، وزارة الشؤون الإسلامية…</li>
        <li><strong>الجهات الطبية العالمية</strong>: Harvard T.H. Chan School of Public Health (Nutrition Source)، NIH، WHO، CDC، ACOG، Cochrane.</li>
        <li><strong>الجهات المالية</strong>: تداول، هيئة السوق المالية، Bloomberg، Reuters.</li>
        <li><strong>مصادر البحث الفلكي</strong>: مركز الفلك الدولي، NASA JPL Horizons.</li>
      </ul>

      <h2>٢. الشفافية</h2>
      <p>كل مقال يذكر:</p>
      <ul>
        <li>تاريخ النشر الأصلي</li>
        <li>تاريخ آخر تحديث (إن وُجد)</li>
        <li>الكاتب — راجع <a href="/author/founder">صفحة فريق التحرير</a> لمعرفة من ينشر هنا.</li>
        <li>المصادر المستخدَمة (كروابط في المتن أو قائمة نهاية)</li>
      </ul>

      <h2>٣. الصدق والاعتراف بالحدود</h2>
      <p>
        نلتزم صراحةً بعدم اختلاق أي معلومة، رقم، مصدر، أو مقولة. إن لم نعرف الإجابة، نقولها بوضوح: <em>«لم نجد مصدراً موثوقاً — سنحدّث المقال عند التوفّر».</em>
      </p>

      <h2>٤. استخدام الذكاء الاصطناعي</h2>
      <p>
        نستخدم أدوات الذكاء الاصطناعي كمساعد في التنسيق، المراجعة الإملائية، واستخراج الأفكار من المصادر — <strong>لا كبديل عن التحقّق البشري</strong>. كل مقال يُراجَع يدوياً قبل النشر. لا نستخدم محتوى AI مولّد آلياً بلا تحقّق.
      </p>

      <h2>٥. سياسة التصحيح</h2>
      <p>إذا رصدنا (أو رصدت أنت) خطأً في مقال:</p>
      <ul>
        <li><strong>خطأ فادح</strong> (رقم خاطئ، معلومة مضلّلة): نُصحّحه فوراً + ملاحظة تصحيح في نهاية المقال.</li>
        <li><strong>خطأ طفيف</strong> (إملاء، ترقيم): نُصحّحه صامتاً.</li>
        <li>نُوضّح <strong>تاريخ التحديث</strong> في أعلى المقال بعد كل تصحيح جوهري.</li>
      </ul>
      <p>
        أرسل رابط المقال ومكان الخطأ إلى <a href="mailto:maqalatorg@gmail.com">maqalatorg@gmail.com</a>
        {" "}— نرد خلال ٤٨ ساعة.
      </p>

      <h2>٦. الاستقلالية</h2>
      <p>
        نحن مستقلّون تحريرياً. الإعلانات (Google AdSense) تظهر في الموقع لكنّها <strong>لا تؤثّر</strong> في محتوانا أو توصياتنا. لا نقبل مدفوعات مقابل مقالات مُوجَّهة.
      </p>

      <h2>٧. الروابط والإحالات</h2>
      <p>
        بعض المقالات قد تتضمّن روابط خارجية لمواقع نراها مفيدة. لسنا مسؤولين عن محتواها. أي روابط أفلييت تُوسَم صراحةً بـ«رابط تسويقي».
      </p>

      <h2>٨. حقوقك كقارئ</h2>
      <ul>
        <li>حق الاعتراض على أي محتوى: أرسل لنا وسنستمع.</li>
        <li>حق طلب المصدر: نُقدّمه فوراً.</li>
        <li>حق طلب حذف تعليقك: نُلبّي الطلب خلال ٤٨ ساعة.</li>
      </ul>

      <h2>٩. سلامة التواريخ</h2>
      <p>
        <strong>تاريخ النشر</strong> الظاهر على كل مقال هو التاريخ الفعلي الذي أصبح فيه المقال متاحاً على الموقع لأوّل مرّة. لا نُعدّل تواريخ النشر التاريخية لتبدو كأنها نمو عضوي متدرّج أو لتعبئة تقويم تحريري وهمي — سياسات ناشري Google تحظر التصريحات غير النزيهة صراحةً، والقارئ يستحقّ سياقاً زمنياً دقيقاً، خاصّة في مجالات سريعة التغيّر مثل الذكاء الاصطناعي واللوائح الحكومية.
      </p>
      <p>
        حين يوجد سبب، نُظهر <strong>«تاريخ آخر تحديث»</strong> منفصلاً يعكس مراجعة جوهرية حقيقية (وقائع جديدة، أرقام مُصحَّحة، مصادر محدَّثة). لا نُعيد كتابة الماضي لجعل المحتوى يبدو أحدث ممّا هو.
      </p>

      <p className="mt-8 text-slate-500 italic">
        هذه السياسة كائنٌ حيّ — نُحدّثها كلّما تعلّمنا شيئاً جديداً. آخر تحديث: {dateStr}.
      </p>
    </article>
    </>
  );
}

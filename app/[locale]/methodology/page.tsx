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
  const path = isEn ? "/en/methodology" : "/methodology";
  return {
    title: isEn ? "Verification Methodology" : "منهجية التحقّق",
    description: isEn
      ? "The exact process Maqalat follows to research, source, review, and publish every article — step by step."
      : "الإجراء الفعلي الذي نتّبعه لبحث كل مقال، توثيقه بمصادره، مراجعته، ونشره — خطوة خطوة.",
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        ar: `${SITE_URL}/methodology`,
        en: `${SITE_URL}/en/methodology`,
        "x-default": `${SITE_URL}/methodology`,
      },
    },
  };
}

export default async function MethodologyPage({
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
        <h1 className="text-4xl font-extrabold mb-4">Verification Methodology</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          How every Maqalat article gets from &quot;idea&quot; to &quot;published&quot; — the exact steps, in the exact order.
        </p>

        <h2>1. Topic selection</h2>
        <p>
          We publish only when we can add real value to a topic — not to fill a
          content calendar. A topic passes the first gate when we can answer
          three questions honestly:
        </p>
        <ul>
          <li>Does a Saudi or Arab reader actually search for this?</li>
          <li>Are the existing top results incomplete, outdated, or
            misleading in a way we can materially fix?</li>
          <li>Do primary sources exist that we can cite for every material
            claim we plan to make?</li>
        </ul>
        <p>If any answer is no, the topic is deferred until it is yes.</p>

        <h2>2. Source hierarchy</h2>
        <p>Not all sources are equal. We use them in this order:</p>
        <ol>
          <li>
            <strong>Primary official sources</strong> — Saudi government
            authorities (Ministry of Finance, GOSI, MoH, ETEC, ZATCA, SAMA,
            CMA), international bodies (WHO, ACOG, CDC, NIH, NICE, Cochrane,
            Harvard T.H. Chan School), and authoritative academic references.
          </li>
          <li>
            <strong>Peer-reviewed publications</strong> — journals indexed in
            Scopus / Web of Science / PubMed.
          </li>
          <li>
            <strong>Reputable secondary sources</strong> — established news
            organisations (Reuters, Bloomberg, Saudi Gazette) for factual
            reporting, never as the sole source for a claim.
          </li>
        </ol>
        <p>
          Social media posts, anonymous forums, and content-farm articles are
          not sources — they are, at most, leads to investigate through the
          hierarchy above.
        </p>

        <h2>3. What we never publish</h2>
        <ul>
          <li>Fabricated statistics, quotes, or attributions.</li>
          <li>Health, legal, or financial claims without a primary source.</li>
          <li>&quot;It is said&quot; or &quot;experts believe&quot; without a
            named source.</li>
          <li>Prices, dates, or regulations without a link to the official
            issuing body.</li>
          <li>Recycled summaries of other articles — we always work back to
            the primary source.</li>
        </ul>

        <h2>4. AI transparency</h2>
        <p>
          We use large language models as a drafting assistant — for outlining,
          rephrasing, and language polish. We do <strong>not</strong> use AI
          to invent facts or generate citations. Every source cited on this
          site was checked by a human against the linked primary source before
          publication. When we cannot verify a claim, we omit it.
        </p>

        <h2>5. YMYL articles (health, finance, law, government)</h2>
        <p>
          YMYL (&quot;Your Money or Your Life&quot;) articles carry the
          highest bar. In addition to the process above:
        </p>
        <ul>
          <li>Every clinical, legal, or financial claim is anchored to an
            inline citation, not a footnote list.</li>
          <li>A visible disclaimer clarifies that the content is educational
            and not a substitute for professional consultation.</li>
          <li>Interactive tools (BMI, pregnancy, zakat, salary calendar) are
            built on documented rules — we publish the rule and the source
            beside the tool.</li>
        </ul>

        <h2>6. Corrections and updates</h2>
        <p>
          A published article is not frozen. When a source changes (new law,
          new policy, revised guideline) or when a reader flags a mistake, we:
        </p>
        <ul>
          <li>Correct the article and update the &quot;updated&quot; date at
            the top.</li>
          <li>Note the substantive change at the end of the article.</li>
          <li>Credit the reader who flagged a material error, on request.</li>
        </ul>
        <p>
          Email <a href="mailto:maqalatorg@gmail.com">maqalatorg@gmail.com</a>
          {" "}with the article link and the error — we respond within 48 hours.
        </p>

        <h2>7. Independence</h2>
        <p>
          Advertising (Google AdSense) may appear on the site. Ads do not
          influence content selection, tone, or recommendations. No article
          is paid, sponsored, or written to promote a specific product
          without disclosure. Affiliate links, when present, are labelled
          explicitly.
        </p>

        <p className="mt-8 text-slate-500 italic">
          Last updated: {dateStr}. This methodology is a living document —
          we update it whenever the process changes.
        </p>
      </article>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose-maqalat">
      <h1 className="text-4xl font-extrabold mb-4">منهجية التحقّق</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400">
        كيف يصل مقال «مقالات» من فكرة إلى نشر — الخطوات بالترتيب الفعلي.
      </p>

      <h2>١. اختيار الموضوع</h2>
      <p>
        لا ننشر لملء تقويم — ننشر عندما نستطيع إضافة قيمة حقيقية. الموضوع يجتاز
        البوّابة الأولى إذا استطعنا الإجابة عن ثلاثة أسئلة بصدق:
      </p>
      <ul>
        <li>هل يبحث عنه قارئ سعودي/عربي فعلاً؟</li>
        <li>هل نتائج البحث الحالية ناقصة أو قديمة أو مضلّلة بشكل نستطيع إصلاحه؟</li>
        <li>هل تتوفّر مصادر رسمية أوّلية نستطيع الاستشهاد بها لكل ادعاء مادّي؟</li>
      </ul>
      <p>إن كانت الإجابة عن أيٍّ منها «لا»، يُؤجَّل الموضوع.</p>

      <h2>٢. تسلسل هرمي للمصادر</h2>
      <p>ليست كل المصادر متساوية. نستخدمها بهذا الترتيب:</p>
      <ol>
        <li>
          <strong>المصادر الرسمية الأوّلية</strong> — الجهات الحكومية السعودية
          (وزارة المالية، التأمينات، الصحة، هيئة تقويم التعليم، الزكاة والدخل،
          ساما، هيئة السوق المالية)، والهيئات الدولية (WHO، ACOG، CDC، NIH،
          NICE، Cochrane، Harvard T.H. Chan)، والمراجع الأكاديمية.
        </li>
        <li>
          <strong>الأبحاث المُحكَّمة</strong> — دوريات مفهرسة في Scopus / Web of
          Science / PubMed.
        </li>
        <li>
          <strong>المصادر الثانوية الموثوقة</strong> — وكالات الأخبار الكبرى
          (Reuters، Bloomberg، سعودي غازيت) للحقائق الخبرية فقط، لا كمصدر
          وحيد لادعاء.
        </li>
      </ol>
      <p>
        منشورات وسائل التواصل، الملتقيات، ومقالات مواقع «المحتوى الجاهز» ليست
        مصادر — هي في أفضل الأحوال دلائل نُحقّقها ثم نعود لمصدرها الأوّل.
      </p>

      <h2>٣. ما لا ننشره أبداً</h2>
      <ul>
        <li>إحصائيات مخترعة، أو اقتباسات وهمية، أو نسب مجهولة النسبة.</li>
        <li>ادعاء طبي أو قانوني أو مالي بلا مصدر رسمي.</li>
        <li>«يُقال» أو «يعتقد الخبراء» بلا اسم مصدر.</li>
        <li>أسعار أو تواريخ أو أنظمة بلا رابط للجهة الرسمية المُصدرة.</li>
        <li>ملخّصات لمقالات أخرى — نعود دائماً للمصدر الأوّلي.</li>
      </ul>

      <h2>٤. الشفافية حول الذكاء الاصطناعي</h2>
      <p>
        نستخدم نماذج اللغة الكبيرة كمساعد صياغة — للتخطيط، إعادة الصياغة، وصقل
        اللغة. لا نستخدم الذكاء الاصطناعي لاختراع حقائق أو توليد استشهادات.
        كل مصدر مُذكور في هذا الموقع تحقّق منه بشرٌ فعلياً بمقابلته بالمصدر
        الأوّلي المرتبط قبل النشر. عند تعذّر التحقّق، نحذف الادعاء.
      </p>

      <h2>٥. مقالات YMYL (صحة، مال، قانون، حكومة)</h2>
      <p>
        مقالات YMYL («مالك أو حياتك») تحمل أعلى معيار. بالإضافة للخطوات أعلاه:
      </p>
      <ul>
        <li>كل ادعاء طبي أو قانوني أو مالي مربوط باستشهاد <strong>inline</strong> بجوار الجملة، لا في قائمة مصادر أسفل.</li>
        <li>إخلاء مسؤولية مرئي يوضّح أن المحتوى تثقيفي لا بديل عن الاستشارة.</li>
        <li>الأدوات التفاعلية (BMI، الحمل، الزكاة، تقويم الرواتب) مبنيّة على قواعد موثّقة — القاعدة والمصدر منشوران بجوار الأداة.</li>
      </ul>

      <h2>٦. التصحيحات والتحديثات</h2>
      <p>
        المقال المنشور ليس مجمَّداً. عند تغيّر مصدر (قانون جديد، سياسة جديدة،
        دليل مُنقَّح) أو عند تنبيه قارئ لخطأ، نقوم بما يلي:
      </p>
      <ul>
        <li>نُصحّح المقال ونحدّث تاريخ «آخر تحديث» في أعلاه.</li>
        <li>نُشير للتغيير الجوهري في نهاية المقال.</li>
        <li>نشكر القارئ الذي رصد الخطأ الفادح، بطلبه.</li>
      </ul>
      <p>
        أرسل الرابط والخطأ إلى <a href="mailto:maqalatorg@gmail.com">maqalatorg@gmail.com</a>
        {" "}— نرد خلال ٤٨ ساعة.
      </p>

      <h2>٧. الاستقلالية</h2>
      <p>
        الإعلانات (Google AdSense) قد تظهر في الموقع. الإعلانات لا تؤثّر في
        اختيار المحتوى أو نبرته أو التوصيات. لا مقال مدفوع أو مُوجَّه لدعم منتج
        بلا إفصاح. الروابط التسويقية عند وجودها تُوسَم صراحةً.
      </p>

      <p className="mt-8 text-slate-500 italic">
        آخر تحديث: {dateStr}. هذه المنهجية كائن حيّ — نحدّثها كلّما تغيّرت
        الإجراءات.
      </p>
    </article>
  );
}

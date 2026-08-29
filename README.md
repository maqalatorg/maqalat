# مقالات — Maqalat

مدوّنة عربية مرجعية شاملة على [maqalat.org](https://maqalat.org).
محتوى موثّق بمصادر رسمية، بلا فبركة، هدفه أن يكون المرجع الحديث للعالم العربي.

## Stack

- **Next.js 16** (App Router) + React 19
- **TypeScript** + **Tailwind CSS v4**
- **MDX** (via `@next/mdx` + `next-mdx-remote-client`) — المقالات كملفات محلياً في `content/articles/`
- **Firebase Firestore** — التعليقات والتقييمات
- **Fuse.js** — بحث سريع في المتصفح (بلا خادم)
- **framer-motion** + **lucide-react** — الحركة والأيقونات
- **Vercel** — الاستضافة + **Cloudflare** — الـDNS

## Setup محلياً

```bash
cp .env.local.example .env.local
# املأ متغيّرات Firebase (اختياري — بدونها التعليقات والتقييمات معطّلة فقط)

npm install
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000).

## هيكل المشروع

```
maqalat/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # RTL + Cairo + metadata + Header/Footer
│   ├── page.tsx               # الصفحة الرئيسية
│   ├── [slug]/page.tsx        # صفحة مقال
│   ├── c/[cluster]/page.tsx   # صفحة عنقود
│   ├── about|privacy|terms|contact|editorial-policy/page.tsx
│   ├── sitemap.ts + robots.ts
│   └── globals.css            # Design tokens (Tailwind v4 @theme)
├── components/
│   ├── Header.tsx + Footer.tsx + SearchBar.tsx + ThemeToggle.tsx
│   ├── ArticleCard.tsx
│   ├── FAQ.tsx + RatingStars.tsx + CommentsSection.tsx
│   ├── VideoEmbed.tsx + JsonLd.tsx
│   └── ThemeProvider.tsx
├── lib/
│   ├── blog.ts        # MDX parsing (gray-matter + reading-time)
│   ├── clusters.ts    # تعريف الأقسام
│   ├── seo.ts         # helpers + JSON-LD
│   ├── firebase.ts    # Firebase client init
│   └── cn.ts          # tailwind-merge + clsx
├── content/articles/  # المقالات .mdx
└── mdx-components.tsx # مكوّنات MDX العامة (img, a, VideoEmbed)
```

## إضافة مقال جديد

أنشئ ملف `content/articles/my-slug.mdx`:

```mdx
---
title: "عنوان المقال"
description: "وصف قصير للـSEO ونتائج البحث"
cluster: "calendar"
publishedAt: "2026-08-29"
author: "فريق مقالات"
tags: ["كلمة", "كلمة"]
faq:
  - q: "سؤال؟"
    a: "جواب."
---

## عنوان قسم

اكتب هنا. تدعم MDX الصور والفيديو:

![وصف الصورة](/images/example.jpg)

<VideoEmbed youtube="dQw4w9WgXcQ" title="شرح المقال بالفيديو" />
```

الأقسام المتاحة معرّفة في [`lib/clusters.ts`](lib/clusters.ts).

## النشر

- **الدومين**: maqalat.org (Cloudflare Registrar)
- **الاستضافة**: Vercel
- **الإيميل الإداري**: maqalatorg@gmail.com

## المبادئ التحريرية

- ✅ صفر فبركة — كل ادعاء بمصدر رسمي
- ✅ White-Hat SEO فقط
- ✅ E-E-A-T من اليوم الأول (About + Editorial Policy + Contact)
- ✅ مصادر YMYL موثّقة (Harvard/NIH للصحة، الجهات الرسمية السعودية للتسجيلات)

راجع [`app/editorial-policy/page.tsx`](app/editorial-policy/page.tsx) للسياسة الكاملة.

"use client";

import dynamic from "next/dynamic";

// Below-the-fold components that don't need to be in the initial HTML/RSC
// payload. Loading them via next/dynamic + ssr:false keeps ~15KB of client
// JS + their React state out of the article page's first render, and out
// of the RSC serialized tree entirely.
//
// Trade-off: these appear a beat later on the client. All three are below
// the article body + related section, so users won't notice — but Ahrefs
// "HTML file size too large" gets meaningfully smaller.
const RatingStars = dynamic(
  () => import("./RatingStars").then((m) => m.RatingStars),
  { ssr: false, loading: () => null },
);
const NewsletterSignup = dynamic(
  () => import("./NewsletterSignup").then((m) => m.NewsletterSignup),
  { ssr: false, loading: () => null },
);
const CommentsSection = dynamic(
  () => import("./CommentsSection").then((m) => m.CommentsSection),
  { ssr: false, loading: () => null },
);

export function ArticleBelowFold({
  slug,
  ratingLabel,
  newsletterSource,
}: {
  slug: string;
  ratingLabel: string;
  newsletterSource: string;
}) {
  return (
    <>
      <section className="mt-12 card p-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
          {ratingLabel}
        </h2>
        <RatingStars slug={slug} />
      </section>
      <NewsletterSignup source={newsletterSource} />
      <CommentsSection slug={slug} />
    </>
  );
}

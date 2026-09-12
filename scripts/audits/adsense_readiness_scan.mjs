#!/usr/bin/env node
// AdSense readiness scanner — flags AI-tell patterns, fabrication risk,
// thin structure, and orphan pages across all articles.
// Runs offline, reads content/articles/*.mdx only, prints a ranked report.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content", "articles");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"));

const AI_TELL_OPENERS = [
  /^يُعدّ\s/m,
  /^يعتبر\s/m,
  /^يحتاج\s+(المستخدم|القارئ)\s+إلى/m,
  /^من\s+الأشياء\s+التي/m,
  /^في\s+عالم(نا)?\s+اليوم/m,
  /^مع\s+التطور\s+المتسارع/m,
  /^لا\s+يخفى\s+على/m,
];
const AI_TELL_ENDERS = [
  /خلاصة\s*[:،]/g,
  /في\s+الختام/g,
  /تلخيصاً/g,
  /من\s+المهم\s+أن\s+نذكر/g,
  /مما\s+سبق\s+يتّضح/g,
];
const HUMAN_SIGNALS = [
  /—/g, // em-dash
  /خلافاً\s+ل/g,
  /أنصح|ننصح|لا\s+أنصح|لا\s+ننصح/g,
  /راجعت|تحقّقت|تحقّقنا|راجعنا|فحصنا/g,
  /لم\s+نجد|لم\s+أجد/g,
  /في\s+رأيي|في\s+تجربتي/g,
  /خطأ\s+شائع/g,
];
const PASSIVE_PATTERN = /(?<![ء-ي])(يُ|تُ)[ء-ي]{2,}/g;
const INLINE_LINK = /\]\([^)]+\)/g;
const NUMBER_WITHOUT_CITE =
  /(?<![\]\d\.])\b\d{2,}(?:٫\d+)?\b(?!\s*[\)\]])/g; // 2+ digit numbers not inside a link
const TABLE_MARKER = /^\|[\s\S]*?\|[-:]+\|/m;
const HEADING = /^##\s/gm;
const FAQ_FIELD_HITS = /^\s*-\s+q:/gm;
const H1_H2_QUESTION = /^##\s.+[؟?]/gm;

const YMYL_CLUSTERS = new Set([
  "government",
  "health",
  "finance",
  "religion",
  "law",
]);

const articles = [];
const bySlug = new Map();
for (const f of files) {
  const raw = fs.readFileSync(path.join(DIR, f), "utf8");
  const parsed = matter(raw);
  const isEn = f.endsWith(".en.mdx");
  const slug = f.replace(/\.mdx$/, "").replace(/\.en$/, "");
  const body = parsed.content;
  const words = body.split(/\s+/).filter(Boolean).length;
  const cluster = parsed.data.cluster || "";
  const isYmyl = YMYL_CLUSTERS.has(cluster);

  const aiOpen = AI_TELL_OPENERS.filter((r) => r.test(body)).length;
  const aiEnd = AI_TELL_ENDERS.reduce(
    (n, r) => n + (body.match(r) || []).length,
    0,
  );
  const human = HUMAN_SIGNALS.reduce(
    (n, r) => n + (body.match(r) || []).length,
    0,
  );
  const passive = (body.match(PASSIVE_PATTERN) || []).length;
  const passivePct = words ? (passive / words) * 100 : 0;
  const links = (body.match(INLINE_LINK) || []).length;
  const bareNumbers = (body.match(NUMBER_WITHOUT_CITE) || []).length;
  const hasTable = TABLE_MARKER.test(body);
  const headings = (body.match(HEADING) || []).length;
  const faqCount = (parsed.data.faq && parsed.data.faq.length) || 0;
  const questionHeadings = (body.match(H1_H2_QUESTION) || []).length;

  const flags = [];
  if (aiOpen > 0) flags.push("ai-opener");
  if (aiEnd > 0) flags.push("ai-ender");
  if (passivePct > 12) flags.push(`passive-${passivePct.toFixed(1)}%`);
  if (human < 6) flags.push(`human-${human}`);
  if (links < 5) flags.push(`links-${links}`);
  if (!hasTable) flags.push("no-table");
  if (headings < 3) flags.push(`headings-${headings}`);
  if (faqCount < 4) flags.push(`faq-${faqCount}`);
  if (words < 700) flags.push(`thin-${words}w`);
  if (isYmyl && bareNumbers > 3) flags.push(`ymyl-cite-${bareNumbers}`);

  const rec = {
    file: f,
    slug,
    locale: isEn ? "en" : "ar",
    cluster,
    isYmyl,
    words,
    passivePct: +passivePct.toFixed(1),
    human,
    aiOpen,
    aiEnd,
    links,
    bareNumbers,
    hasTable,
    headings,
    faqCount,
    questionHeadings,
    flagCount: flags.length,
    flags,
  };
  articles.push(rec);
  const key = `${slug}::${rec.locale}`;
  bySlug.set(key, rec);
}

// Inbound-link tally (for de-orphan)
const inbound = new Map();
for (const rec of articles) inbound.set(`${rec.slug}::${rec.locale}`, 0);

const SLUG_LINK_AR = /\]\(\/([a-z0-9-]+)\)/g;
const SLUG_LINK_EN = /\]\(\/en\/([a-z0-9-]+)\)/g;

for (const f of files) {
  const raw = fs.readFileSync(path.join(DIR, f), "utf8");
  const body = matter(raw).content;
  const isEn = f.endsWith(".en.mdx");
  const scanRegex = isEn ? SLUG_LINK_EN : SLUG_LINK_AR;
  let m;
  while ((m = scanRegex.exec(body)) !== null) {
    const target = m[1];
    const key = `${target}::${isEn ? "en" : "ar"}`;
    if (inbound.has(key)) inbound.set(key, inbound.get(key) + 1);
  }
}
for (const rec of articles) {
  rec.inbound = inbound.get(`${rec.slug}::${rec.locale}`) || 0;
  if (rec.inbound === 0) rec.flags.push("orphan");
  else if (rec.inbound < 3) rec.flags.push(`inbound-${rec.inbound}`);
}

// Ranking: total flag count + YMYL boost
for (const rec of articles) {
  rec.score = rec.flags.length + (rec.isYmyl && rec.flags.length > 0 ? 2 : 0);
}
articles.sort((a, b) => b.score - a.score);

// Summary
const total = articles.length;
const orphans = articles.filter((a) => a.inbound === 0).length;
const thin = articles.filter((a) => a.words < 700).length;
const noTable = articles.filter((a) => !a.hasTable).length;
const highPassive = articles.filter((a) => a.passivePct > 12).length;
const lowHuman = articles.filter((a) => a.human < 6).length;
const aiOpeners = articles.filter((a) => a.aiOpen > 0).length;
const aiEnders = articles.filter((a) => a.aiEnd > 0).length;
const clean = articles.filter((a) => a.flags.length === 0).length;

const clusterStats = {};
for (const a of articles) {
  const c = a.cluster || "(none)";
  if (!clusterStats[c]) clusterStats[c] = { total: 0, flagged: 0, orphans: 0 };
  clusterStats[c].total++;
  if (a.flags.length > 0) clusterStats[c].flagged++;
  if (a.inbound === 0) clusterStats[c].orphans++;
}

console.log("=".repeat(70));
console.log("AdSense readiness scan — maqalat.org");
console.log("=".repeat(70));
console.log(`Total articles           : ${total}`);
console.log(`Clean (0 flags)          : ${clean}  (${((clean / total) * 100).toFixed(0)}%)`);
console.log(`Orphans (0 inbound)      : ${orphans}`);
console.log(`Thin (<700 words)        : ${thin}`);
console.log(`No table                 : ${noTable}`);
console.log(`Passive >12%             : ${highPassive}`);
console.log(`Low human signals (<6)   : ${lowHuman}`);
console.log(`AI-tell opener           : ${aiOpeners}`);
console.log(`AI-tell ender            : ${aiEnders}`);
console.log("");
console.log("By cluster:");
console.log("-".repeat(70));
for (const [c, s] of Object.entries(clusterStats).sort((a, b) => b[1].flagged - a[1].flagged)) {
  console.log(
    `${c.padEnd(20)} total=${String(s.total).padStart(3)}  flagged=${String(s.flagged).padStart(3)}  orphan=${String(s.orphans).padStart(3)}`,
  );
}
console.log("");
console.log("Top 30 highest-risk articles:");
console.log("-".repeat(70));
for (const a of articles.slice(0, 30)) {
  console.log(
    `[${a.locale}] ${a.slug.padEnd(50)} score=${a.score}  ${a.flags.join(",")}`,
  );
}

fs.writeFileSync(
  path.join(process.cwd(), "scripts", "audits", "adsense_readiness_report.json"),
  JSON.stringify(articles, null, 2),
);
console.log("");
console.log("Full report → scripts/audits/adsense_readiness_report.json");

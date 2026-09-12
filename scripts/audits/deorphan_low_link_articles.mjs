#!/usr/bin/env node
// Auto-inserts a "مواضيع ذات صلة / See also" section into MDX bodies
// that have <3 inline links. Picks 4 same-cluster peers by stride
// sampling so inbound distribution stays even.
// Idempotent: skips files that already carry the marker.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content", "articles");
const MARKER = "{/* deorphan-auto */}";

function loadAll() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"));
  const rows = files.map((f) => {
    const raw = fs.readFileSync(path.join(DIR, f), "utf8");
    const isEn = f.endsWith(".en.mdx");
    const slug = f.replace(/\.mdx$/, "").replace(/\.en$/, "");
    const parsed = matter(raw);
    const body = parsed.content;
    const links = (body.match(/\]\([^)]+\)/g) || []).length;
    return {
      file: f,
      slug,
      locale: isEn ? "en" : "ar",
      cluster: parsed.data.cluster || "",
      title: parsed.data.title || slug,
      raw,
      links,
      hasMarker: body.includes(MARKER),
    };
  });
  return rows;
}

const all = loadAll();
const targets = all.filter((a) => a.links < 3 && !a.hasMarker);
console.log(`Candidates: ${targets.length}`);

const byLocaleCluster = new Map();
for (const a of all) {
  const key = `${a.locale}::${a.cluster}`;
  if (!byLocaleCluster.has(key)) byLocaleCluster.set(key, []);
  byLocaleCluster.get(key).push(a);
}

let touched = 0;
for (const t of targets) {
  const pool = (byLocaleCluster.get(`${t.locale}::${t.cluster}`) || []).filter(
    (a) => a.slug !== t.slug,
  );
  if (pool.length < 3) {
    console.log(`SKIP ${t.file} — cluster pool too small (${pool.length})`);
    continue;
  }
  const step = Math.max(1, Math.floor(pool.length / 5));
  const picks = [];
  const seen = new Set();
  let idx = Math.floor(Math.random() * pool.length);
  while (picks.length < 4 && seen.size < pool.length) {
    idx = (idx + step) % pool.length;
    const cand = pool[idx];
    if (seen.has(cand.slug)) continue;
    seen.add(cand.slug);
    picks.push(cand);
  }
  if (picks.length === 0) continue;

  const isEn = t.locale === "en";
  const heading = isEn ? "See also" : "مواضيع ذات صلة";
  const safeText = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]");
  const lines = picks.map((p) => {
    const url = isEn ? `/en/${p.slug}` : `/${p.slug}`;
    return `- [${safeText(p.title)}](${url})`;
  });
  const block = `\n\n## ${heading}\n\n${MARKER}\n\n${lines.join("\n")}\n`;

  const newRaw = t.raw.trimEnd() + block + "\n";
  fs.writeFileSync(path.join(DIR, t.file), newRaw, "utf8");
  touched++;
  console.log(`OK   ${t.file}  +${picks.length} links`);
}
console.log(`\nTouched ${touched} files`);

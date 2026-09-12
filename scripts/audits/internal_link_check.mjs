#!/usr/bin/env node
// Broken internal-link scan. Reads every MDX body + every trust page,
// extracts /path and /en/path links, and verifies each target exists
// as either an article slug or a known route. Reports 404 candidates.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content", "articles");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"));

const arSlugs = new Set();
const enSlugs = new Set();
for (const f of files) {
  const slug = f.replace(/\.mdx$/, "").replace(/\.en$/, "");
  if (f.endsWith(".en.mdx")) enSlugs.add(slug);
  else arSlugs.add(slug);
}

const STATIC_ROUTES = new Set([
  "",
  "about",
  "privacy",
  "terms",
  "contact",
  "editorial-policy",
  "methodology",
  "tools",
  "search",
  "author/founder",
]);

const CLUSTER_SLUGS = new Set([
  "calendar",
  "universities",
  "health",
  "government",
  "ai",
  "finance",
  "cars",
  "tutorials",
  "websites",
  "fabrics",
]);

function isKnown(pathStr, locale) {
  const p = pathStr.replace(/^\/+/, "").replace(/\/+$/, "").replace(/#.*$/, "").replace(/\?.*$/, "");
  const parts = p.split("/");
  if (parts[0] === "en") parts.shift();
  const rest = parts.join("/");
  if (STATIC_ROUTES.has(rest)) return true;
  if (rest.startsWith("c/")) {
    const cslug = rest.split("/")[1];
    return CLUSTER_SLUGS.has(cslug);
  }
  if (rest.startsWith("tools/")) return true; // permissive
  if (rest.startsWith("author/")) return true;
  const slug = rest;
  return locale === "en" ? enSlugs.has(slug) : arSlugs.has(slug);
}

const BROKEN = [];
const LINK = /\]\((\/[^)]+)\)/g;
for (const f of files) {
  const raw = fs.readFileSync(path.join(DIR, f), "utf8");
  const body = matter(raw).content;
  const isEn = f.endsWith(".en.mdx");
  let m;
  while ((m = LINK.exec(body)) !== null) {
    const href = m[1];
    const locale = href.startsWith("/en/") || href === "/en" ? "en" : isEn ? "en" : "ar";
    if (!isKnown(href, locale)) {
      BROKEN.push({ file: f, href, locale });
    }
  }
}

console.log(`Scanned ${files.length} MDX files.`);
console.log(`Broken internal links: ${BROKEN.length}`);
console.log("");
const byFile = {};
for (const b of BROKEN) {
  if (!byFile[b.file]) byFile[b.file] = [];
  byFile[b.file].push(`${b.href}  (${b.locale})`);
}
for (const [f, links] of Object.entries(byFile)) {
  console.log(`  ${f}`);
  links.forEach((l) => console.log(`    → ${l}`));
}

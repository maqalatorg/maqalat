#!/usr/bin/env node
/**
 * verify-links.mjs — pre-deploy check for broken internal MDX links.
 *
 * Scans every `[text](/slug)` in content/articles/*.mdx and confirms that
 * either an article file exists (`{slug}.mdx` or `{slug}.en.mdx`) or the
 * slug is one of the reserved app routes.
 *
 * Exit codes: 0 = clean, 1 = one or more broken links found.
 *
 * Run: node scripts/verify-links.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content", "articles");

// Reserved top-level segments — pages that live in app/ not content/articles.
// Keep in sync with app/[locale]/ and app/ structure.
const RESERVED = new Set([
  "en",
  "c",
  "api",
  "admin",
  "about",
  "contact",
  "privacy",
  "terms",
  "tools",
  "methodology",
  "editorial-policy",
  "sitemap.xml",
  "robots.txt",
  "ads.txt",
]);

// Build the set of valid article slugs from the filesystem.
function loadValidSlugs() {
  const slugs = new Set();
  for (const f of fs.readdirSync(CONTENT_DIR)) {
    if (f.endsWith(".en.mdx")) slugs.add(f.slice(0, -".en.mdx".length));
    else if (f.endsWith(".mdx")) slugs.add(f.slice(0, -".mdx".length));
  }
  return slugs;
}

// Extract every ](/slug) or ](/slug#hash) target — internal absolute links.
// Skips ](/en/...) and ](/c/...) — those are validated by their segment being reserved.
function extractInternalLinks(text) {
  const out = [];
  const re = /\]\((\/[a-z0-9][a-z0-9\-\/]*)(?:#[^)]*)?\)/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push(m[1]);
  }
  return out;
}

// Return true if this link resolves to a real page.
function isValid(link, slugs) {
  const parts = link.split("/").filter(Boolean); // ["c","universities"] or ["en","xxx"] or ["slug"]
  const head = parts[0];
  if (RESERVED.has(head)) return true;
  // Single-segment absolute path → must be an article slug.
  if (parts.length === 1 && slugs.has(head)) return true;
  return false;
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`No content dir: ${CONTENT_DIR}`);
    process.exit(2);
  }
  const slugs = loadValidSlugs();
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .sort();

  const broken = [];
  for (const f of files) {
    const full = path.join(CONTENT_DIR, f);
    const text = fs.readFileSync(full, "utf8");
    const links = extractInternalLinks(text);
    for (const link of links) {
      if (!isValid(link, slugs)) {
        broken.push({ file: f, link });
      }
    }
  }

  if (broken.length === 0) {
    console.log(
      `verify-links: OK — scanned ${files.length} MDX files, ${slugs.size} valid slugs, 0 broken links.`,
    );
    process.exit(0);
  }

  console.error(`verify-links: ${broken.length} BROKEN internal link(s):`);
  for (const b of broken) {
    console.error(`  ✗ ${b.file}  →  ${b.link}`);
  }
  process.exit(1);
}

main();

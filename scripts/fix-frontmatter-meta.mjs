// Frontmatter meta cleanup: extend descriptions < 120 chars with a natural
// continuation drawn from the first non-heading paragraph of the article body,
// so meta descriptions land in Google's healthy 120-160 window instead of
// getting Ahrefs "Meta description too short" warnings.
//
// IMPORTANT: We do NOT round-trip through gray-matter's stringifier because it
// reformats the whole YAML block (quote style, tags → block list, folded
// scalars for long strings) — producing 30+ line diffs per file. Instead we
// do a targeted regex replace on ONLY the `description:` value, preserving
// every other line byte-for-byte.
//
// Long titles / descriptions are already handled at runtime by the
// normalizeTitle / normalizeMetaDescription helpers in lib/seo.ts, so this
// script focuses only on the "too short" case — where truncation can't help
// and we need real content.
//
// Run:  node scripts/fix-frontmatter-meta.mjs
//       node scripts/fix-frontmatter-meta.mjs --dry
import fs from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry");
const DIR = path.join(process.cwd(), "content", "articles");
const MIN = 120;
const MAX = 155;

/** Split "---\n<frontmatter>\n---\n<body>" into its two halves. */
function splitFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  return { fm: m[1], body: m[2], newline: raw.includes("\r\n") ? "\r\n" : "\n" };
}

/** Read `description:` from frontmatter (handles double/single/no quotes on a single line). */
function readDescription(fm) {
  const re = /^description:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|(.+?))\s*$/m;
  const m = fm.match(re);
  if (!m) return null;
  const raw = m[1] ?? m[2] ?? m[3] ?? "";
  const value = m[1] != null
    ? raw.replace(/\\"/g, '"').replace(/\\\\/g, "\\")
    : raw;
  return { match: m[0], value, quote: m[1] != null ? '"' : m[2] != null ? "'" : null };
}

function writeDescription(fm, prev, newValue) {
  const quote = prev.quote ?? '"';
  const escaped = quote === '"'
    ? newValue.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
    : newValue.replace(/'/g, "''"); // YAML single-quote escape
  const replacement = `description: ${quote}${escaped}${quote}`;
  return fm.replace(prev.match, replacement);
}

/** Get first substantial paragraph from MDX body. */
function firstParagraph(body) {
  const lines = body.split(/\r?\n/);
  const buf = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (buf.length) break;
      continue;
    }
    if (line.startsWith("#")) continue;
    if (line.startsWith("import ") || line.startsWith("export ")) continue;
    if (line.startsWith("<") && line.endsWith(">")) continue;
    if (/^[-*|>`]/.test(line)) continue;
    if (line.startsWith("{{") && line.endsWith("}}")) continue;
    buf.push(line);
    if (buf.join(" ").length > 400) break;
  }
  return buf
    .join(" ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`[^`]*`/g, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(s, max) {
  if (s.length <= max) return s;
  const win = s.slice(0, max - 1);
  const cut = Math.max(win.lastIndexOf(" "), win.lastIndexOf("،"), win.lastIndexOf("."));
  return `${(cut > max * 0.6 ? win.slice(0, cut) : win).trimEnd()}…`;
}

function extend(desc, body) {
  const para = firstParagraph(body);
  if (!para) return desc;
  const sentences = para
    .split(/(?<=[.!؟?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = desc.toLowerCase();
  const extra = sentences.find(
    (s) => s.length >= 30 && !seen.includes(s.slice(0, 30).toLowerCase()),
  );
  if (!extra) return desc;
  const joined = desc.replace(/[.،؟?!]+$/, "") + " — " + extra;
  return truncate(joined, MAX);
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"));
let changed = 0;
let skipped = 0;
let noDesc = 0;

for (const f of files) {
  const p = path.join(DIR, f);
  const raw = fs.readFileSync(p, "utf8");
  const parts = splitFrontmatter(raw);
  if (!parts) {
    noDesc++;
    continue;
  }
  const cur = readDescription(parts.fm);
  if (!cur) {
    noDesc++;
    continue;
  }
  const desc = cur.value.trim();
  if (desc.length >= MIN && desc.length <= MAX) {
    skipped++;
    continue;
  }
  let next = desc;
  if (desc.length > MAX) {
    next = truncate(desc, MAX);
  } else if (desc.length < MIN) {
    next = extend(desc, parts.body);
    if (next.length < MIN) {
      skipped++;
      continue;
    }
  }
  if (next === desc) {
    skipped++;
    continue;
  }
  const newFm = writeDescription(parts.fm, cur, next);
  const out = `---${parts.newline}${newFm}${parts.newline}---${parts.newline}${parts.body}`;
  if (!DRY) fs.writeFileSync(p, out, "utf8");
  changed++;
  console.log(`${DRY ? "[dry] " : ""}${f}: ${desc.length} → ${next.length}`);
}

console.log(`\nDone. Changed: ${changed}, skipped: ${skipped}, no-desc: ${noDesc}, total: ${files.length}`);

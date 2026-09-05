#!/usr/bin/env node
// Google Indexing API — batch-ping every URL from the live sitemap.
// Quota: 200 URLs/day per project. Script stops at 200 and logs the rest.
//
// Setup:
//   1. Google Cloud → APIs & Services → enable "Indexing API" (project: maqalat-org)
//   2. IAM & Admin → Service Accounts → create "gsc-indexer" → download JSON key
//   3. Search Console → maqalat.org → Settings → Users → add service-account email as OWNER
//   4. Put JSON contents in .env.local as GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON (single line)
//   5. Run: node scripts/ping_google_indexing.mjs

import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually (no dotenv dep)
try {
  const env = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const SITEMAP_URL = "https://maqalat.org/sitemap.xml";
const DAILY_QUOTA = 200;
const RAW = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON;

if (!RAW) {
  console.error("❌ GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON missing from .env.local");
  process.exit(1);
}

let sa;
try {
  sa = JSON.parse(RAW);
} catch (e) {
  console.error("❌ Service account JSON invalid:", e.message);
  process.exit(1);
}

// --- JWT signing (RS256) → access token ---
function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  const signature = b64url(signer.sign(sa.private_key));
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Token exchange failed: " + JSON.stringify(data));
  return data.access_token;
}

// --- Sitemap fetch ---
async function fetchSitemapUrls() {
  const res = await fetch(SITEMAP_URL);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

// --- Indexing ping ---
async function pingUrl(token, url) {
  const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, type: "URL_UPDATED" }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

// --- Main ---
(async () => {
  console.log("🔑 Fetching access token…");
  const token = await getAccessToken();
  console.log("✅ Token OK\n");

  console.log("📄 Fetching sitemap…");
  const urls = await fetchSitemapUrls();
  console.log(`✅ ${urls.length} URLs found\n`);

  const batch = urls.slice(0, DAILY_QUOTA);
  const skipped = urls.length - batch.length;
  if (skipped > 0) {
    console.log(`⚠️  ${skipped} URLs skipped (quota is ${DAILY_QUOTA}/day). Re-run tomorrow.\n`);
  }

  let ok = 0, fail = 0;
  for (let i = 0; i < batch.length; i++) {
    const url = batch[i];
    const { status, body } = await pingUrl(token, url);
    const marker = status === 200 ? "✅" : "❌";
    console.log(`${marker} [${i + 1}/${batch.length}] ${status} — ${url}`);
    if (status === 200) ok++;
    else {
      fail++;
      if (body.error) console.log(`   ↳ ${body.error.message}`);
    }
    // Gentle pacing: 200ms between calls (well under 600/min limit)
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n📊 Done — ${ok} succeeded · ${fail} failed · ${skipped} deferred to tomorrow`);
})();

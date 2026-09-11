#!/usr/bin/env node
// Google Indexing API — one-shot submit of the 15 government-services articles
// (AR + EN mirrors = 30 URLs). Uses only 30 of the 200/day quota.
//
// Run AFTER Vercel finishes deploying the new commit, otherwise Google will
// see 404 on some URLs and Ahrefs may flag them as broken. Verify with:
//   curl -I https://maqalat.org/end-of-service-gratuity-calculator
//
// Prereqs: same as scripts/ping_google_indexing.mjs — service account JSON
// in .env.local as GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON (single line).

import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  const env = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const SLUGS = [
  "end-of-service-gratuity-calculator",
  "iqama-renewal-guide",
  "absher-complete-guide",
  "saudi-id-renewal-guide",
  "traffic-violations-guide",
  "gosi-pension-guide",
  "saudi-labor-law-rights",
  "kafala-transfer-guide",
  "saudi-passport-guide",
  "najiz-services-guide",
  "driving-license-saudi-guide",
  "tawakkalna-complete-guide",
  "musaned-domestic-workers-guide",
  "zatca-vat-e-invoicing-guide",
  "saudi-government-salary-scale",
];

const URLS = SLUGS.flatMap((s) => [
  `https://maqalat.org/${s}`,
  `https://maqalat.org/en/${s}`,
]);

const RAW = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON;
if (!RAW) {
  console.error("❌ GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON missing from .env.local");
  process.exit(1);
}
const sa = JSON.parse(RAW);

function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(JSON.stringify(claim))}`;
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

async function pingUrl(token, url) {
  const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, type: "URL_UPDATED" }),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

(async () => {
  console.log(`🎯 Submitting ${URLS.length} government-cluster URLs to Google Indexing API\n`);
  const token = await getAccessToken();

  let ok = 0, fail = 0;
  for (let i = 0; i < URLS.length; i++) {
    const url = URLS[i];
    const { status, body } = await pingUrl(token, url);
    const marker = status === 200 ? "✅" : "❌";
    console.log(`${marker} [${i + 1}/${URLS.length}] ${status} — ${url}`);
    if (status === 200) ok++;
    else {
      fail++;
      if (body.error) console.log(`   ↳ ${body.error.message}`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`\n📊 Done — ${ok} succeeded · ${fail} failed`);
})();

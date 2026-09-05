#!/usr/bin/env node
// IndexNow — batch-notify Bing / Yandex / Naver / Seznam / DuckDuckGo (via Bing)
// of every URL in the live sitemap in a single request.
//
// No daily quota (unlike Google Indexing API's 200/day). Endpoint accepts up
// to 10,000 URLs per POST; we send all 252 in one shot.
//
// Setup:
//   1. Bing Webmaster Tools → IndexNow → Generate → copy key
//   2. Save the key as public/<key>.txt containing the key itself
//   3. Deploy so https://maqalat.org/<key>.txt returns the key
//   4. Run: npm run indexnow:ping

const KEY = "a0b71d61d91d435587162a4cebcf1efe";
const HOST = "maqalat.org";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

async function fetchSitemapUrls() {
  const res = await fetch(SITEMAP_URL);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function verifyKeyFile() {
  const res = await fetch(KEY_LOCATION);
  if (!res.ok) throw new Error(`Key file not reachable (${res.status}): ${KEY_LOCATION}`);
  const body = (await res.text()).trim();
  if (body !== KEY) throw new Error(`Key file content mismatch. Got: "${body}"`);
}

(async () => {
  console.log("🔑 Verifying key file is deployed…");
  await verifyKeyFile();
  console.log("✅ Key file OK\n");

  console.log("📄 Fetching sitemap…");
  const urls = await fetchSitemapUrls();
  console.log(`✅ ${urls.length} URLs found\n`);

  console.log(`📡 Sending all ${urls.length} URLs in one bulk POST…`);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    }),
  });
  const body = await res.text();

  const meaning = {
    200: "✅ OK — all URLs accepted",
    202: "✅ Accepted — URLs queued (key validation pending)",
    400: "❌ Bad request — malformed JSON",
    403: "❌ Forbidden — key not valid / file not found",
    422: "❌ Unprocessable — URLs don't belong to host, or key mismatch",
    429: "⚠️ Too many requests (rate limited)",
  }[res.status] || `⚠️ Unexpected status ${res.status}`;

  console.log(`\n📊 Status: ${res.status} — ${meaning}`);
  if (body) console.log(`Body: ${body}`);
})();

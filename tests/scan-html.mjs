// Fetches every URL in the sitemap and fails if any page's visible text or
// attributes contain broken values: NaN, undefined, [object Object], or a raw
// error message. Usage: node tests/scan-html.mjs [baseUrl]  (default http://localhost:3000)
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const BAD = [
  [/\bNaN\b/, "NaN"],
  [/\bundefined\b/, "undefined"],
  [/\[object Object\]/, "[object Object]"],
  [/\b(?:Type|Reference|Range|Syntax)?Error:/, "Error:"],
  [/Attempted to call .* from the server/, "client reference called on server"],
  [/function\s*\(\s*\)\s*\{/, "raw function source"],
  [/(?:^|[\s(])-\$\d/, "negative dollar amount in prose"],
];

const sitemap = await (await fetch(base + "/sitemap.xml")).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
if (urls.length < 10) throw new Error(`sitemap has only ${urls.length} URLs`);

const visible = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

let failures = 0;
const queue = [...urls];
async function worker() {
  for (let path; (path = queue.shift()) !== undefined; ) {
    const res = await fetch(base + path);
    const text = visible(await res.text());
    const hits = [];
    if (res.status !== 200) hits.push(`status ${res.status}`);
    for (const [re, label] of BAD) {
      const m = text.match(re);
      if (m) hits.push(`${label}: …${text.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\s+/g, " ")}…`);
    }
    if (hits.length) { failures++; console.log("FAIL", path, "\n  " + hits.join("\n  ")); }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
console.log(`${failures ? "FAIL" : "ok  "} scanned ${urls.length} sitemap pages, ${failures} with broken values`);
if (failures) process.exitCode = 1;

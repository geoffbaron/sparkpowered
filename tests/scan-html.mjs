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

// Solartopia SEO page: title, description, canonical, one H1, enough server-rendered text, valid JSON-LD.
{
  const res = await fetch(base + "/solartopia");
  const html = await res.text();
  const checks = [];
  const t = (c, m) => checks.push([c, m]);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  t(res.status === 200, "status 200");
  t(title === "Solartopia: A Free 5-Minute Solar Power Game | Spark Powered", `title is "${title}"`);
  t(desc === "Light a dark village with solar panels and batteries: clean water, a clinic, a school, food and electric buses. Real facts from WHO, UNICEF and IRENA, then see what sunshine could save your home.", "description matches the brief");
  t(/<link rel="canonical" href="https:\/\/[^"]*\/solartopia"/.test(html), "canonical points at /solartopia");
  t((html.match(/<h1[\s>]/g) ?? []).length === 1, "exactly one H1");
  const article = html.match(/<article[\s\S]*<\/article>/)?.[0] ?? "";
  const words = visible(article).replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").split(/\s+/).filter(Boolean).length;
  t(words >= 600, `${words} words of server-rendered text (need 600+)`);
  for (const h of ["Water", "Health", "School", "Food", "Getting around", "Why solar is now the cheapest power we&#x27;ve built", "What solar can&#x27;t do yet", "Bring it home", "How the game works and what we simplified", "Sources"]) t(html.includes(`>${h}</h2>`), `has section "${h}"`);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  let types = [];
  for (const b of blocks) {
    try {
      const j = JSON.parse(b);
      for (const n of j["@graph"] ?? [j]) types.push([].concat(n["@type"]).join("+"));
    } catch {
      t(false, "a JSON-LD block does not parse");
    }
  }
  t(types.some((x) => /VideoGame/.test(x) && /WebApplication/.test(x)), `JSON-LD has VideoGame+WebApplication (${types.join(", ")})`);
  t(types.includes("BreadcrumbList"), "JSON-LD has BreadcrumbList");
  t(/href="\/states"/.test(html) && /href="\/solar-calculator"/.test(html), "article links /states and the calculators");
  for (const [okc, m] of checks) if (!okc) { failures++; console.log("FAIL /solartopia:", m); }
  console.log(`${checks.every((c) => c[0]) ? "ok  " : "FAIL"} /solartopia SEO checks (${checks.length})`);
  if (!checks.every((c) => c[0])) process.exitCode = 1;
}

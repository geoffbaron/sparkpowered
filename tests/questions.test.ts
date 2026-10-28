import { test } from "node:test";
import assert from "node:assert/strict";
import { TOPICS } from "../src/data/questions";
import { ROUTES } from "../src/lib/seo";

const all = TOPICS.flatMap((t) => t.questions.map((q) => ({ t, q })));
const text = (q: (typeof all)[number]["q"]) =>
  [q.q, q.a, ...q.detail.flatMap((b) => ("p" in b ? [b.p] : "ul" in b ? b.ul : [b.table.caption, ...b.table.head, ...b.table.rows.flat()]))].join(" ");

test("every hub is in the sitemap routes", () => {
  for (const t of TOPICS) assert.ok(ROUTES.some((r) => r.path === t.path), `${t.path} missing from ROUTES`);
  assert.ok(ROUTES.some((r) => r.path === "/questions"));
});

test("question ids are unique and every answer has sources", () => {
  const ids = new Set<string>();
  for (const { t, q } of all) {
    const key = `${t.slug}#${q.id}`;
    assert.ok(!ids.has(key), `duplicate ${key}`);
    ids.add(key);
    assert.ok(q.sources.length > 0, `${key} has no sources`);
    for (const s of q.sources) assert.match(s.url, /^https:\/\//, `${key} source ${s.name}`);
  }
  assert.ok(all.length >= 30, `only ${all.length} questions`);
});

test("no broken numbers, emojis or AI mentions in any answer", () => {
  for (const { t, q } of all) {
    const s = text(q);
    assert.doesNotMatch(s, /NaN|undefined|Infinity|\[object Object\]/, `${t.slug}#${q.id}`);
    assert.doesNotMatch(s, /\p{Extended_Pictographic}/u, `${t.slug}#${q.id} has an emoji`);
    assert.doesNotMatch(s, /\bAI\b|artificial intelligence/i, `${t.slug}#${q.id} mentions AI`);
  }
});

test("short answers are 2 to 5 sentences", () => {
  for (const { t, q } of all) {
    const n = q.a.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).length;
    assert.ok(n >= 2 && n <= 5, `${t.slug}#${q.id}: ${n} sentences`);
  }
});

test("every question has its own page in the sitemap, with a short description and a guide link", async () => {
  const { ALL_QUESTIONS, questionPath, questionDescription, guideFor } = await import("../src/data/questions");
  const { default: sitemap } = await import("../src/app/sitemap");
  const urls = new Set(sitemap().map((e) => new URL(e.url).pathname));
  const paths = new Set<string>();
  for (const { topic, question } of ALL_QUESTIONS) {
    const p = questionPath(topic, question);
    assert.ok(!paths.has(p), `duplicate page ${p}`);
    paths.add(p);
    assert.ok(urls.has(p), `${p} missing from sitemap`);
    const d = questionDescription(question);
    assert.ok(d.length > 40 && d.length <= 155, `${p}: description is ${d.length} chars`);
    assert.match(guideFor(topic, question).href, /^\//, `${p}: guide link is not on site`);
  }
  assert.equal(paths.size, all.length);
});

test("llms.txt lists every question page", async () => {
  const { readFileSync } = await import("node:fs");
  const { ALL_QUESTIONS, questionPath } = await import("../src/data/questions");
  const llms = readFileSync("public/llms.txt", "utf8");
  for (const { topic, question } of ALL_QUESTIONS) {
    const p = `https://sparkpowered.com${questionPath(topic, question)})`;
    assert.ok(llms.includes(p), `${p} missing from llms.txt`);
  }
});

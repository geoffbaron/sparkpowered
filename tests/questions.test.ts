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

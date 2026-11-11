import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_QUESTIONS, TOPICS, questionPath } from "../src/data/questions";
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

test("the old single-answer pages are gone from the sitemap; the hubs stay", async () => {
  const { default: sitemap } = await import("../src/app/sitemap");
  const urls = new Set(sitemap().map((e) => new URL(e.url).pathname));
  for (const { topic, question } of ALL_QUESTIONS) {
    assert.ok(!urls.has(`${topic.path}/${question.id}`), `${topic.path}/${question.id} still in sitemap`);
    assert.equal(questionPath(topic, question), `${topic.path}#${question.id}`);
  }
  for (const t of TOPICS) assert.ok(urls.has(t.path), `${t.path} missing from sitemap`);
  assert.ok(![...urls].some((u) => /^\/questions\/[^/]+\/[^/]+/.test(u)), "a single-answer URL is still listed");
});

test("every old question URL 308s to its hub anchor", async () => {
  const { default: config } = await import("../next.config");
  const rules = await config.redirects!();
  const rule = rules.find((r) => r.source.startsWith("/questions/"));
  assert.ok(rule, "no /questions redirect");
  assert.equal(rule.permanent, true);
  // Compile the Next source pattern: ":topic(a|b)" -> "(a|b)", ":question" -> "([^/]+)".
  const re = new RegExp(`^${rule.source.replace(/:topic(\([^)]*\))/, "$1").replace(":question", "([^/]+)")}$`);
  for (const { topic, question } of ALL_QUESTIONS) {
    const m = `${topic.path}/${question.id}`.match(re);
    assert.ok(m, `${topic.path}/${question.id} not redirected`);
    const dest = rule.destination.replace(":topic", m[1]).replace(":question", m[2]);
    assert.equal(dest, `${topic.path}#${question.id}`);
  }
  // Hub pages themselves must not match.
  for (const t of TOPICS) assert.ok(!re.test(t.path), `${t.path} would redirect`);
  assert.equal(ALL_QUESTIONS.length, 34);
});

test("llms.txt links every answer at its hub anchor and no single-answer URL", async () => {
  const { readFileSync } = await import("node:fs");
  const llms = readFileSync("public/llms.txt", "utf8");
  for (const { topic, question } of ALL_QUESTIONS) {
    assert.ok(llms.includes(`https://sparkpowered.com${topic.path}#${question.id})`), `${question.id} missing from llms.txt`);
    assert.ok(!llms.includes(`https://sparkpowered.com${topic.path}/${question.id}`), `${question.id} old URL in llms.txt`);
  }
});

test("every question has a worked example with a source and a calculator link", () => {
  for (const { question: q } of ALL_QUESTIONS) {
    assert.ok(q.example, `${q.id} has no worked example`);
    assert.match(q.example.text, /\d/, `${q.id} example has no numbers`);
    assert.match(q.example.source.url, /^https:\/\//, `${q.id} example source`);
    assert.match(q.example.tool.href, /^\//, `${q.id} example tool`);
    assert.doesNotMatch(q.example.text, /NaN|undefined|Infinity/, `${q.id} example text`);
  }
});

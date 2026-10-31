/**
 * Pure Ask Spark logic, kept free of I/O so it can be tested directly:
 * cost from API usage, the spending caps, visitor rate limits, input checks,
 * and turning the model's text into safe display parts.
 */

import {
  DAILY_CAP_USD,
  MAX_HISTORY_ANSWER_CHARS,
  MAX_HISTORY_MESSAGES,
  MAX_QUESTION_CHARS,
  MONTHLY_CAP_USD,
  PRICES,
  SITE_PER_HOUR,
  VISITOR_PER_DAY,
  VISITOR_PER_HOUR,
} from "./config";

// ---------------------------------------------------------------- cost

export interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

/** USD cost of one call from the API's own usage numbers. */
export function costUsd(u: Usage): number {
  const write = u.cache_creation_input_tokens ?? 0;
  const read = u.cache_read_input_tokens ?? 0;
  const promptTokens = u.input_tokens + write + read;
  const card = promptTokens > PRICES.longPromptTokens ? PRICES.long : PRICES.short;
  const perTok = (usdPerM: number) => usdPerM / 1_000_000;
  return (
    u.input_tokens * perTok(card.input) +
    write * perTok(card.input * PRICES.cacheWriteMultiplier) +
    read * perTok(card.input * PRICES.cacheReadMultiplier) +
    u.output_tokens * perTok(card.output)
  );
}

/** Worst case for one call: the whole prompt written to cache, full output. Used to stop before a cap, not after. */
export function worstCaseCallUsd(promptTokens: number, maxOutputTokens: number): number {
  return costUsd({ input_tokens: 0, cache_creation_input_tokens: promptTokens, output_tokens: maxOutputTokens });
}

// ---------------------------------------------------------------- caps

export const monthKey = (now: Date) => now.toISOString().slice(0, 7);
export const dayKey = (now: Date) => now.toISOString().slice(0, 10);

export interface Spend {
  monthUsd: number;
  dayUsd: number;
}

export type CapState = "ok" | "month" | "day";

/** Whether a new call may start. `reserve` covers the call about to be made (plus any in flight). */
export function capState(spend: Spend, reserve = 0): CapState {
  if (spend.monthUsd + reserve >= MONTHLY_CAP_USD) return "month";
  if (spend.dayUsd + reserve >= DAILY_CAP_USD) return "day";
  return "ok";
}

// ---------------------------------------------------------------- visitor limits

/** Sliding-window limiter over timestamps, in memory. Keys are hashed visitor ids. */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  private site: number[] = [];

  constructor(
    private perHour = VISITOR_PER_HOUR,
    private perDay = VISITOR_PER_DAY,
    private sitePerHour = SITE_PER_HOUR,
  ) {}

  /** Records a hit and returns null, or returns why it is refused (and records nothing). */
  take(key: string, now = Date.now()): null | "hour" | "day" | "site" {
    const HOUR = 3_600_000;
    const DAY = 24 * HOUR;
    const list = (this.hits.get(key) ?? []).filter((t) => now - t < DAY);
    this.site = this.site.filter((t) => now - t < HOUR);
    if (list.length >= this.perDay) return "day";
    if (list.filter((t) => now - t < HOUR).length >= this.perHour) return "hour";
    if (this.site.length >= this.sitePerHour) return "site";
    list.push(now);
    this.hits.set(key, list);
    this.site.push(now);
    if (this.hits.size > 50_000) this.prune(now);
    return null;
  }

  private prune(now: number) {
    for (const [k, v] of this.hits) if (v.every((t) => now - t >= 24 * 3_600_000)) this.hits.delete(k);
  }
}

// ---------------------------------------------------------------- input

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

export type CheckedInput = { ok: true; question: string; history: Turn[] } | { ok: false; error: string };

const clean = (s: string) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();

/** Validates a request body: one question plus a few earlier turns, trimmed to size. */
export function checkInput(body: unknown): CheckedInput {
  if (!body || typeof body !== "object") return { ok: false, error: "Send a question." };
  const b = body as { question?: unknown; history?: unknown };
  if (typeof b.question !== "string") return { ok: false, error: "Send a question." };
  const question = clean(b.question);
  if (!question) return { ok: false, error: "Type a question first." };
  if (question.length > MAX_QUESTION_CHARS) return { ok: false, error: `Please keep questions under ${MAX_QUESTION_CHARS} characters.` };

  const raw = Array.isArray(b.history) ? b.history : [];
  const turns: Turn[] = [];
  for (const t of raw.slice(-MAX_HISTORY_MESSAGES)) {
    if (!t || typeof t !== "object") continue;
    const { role, content } = t as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
    const c = clean(content).slice(0, role === "user" ? MAX_QUESTION_CHARS : MAX_HISTORY_ANSWER_CHARS);
    if (c) turns.push({ role, content: c });
  }
  // The API wants alternating turns starting with the user; drop anything that breaks that.
  const history: Turn[] = [];
  for (const t of turns) {
    const expected = history.length % 2 === 0 ? "user" : "assistant";
    if (t.role === expected) history.push(t);
  }
  if (history.length % 2 === 1) history.pop();
  return { ok: true, question, history };
}

// ---------------------------------------------------------------- output

export type Inline =
  | { t: "text"; text: string }
  | { t: "link"; text: string; href: string }
  | { t: "product"; id: string; name: string; href: string; price: string | null; note: string };

export interface Para {
  kind: "p" | "li";
  parts: Inline[];
}

export interface ProductInfo {
  id: string;
  name: string;
  href: string;
  priceText: string | null;
}

export interface RenderContext {
  pages: Set<string>;
  product: (id: string) => ProductInfo | undefined;
  commissionNote: string;
}

const SITE_RE = /^https?:\/\/(?:www\.)?sparkpowered\.com/i;

/** A site path the reply may link to, or null. Accepts "/path", "/path#x" and full sparkpowered.com URLs. */
export function sitePath(href: string, pages: Set<string>): string | null {
  let h = href.trim();
  if (SITE_RE.test(h)) h = h.replace(SITE_RE, "") || "/";
  if (!h.startsWith("/") || h.startsWith("//")) return null;
  const [pathAndQuery, hash] = h.split("#");
  const path = pathAndQuery.split("?")[0].replace(/\/+$/, "") || "/";
  if (!pages.has(path)) return null;
  return hash && /^[\w-]+$/.test(hash) ? `${path}#${hash}` : path;
}

const TOKEN_RE = /\{\{\s*product:([a-z0-9-]+)\s*\}\}|\[([^\]\n]{1,120})\]\(([^)\s]{1,300})\)/g;
const BARE_URL_RE = /\b(?:https?:\/\/|www\.)[^\s)]+/gi;

function inline(line: string, ctx: RenderContext, used: Set<string>, pagesOut: Set<string>): Inline[] {
  const out: Inline[] = [];
  const text = (s: string) => {
    // Strip any bare URL that is not a link to our own site; never show other sites' addresses.
    const t = s.replace(BARE_URL_RE, (u) => (SITE_RE.test(u) ? u : "")).replace(/\*\*|__/g, "");
    if (t) out.push({ t: "text", text: t });
  };
  let last = 0;
  for (const m of line.matchAll(TOKEN_RE)) {
    text(line.slice(last, m.index));
    last = (m.index ?? 0) + m[0].length;
    if (m[1]) {
      const p = ctx.product(m[1]);
      if (!p) continue; // unknown product: drop it rather than invent one
      used.add(p.id);
      out.push({ t: "product", id: p.id, name: p.name, href: p.href, price: p.priceText, note: ctx.commissionNote });
    } else {
      const label = m[2].replace(/\*\*|__/g, "");
      const path = sitePath(m[3], ctx.pages);
      if (path) {
        pagesOut.add(path.split("#")[0]);
        out.push({ t: "link", text: label, href: path });
      } else {
        out.push({ t: "text", text: label });
      }
    }
  }
  text(line.slice(last));
  return out;
}

export interface Rendered {
  paras: Para[];
  products: string[];
  pages: string[];
  /** The answer as plain text, for logs and for the next turn's history. */
  plain: string;
}

/** Turns the model's text into display parts with only safe links, product cards and commission notes. */
export function renderAnswer(raw: string, ctx: RenderContext): Rendered {
  const used = new Set<string>();
  const pages = new Set<string>();
  const paras: Para[] = [];
  for (const block of raw.replace(/\r/g, "").split(/\n{2,}/)) {
    let openPara: Para | null = null; // plain lines in one block join into one paragraph
    for (const lineRaw of block.split("\n")) {
      const line = lineRaw.replace(/^#{1,6}\s+/, "").trimEnd();
      if (!line.trim()) continue;
      const li = /^\s*(?:[-*•]|\d+[.)])\s+/.exec(line);
      const parts = inline(li ? line.slice(li[0].length) : line, ctx, used, pages);
      if (!parts.length) continue;
      if (li) {
        paras.push({ kind: "li", parts });
        openPara = null;
      } else if (openPara) {
        openPara.parts.push({ t: "text", text: " " }, ...parts);
      } else {
        openPara = { kind: "p", parts };
        paras.push(openPara);
      }
    }
  }
  const plain = paras
    .map((p) => (p.kind === "li" ? "- " : "") + p.parts.map((x) => (x.t === "product" ? x.name : x.t === "link" ? `[${x.text}](${x.href})` : x.text)).join(""))
    .join("\n");
  return { paras, products: [...used], pages: [...pages], plain };
}

/** Removes emails and phone numbers before a question is written to the anonymous log. */
export function redact(s: string): string {
  return s
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, "[phone]");
}

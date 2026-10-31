/**
 * One Ask Spark exchange: checks the switch, the caps and the visitor's
 * limits, calls Claude (server side only), records the real cost, logs the
 * anonymous Q&A and returns safe display parts. The Claude call is passed in,
 * so tests run against a mock and never spend money.
 */

import Anthropic from "@anthropic-ai/sdk";
import { createHash, randomBytes } from "node:crypto";
import {
  AI_LABEL,
  BUSY_TODAY_MESSAGE,
  COMMISSION_NOTE,
  MAX_OUTPUT_TOKENS,
  MODEL,
  RESTING_MESSAGE,
} from "./config";
import { RateLimiter, capState, checkInput, costUsd, redact, renderAnswer, worstCaseCallUsd, type Para } from "./core";
import { SITE_PAGES, catalogById } from "./knowledge";
import { SYSTEM_PROMPT } from "./prompt";
import { AskStore } from "./store";

/** Ask Spark uses its own key (with its own spend limit in the Anthropic Console), never the site's other key. */
export const KEY_ENV = "ASK_SPARK_API_KEY";

export type CreateMessage = (params: Anthropic.MessageCreateParamsNonStreaming) => Promise<Anthropic.Message>;

export type AskResult =
  | { status: "answer"; paras: Para[]; plain: string; label: string }
  | { status: "resting"; message: string }
  | { status: "busy"; message: string }
  | { status: "limited"; message: string }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

export interface Deps {
  create: CreateMessage | null;
  store: AskStore;
  limiter: RateLimiter;
  now?: () => Date;
}

/** Rough upper bound on prompt tokens (about 3 characters per token, rounded up). */
const PROMPT_TOKENS_UPPER = Math.ceil(SYSTEM_PROMPT.length / 3) + 2_000;
const RESERVE_USD = worstCaseCallUsd(PROMPT_TOKENS_UPPER, MAX_OUTPUT_TOKENS);

let inFlightUsd = 0;

const salt = randomBytes(16).toString("hex");
/** Salted one-way hash of the visitor's IP, kept in memory only and never written anywhere. */
export const visitorKey = (ip: string) => createHash("sha256").update(salt + ip).digest("hex").slice(0, 32);

export async function status(deps: Pick<Deps, "create" | "store" | "now">): Promise<"open" | "resting" | "busy"> {
  if (!deps.create) return "resting";
  const cap = capState(await deps.store.getSpend(deps.now?.() ?? new Date()), RESERVE_USD);
  return cap === "month" ? "resting" : cap === "day" ? "busy" : "open";
}

export async function ask(body: unknown, visitor: string, deps: Deps): Promise<AskResult> {
  const now = deps.now?.() ?? new Date();
  if (!deps.create) return { status: "resting", message: RESTING_MESSAGE };

  const input = checkInput(body);
  if (!input.ok) return { status: "invalid", message: input.error };

  const cap = capState(await deps.store.getSpend(now), RESERVE_USD + inFlightUsd);
  if (cap === "month") return { status: "resting", message: RESTING_MESSAGE };
  if (cap === "day") return { status: "busy", message: BUSY_TODAY_MESSAGE };

  const limit = deps.limiter.take(visitor, now.getTime());
  if (limit === "hour") return { status: "limited", message: "You've asked a lot this hour. Please try again a little later, or use our calculators." };
  if (limit === "day") return { status: "limited", message: "You've reached today's question limit. Please come back tomorrow, or use our calculators." };
  if (limit === "site") return { status: "busy", message: "Ask Spark is very busy right now. Please try again in a while, or use our calculators." };

  const messages: Anthropic.MessageParam[] = [
    ...input.history.map((t) => ({ role: t.role, content: t.content })),
    { role: "user", content: input.question },
  ];

  inFlightUsd += RESERVE_USD;
  let res: Anthropic.Message;
  try {
    res = await deps.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      // Short factual answers from the given text: no thinking, lowest effort.
      thinking: { type: "disabled" },
      output_config: { effort: "low" },
      // Rules + knowledge pack are identical on every call, so they are read from the prompt cache.
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages,
    });
  } catch (err) {
    console.error("[ask-spark] API call failed:", err instanceof Anthropic.APIError ? `${err.status} ${err.name}` : (err as Error)?.name);
    await deps.store.log({ t: now.toISOString(), q: redact(input.question), a: "", products: [], pages: [], costUsd: 0, outcome: "error" }, now).catch(() => {});
    return { status: "error", message: "Ask Spark couldn't answer just now. Please try again in a minute, or use our calculators." };
  } finally {
    inFlightUsd = Math.max(0, inFlightUsd - RESERVE_USD);
  }

  const cost = costUsd(res.usage);
  await deps.store.addSpend(cost, now);

  if (res.stop_reason === "refusal") {
    await deps.store.log({ t: now.toISOString(), q: redact(input.question), a: "", products: [], pages: [], costUsd: cost, outcome: "refused" }, now).catch(() => {});
    return { status: "answer", paras: [{ kind: "p", parts: [{ t: "text", text: "Sorry, I can't help with that. I can answer questions about solar, backup power, EV charging, heat pumps, electric boating and energy bills in the US." }] }], plain: "", label: AI_LABEL };
  }

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  const rendered = renderAnswer(text || "Sorry, I don't have an answer for that. Our pages don't cover it yet.", {
    pages: SITE_PAGES,
    product: (id) => {
      const p = catalogById(id);
      return p && { id: p.id, name: p.name, href: p.href, priceText: p.priceText };
    },
    commissionNote: COMMISSION_NOTE,
  });

  await deps.store
    .log(
      { t: now.toISOString(), q: redact(input.question), a: rendered.plain, products: rendered.products, pages: rendered.pages, costUsd: cost, outcome: "answered" },
      now,
    )
    .catch((e) => console.error("[ask-spark] log write failed:", (e as Error)?.message));

  return { status: "answer", paras: rendered.paras, plain: rendered.plain, label: AI_LABEL };
}

// ---------------------------------------------------------------- the live wiring

let liveStore: AskStore | null = null;
let liveLimiter: RateLimiter | null = null;
let liveClient: Anthropic | null = null;

/** Production dependencies. With no key set, `create` is null and the chat rests: no API calls. */
export function liveDeps(): Deps {
  liveStore ??= new AskStore();
  liveLimiter ??= new RateLimiter();
  const key = process.env[KEY_ENV];
  if (!key) return { create: null, store: liveStore, limiter: liveLimiter };
  liveClient ??= new Anthropic({ apiKey: key, maxRetries: 1, timeout: 30_000 });
  const client = liveClient;
  return { create: (p) => client.messages.create(p), store: liveStore, limiter: liveLimiter };
}

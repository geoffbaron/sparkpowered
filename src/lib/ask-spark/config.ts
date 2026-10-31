/**
 * Ask Spark settings: model, spending caps, visitor limits and the fixed
 * wording shown on the page. Plain values only, so server and client code can
 * both import this file.
 */

/** Smallest current Claude model that answers well. */
export const MODEL = "claude-haiku-5-5";

/** Short answers keep cost and reading time down. */
export const MAX_OUTPUT_TOKENS = 700;

/** Hard spending caps in USD, counted from the API's own usage numbers. */
export const MONTHLY_CAP_USD = 20;
export const DAILY_CAP_USD = 2;

/**
 * Claude Haiku 5.5 prices in USD per million tokens (claude-api reference,
 * October 2026). Two rate cards, chosen by the length of the whole prompt.
 * Cache reads are 0.1x the input rate, 5-minute cache writes 1.25x.
 */
export const PRICES = {
  longPromptTokens: 100_000,
  short: { input: 0.1, output: 0.5 },
  long: { input: 0.5, output: 2.5 },
  cacheWriteMultiplier: 1.25,
  cacheReadMultiplier: 0.1,
} as const;

/** Per-visitor limits (visitor = salted hash of the IP, kept in memory only). */
export const VISITOR_PER_HOUR = 15;
export const VISITOR_PER_DAY = 40;
/** Whole-site ceiling so a flood from many addresses cannot run up the bill in an hour. */
export const SITE_PER_HOUR = 400;

export const MAX_QUESTION_CHARS = 600;
/** Earlier turns sent back with each question (user + assistant messages). */
export const MAX_HISTORY_MESSAGES = 6;
export const MAX_HISTORY_ANSWER_CHARS = 1500;

/** Anonymous Q&A logs are deleted after this many days. */
export const LOG_RETENTION_DAYS = 30;

export const AI_LABEL = "Ask Spark is an AI assistant and can be wrong. Check the linked page.";
export const RESTING_MESSAGE = "Ask Spark is resting until next month; use our calculators.";
export const BUSY_TODAY_MESSAGE = "Ask Spark has answered all it can for today. Try again tomorrow, or use our calculators.";
export const COMMISSION_NOTE = "We earn a commission if you buy through this link.";
export const PRIVACY_NOTE =
  "Your messages are sent to Anthropic, the company that makes the AI, only to answer them. They are not used to identify you and are not sold. We keep anonymous logs of questions and answers (no IP address, no names) for up to 30 days to improve answers. Please don't type personal details.";

/** Calculators offered when the chat is resting or a question is out of scope. */
export const CALCULATORS: { href: string; label: string }[] = [
  { href: "/go-electric", label: "Go Electric savings calculator" },
  { href: "/solar-calculator", label: "Solar panel calculator" },
  { href: "/ev-charging-cost", label: "EV charging cost calculator" },
  { href: "/battery-calculator", label: "Home battery sizer" },
  { href: "/power-outage-backup-calculator", label: "Power outage backup calculator" },
  { href: "/ev-charger-installation-cost", label: "EV charger installation cost" },
];

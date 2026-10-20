/**
 * Shared (server and client) rules for the visitor's state: which state the
 * calculators start on. Plain values only, so client components and server
 * pages can both import this file.
 *
 * Order of precedence:
 *   1. ?state=XX in the URL (state pages deep-link into calculators)
 *   2. a state the visitor picked themselves (remembered in localStorage;
 *      "US" means they chose the national average)
 *   3. the state estimated from their connection by /api/locate
 *   4. the page's own default (national average or a typical state)
 */

/** localStorage key for the visitor's own choice. */
export const STATE_CHOICE_KEY = "spark_state";
/** sessionStorage key caching the /api/locate answer for this visit. */
export const STATE_DETECTED_KEY = "spark_state_detected";
/** Window event fired when the choice changes, so every widget on the page follows. */
export const STATE_CHANGE_EVENT = "spark-state-change";
/** Stored choice meaning "show me the national average". */
export const NATIONAL_CHOICE = "US";
export const LOCATE_PATH = "/api/locate";

export type StateSource = "url" | "saved" | "detected";

export interface Resolved {
  /** Two-letter state, or null for the national average / page default. */
  abbr: string | null;
  source: StateSource | null;
}

const norm = (v: string | null | undefined) => (v ?? "").trim().toUpperCase();

export function resolveState(
  { url, saved, detected }: { url?: string | null; saved?: string | null; detected?: string | null },
  valid: readonly string[],
): Resolved {
  const ok = (a: string) => valid.includes(a);
  const u = norm(url);
  if (u && ok(u)) return { abbr: u, source: "url" };
  const s = norm(saved);
  if (s === NATIONAL_CHOICE) return { abbr: null, source: "saved" };
  if (s && ok(s)) return { abbr: s, source: "saved" };
  const d = norm(detected);
  if (d && ok(d)) return { abbr: d, source: "detected" };
  return { abbr: null, source: null };
}

/** Accepts only a well-formed /api/locate body; anything else is "not found". */
export function parseLocate(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const st = (body as { state?: unknown }).state;
  return typeof st === "string" && /^[A-Z]{2}$/.test(st) ? st : null;
}

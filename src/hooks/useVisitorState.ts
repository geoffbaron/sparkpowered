"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  LOCATE_PATH,
  STATE_CHANGE_EVENT,
  STATE_CHOICE_KEY,
  STATE_DETECTED_KEY,
  parseLocate,
  resolveState,
  type Resolved,
} from "@/lib/visitor-state";

function readChoice(): string | null {
  try {
    return localStorage.getItem(STATE_CHOICE_KEY);
  } catch {
    return null;
  }
}

/** undefined = not asked yet this visit; null = asked, no US state found. */
function readDetected(): string | null | undefined {
  try {
    const v = sessionStorage.getItem(STATE_DETECTED_KEY);
    return v === null ? undefined : v || null;
  } catch {
    return undefined;
  }
}

let detected: string | null | undefined;
let pending: Promise<void> | null = null;

function snapshot(): string {
  if (detected === undefined) detected = readDetected();
  return `${readChoice() ?? ""}|${detected ?? ""}`;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STATE_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STATE_CHANGE_EVENT, onChange);
  };
}

function locate() {
  if (detected !== undefined || pending) return;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  pending = fetch(LOCATE_PATH, { cache: "no-store", signal: ctrl.signal })
    .then((r) => (r.ok ? r.json() : null))
    .then((body) => {
      detected = parseLocate(body);
      try {
        sessionStorage.setItem(STATE_DETECTED_KEY, detected ?? "");
      } catch {}
    })
    .catch(() => {
      detected = null;
    })
    .finally(() => {
      clearTimeout(timer);
      pending = null;
      window.dispatchEvent(new Event(STATE_CHANGE_EVENT));
    });
}

/** Remembers the visitor's own pick ("US" = national average) for every calculator. */
export function useChooseState() {
  return (abbr: string) => {
    try {
      localStorage.setItem(STATE_CHOICE_KEY, abbr);
    } catch {}
    window.dispatchEvent(new Event(STATE_CHANGE_EVENT));
  };
}

/**
 * The state a calculator should start on: the visitor's own earlier pick, or
 * else the state estimated from their connection (one small request per
 * visit). Returns { abbr: null } on the server, outside the US, or when
 * `enabled` is false (for example when the URL already names a state).
 */
export function useVisitorState(valid: readonly string[], enabled = true): Resolved {
  const snap = useSyncExternalStore(subscribe, snapshot, () => "|");
  const [saved, found] = snap.split("|");
  useEffect(() => {
    if (enabled && !saved) locate();
  }, [enabled, saved]);
  if (!enabled) return { abbr: null, source: null };
  return resolveState({ saved, detected: found }, valid);
}

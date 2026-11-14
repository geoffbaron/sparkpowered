"use client";

import { useEffect } from "react";
import { partnerClick, sectionOf } from "@/lib/partner-click";

type Tracker = { track?: (n: string, d?: Record<string, string>) => void };

/** Where this visit came from, kept for the visit when it landed with utm_source (Nov 2026: which channel earns). */
const SOURCE_KEY = "sp_utm";
const SENT_KEY = "sp_utm_sent";

/** Remembers utm_source[:utm_campaign] for the visit and returns it ("" when none). */
function rememberSource(): string {
  try {
    const q = new URLSearchParams(window.location.search);
    const source = q.get("utm_source");
    if (source) {
      const campaign = q.get("utm_campaign") ?? "";
      sessionStorage.setItem(SOURCE_KEY, campaign ? `${source}:${campaign}` : source);
    }
    return sessionStorage.getItem(SOURCE_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Sends one utm_landing event per visit, once the analytics tags have loaded. */
function reportLanding(w: { umami?: Tracker; lastlap?: Tracker }, tries = 0) {
  try {
    const value = sessionStorage.getItem(SOURCE_KEY);
    if (!value || sessionStorage.getItem(SENT_KEY) === value) return;
    if (!w.lastlap?.track) {
      if (tries < 10) setTimeout(() => reportLanding(w, tries + 1), 1000);
      return;
    }
    const [source, campaign = ""] = value.split(":");
    const data = { source, campaign, page: window.location.pathname };
    w.umami?.track?.("utm_landing", data);
    w.lastlap.track("utm_landing", data);
    sessionStorage.setItem(SENT_KEY, value);
  } catch {
    /* storage blocked: skip */
  }
}

/**
 * Sends a partner_click event (brand, page, section, tracked, source) to Umami and LastLap
 * for every click on a link to a partner's store, wherever on the site the link lives.
 */
export default function PartnerClickTracker() {
  useEffect(() => {
    rememberSource();
    reportLanding(window as unknown as { umami?: Tracker; lastlap?: Tracker });
    const onClick = (e: MouseEvent) => {
      if (e.type === "auxclick" && e.button !== 1) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const hit = partnerClick(a.href, window.location.origin);
      if (!hit) return;
      const w = window as unknown as { umami?: Tracker; lastlap?: Tracker };
      const page = window.location.pathname;
      const data: Record<string, string> = { brand: hit.brand, page, section: sectionOf(page), tracked: hit.tracked ? "yes" : "no" };
      const source = rememberSource();
      if (source) data.source = source;
      w.umami?.track?.("partner_click", data);
      w.lastlap?.track?.("partner_click", data);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);
  return null;

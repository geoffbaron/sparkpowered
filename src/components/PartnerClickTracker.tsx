"use client";

import { useEffect } from "react";
import { partnerClick } from "@/lib/partner-click";

type Tracker = { track?: (n: string, d?: Record<string, string>) => void };

/**
 * Sends a partner_click event (brand, page, tracked) to Umami and LastLap for every click
 * on a link to a partner's store, wherever on the site the link lives.
 */
export default function PartnerClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.type === "auxclick" && e.button !== 1) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const hit = partnerClick(a.href, window.location.origin);
      if (!hit) return;
      const data = { brand: hit.brand, page: window.location.pathname, tracked: hit.tracked ? "yes" : "no" };
      const w = window as unknown as { umami?: Tracker; lastlap?: Tracker };
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
}

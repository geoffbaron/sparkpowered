"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AskSpark from "@/components/AskSpark";

/** Pages where the corner button would get in the way or repeat itself. */
const HIDDEN_ON = ["/ask", "/admin", "/solartopia"];

/** Small "Ask Spark" button in the bottom-right corner that opens the chat in a panel. */
export default function AskSparkLauncher() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  // The off-grid kit picker pins a buy bar to the bottom on phones; sit above it.
  const [raised, setRaised] = useState(false);

  useEffect(() => {
    setOpen(false);
    setRaised(!!document.querySelector('[data-testid="kit-sticky"]'));
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  const bottom = raised ? "bottom-24 lg:bottom-5" : "bottom-5";

  return (
    <div className="print:hidden">
      {open && (
        <div
          role="dialog"
          aria-label="Ask Spark"
          className={`fixed right-4 ${bottom} z-50 w-[calc(100vw-2rem)] max-w-sm max-h-[calc(100dvh-2.5rem)] overflow-y-auto rounded-2xl bg-background shadow-2xl ring-1 ring-black/10`}
          data-testid="ask-spark-panel"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-black/10 bg-background px-4 py-2.5">
            <p className="font-bold text-ink">Ask Spark</p>
            <div className="flex items-center gap-3">
              <Link href="/ask" className="text-sm underline underline-offset-2 text-stone-600 hover:text-spark-orange">
                Full page
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Ask Spark"
                className="rounded-full p-1.5 text-stone-600 hover:bg-stone-100"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-3">
            <AskSpark />
          </div>
        </div>
      )}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`fixed right-4 ${bottom} z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-spark-yellow to-spark-orange px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-xl`}
          data-testid="ask-spark-launcher"
        >
          <svg viewBox="0 0 24 28" className="h-4 w-4" aria-hidden="true">
            <path d="M14 1 3 16h7l-2 11 13-16h-7l3-10z" fill="currentColor" />
          </svg>
          Ask Spark
        </button>
      )}
    </div>
  );
}

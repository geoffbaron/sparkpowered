"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CREDIT_ENDED, GOALS, GOAL_LINKS, type Goal } from "@/data/solartopia";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";
import type { EndingFigures } from "@/lib/solartopia/ending";
import { achievementLine, sharePath, shareSentence, totalStars } from "@/lib/solartopia/share";
import { track } from "@/lib/solartopia/track";
import { MAX_STARS } from "@/data/solartopia";

type Step = "turn" | "goal" | "answer";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function Ending({ stars, jars, picks, onReplay }: { stars: number[]; jars: number; picks: { outage: ReactNode; drive: ReactNode }; onReplay: () => void }) {
  const [data, setData] = useState<Record<string, EndingFigures> | null>(null);
  const [failed, setFailed] = useState(false);
  const [step, setStep] = useState<Step>("turn");
  const [goal, setGoal] = useState<Goal | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const choose = useChooseState();

  useEffect(() => {
    let live = true;
    fetch("/solartopia/ending-data")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((j) => live && setData(j))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  const valid = useMemo(() => (data ? Object.keys(data) : []), [data]);
  const located = useVisitorState(valid, !!data);
  const abbr = picked ?? located.abbr ?? "US";
  const fig = data && abbr !== "US" ? data[abbr] : null;
  const total = totalStars(stars);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);
  const showToast = (t: string) => {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const proceed = () => {
    if (!fig) return;
    choose(fig.abbr);
    track("st_state", { abbr: fig.abbr, detected: located.source === "detected" && picked === null });
    setStep("goal");
  };

  const pickGoal = (g: Goal) => {
    setGoal(g);
    track("st_goal", { goal: g });
    setStep("answer");
  };

  const share = useCallback(async () => {
    const url = `${window.location.origin}${sharePath(stars)}`;
    const text = shareSentence(stars);
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title: "Solartopia", text, url });
        track("st_share", { method: "native" });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied.");
    } catch {
      showToast(url);
    }
    track("st_share", { method: "copy" });
  }, [stars]);

  const cta = (dest: string) => track("st_cta", { dest });

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto bg-[#1e2a4a]/60 p-2 flex" data-testid="ending" data-step={step}>
      <div className="st-card rounded-2xl p-4 max-w-lg w-full m-auto">
        {step === "turn" && (
          <div data-testid="ending-turn">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a4a2c]">
              {total} of {MAX_STARS} stars
            </p>
            <h2 className="text-xl font-extrabold leading-tight mt-1">Your turn</h2>
            <p className="text-[15px] mt-1">{achievementLine(stars)} Now think about your own home.</p>
            {failed && (
              <p className="text-[14px] mt-3">
                We could not load the numbers. Try the <Link href="/states" className="underline">state pages</Link> instead.
              </p>
            )}
            {!data && !failed && <p className="text-[14px] mt-3">Finding your state.</p>}
            {data && (
              <>
                <label htmlFor="st-state" className="block text-[13px] font-bold mt-3">
                  Your state
                </label>
                <select
                  id="st-state"
                  data-testid="state-select"
                  className="mt-1 w-full min-h-12 rounded-xl border-2 border-[#3a2a33]/50 bg-white px-3 text-[16px]"
                  value={fig ? fig.abbr : ""}
                  onChange={(e) => {
                    setPicked(e.target.value);
                    choose(e.target.value);
                  }}
                >
                  {!fig && <option value="">Choose your state</option>}
                  {Object.values(data)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((f) => (
                      <option key={f.abbr} value={f.abbr}>
                        {f.name}
                      </option>
                    ))}
                </select>
                {fig && (
                  <p className="text-[16px] mt-3" data-testid="bill-line">
                    The average home in {fig.name} pays about <strong>{usd(fig.billUsd)} a month</strong> for electricity.
                  </p>
                )}
                <button type="button" className="st-btn st-btn-primary w-full mt-3" onClick={proceed} disabled={!fig} data-testid="turn-go">
                  What could sunshine do for my home?
                </button>
              </>
            )}
          </div>
        )}

        {step === "goal" && (
          <div data-testid="ending-goal">
            <h2 className="text-xl font-extrabold leading-tight">What do you want most?</h2>
            <div className="mt-3 grid gap-2">
              {GOALS.map((g) => (
                <button key={g.id} type="button" className="st-btn text-left !items-start !justify-start flex-col !py-3" onClick={() => pickGoal(g.id)} data-testid={`goal-${g.id}`}>
                  <span className="text-[16px] font-bold">{g.label}</span>
                  <span className="text-[13px] font-normal opacity-80">{g.note}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "answer" && goal && fig && (
          <div data-testid="ending-answer" data-goal={goal}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a4a2c]">{fig.name}</p>
            {goal === "bill" && (
              <>
                <h2 className="text-xl font-extrabold leading-tight mt-1" data-testid="answer-line">
                  An {fig.kitW} W plug-in kit here is worth up to {usd(fig.pluginValueYear)} a year.
                </h2>
                <p className="text-[14px] mt-2">That is the most it could save: it assumes you use every bit of the power at home as it is made.</p>
                <p className="text-[14px] mt-2">{fig.lawLine}</p>
              </>
            )}
            {goal === "outage" && (
              <>
                <h2 className="text-xl font-extrabold leading-tight mt-1" data-testid="answer-line">
                  {jars > 0 ? "You ran the night on a battery jar. At home, a backup battery does the same job." : "A backup battery keeps the lights on when the grid goes down."}
                </h2>
                <p className="text-[14px] mt-2">
                  The pick below is a portable power station: it runs the essentials, not the whole house. A whole-home battery is a bigger purchase; one would run an average {fig.name} home for about {fig.batteryHours} hours.
                </p>
              </>
            )}
            {goal === "drive" && (
              <>
                <h2 className="text-xl font-extrabold leading-tight mt-1" data-testid="answer-line">
                  Charging at home costs about {usd(fig.evMonthlyUsd)} a month. Gas costs about {usd(fig.gasMonthlyUsd)}.
                </h2>
                <p className="text-[14px] mt-2">
                  That is for 1,000 miles a month, so about {usd(fig.savingMonthlyUsd)} a month less to run, before the cost of the car and a charger. It is grid power, not solar: solar at home could lower it further.
                </p>
              </>
            )}
            <div className="mt-3 grid gap-2">
              <Link href={GOAL_LINKS[goal].primary.href} className="st-btn st-btn-primary" onClick={() => cta(GOAL_LINKS[goal].primary.href)} data-testid="cta-primary">
                {GOAL_LINKS[goal].primary.label}
              </Link>
              <p className="text-[13px]">
                More:{" "}
                {GOAL_LINKS[goal].more.map((l, i) => (
                  <span key={l.href}>
                    {i > 0 && " · "}
                    <Link href={l.href} className="underline font-semibold" onClick={() => cta(l.href)} data-testid="cta-more">
                      {l.label}
                    </Link>
                  </span>
                ))}
              </p>
            </div>
            {(goal === "outage" || goal === "drive") && (
              <div
                className="mt-3"
                data-testid="pick"
                onClickCapture={(e) => {
                  const a = (e.target as HTMLElement).closest("a[data-partner]");
                  if (a) track("st_partner", { brand: a.getAttribute("data-partner") ?? "", product: a.closest("[data-product]")?.getAttribute("data-product") ?? "" });
                }}
              >
                <p className="text-[12px] font-bold uppercase tracking-wide text-[#8a4a2c] mb-1">One we&apos;d look at first</p>
                {goal === "outage" ? picks.outage : picks.drive}
              </div>
            )}
            <p className="text-[12px] mt-3 text-[#4a3a43]">
              {CREDIT_ENDED}{" "}
              <Link href="/incentives" className="underline font-semibold" onClick={() => cta("/incentives")}>
                What is available now
              </Link>
            </p>
            <div className="flex gap-2 mt-3">
              <button type="button" className="st-btn flex-1" onClick={share} data-testid="share">
                Share my result
              </button>
              <button type="button" className="st-btn flex-1" onClick={() => setStep("goal")} data-testid="other-goal">
                Another goal
              </button>
              <button type="button" className="st-btn flex-1" onClick={onReplay} data-testid="play-again">
                Play again
              </button>
            </div>
          </div>
        )}
        {toast && (
          <div className="mt-3 st-chip text-center" role="status" data-testid="share-toast">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

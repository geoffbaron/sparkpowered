"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AI_LABEL, CALCULATORS, MAX_HISTORY_MESSAGES, MAX_QUESTION_CHARS, PRIVACY_NOTE, RESTING_MESSAGE } from "@/lib/ask-spark/config";
import type { Para, Turn } from "@/lib/ask-spark/core";

type Status = "loading" | "open" | "resting" | "busy";

interface Msg {
  role: "user" | "assistant";
  text: string;
  paras?: Para[];
  /** Plain text of the answer, sent back as history on the next question. */
  plain?: string;
  notice?: boolean;
}

const EXAMPLES = [
  "Is solar still worth it without the tax credit?",
  "What size power station runs my fridge in an outage?",
  "Do I need a Level 2 charger for my EV?",
  "Does a heat pump save money over a gas furnace?",
];

/** LastLap analytics custom event; no message content is ever sent. */
function track(name: string) {
  try {
    (window as unknown as { lastlap?: { track?: (n: string) => void } }).lastlap?.track?.(name);
  } catch {
    /* analytics must never break the chat */
  }
}

function Answer({ paras }: { paras: Para[] }) {
  const blocks: React.ReactNode[] = [];
  let list: React.ReactNode[] = [];
  const flush = () => {
    if (list.length) blocks.push(<ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-1">{list}</ul>);
    list = [];
  };
  paras.forEach((p, i) => {
    const content = p.parts.map((x, j) => {
      if (x.t === "text") return <span key={j}>{x.text}</span>;
      if (x.t === "link")
        return (
          <Link key={j} href={x.href} className="underline underline-offset-2 text-spark-orange hover:text-spark-amber">
            {x.text}
          </Link>
        );
      return (
        <span key={j} data-product={x.id}>
          <a href={x.href} target="_blank" rel="sponsored nofollow noopener" className="font-semibold underline underline-offset-2 text-spark-orange hover:text-spark-amber">
            {x.name}
          </a>
          {x.price ? <span> ({x.price})</span> : null}
          <span className="text-xs text-muted"> {x.note}</span>
        </span>
      );
    });
    if (p.kind === "li") list.push(<li key={i}>{content}</li>);
    else {
      flush();
      blocks.push(<p key={i}>{content}</p>);
    }
  });
  flush();
  return <div className="space-y-2">{blocks}</div>;
}

function CalculatorLinks() {
  return (
    <ul className="grid sm:grid-cols-2 gap-2 mt-3">
      {CALCULATORS.map((c) => (
        <li key={c.href}>
          <Link href={c.href} className="block rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium hover:border-spark-orange">
            {c.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function AskSpark() {
  const [status, setStatus] = useState<Status>("loading");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/ask", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { status?: Status }) => live && setStatus(j.status === "open" || j.status === "busy" ? j.status : "resting"))
      .catch(() => live && setStatus("resting"));
    track("ask_spark_open");
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [msgs]);

  async function send(question: string) {
    const text = question.trim().slice(0, MAX_QUESTION_CHARS);
    if (!text || sending) return;
    const history: Turn[] = msgs
      .filter((m) => !m.notice && (m.role === "user" || m.plain))
      .map((m) => ({ role: m.role, content: m.role === "user" ? m.text : (m.plain ?? "") }))
      .slice(-MAX_HISTORY_MESSAGES);
    setMsgs((m) => [...m, { role: "user", text }]);
    setQ("");
    setSending(true);
    track("ask_spark_send");
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history }),
      });
      const j = (await r.json()) as { status: string; message?: string; paras?: Para[]; plain?: string };
      if (j.status === "answer" && j.paras) {
        setMsgs((m) => [...m, { role: "assistant", text: "", paras: j.paras, plain: j.plain }]);
      } else {
        if (j.status === "resting") setStatus("resting");
        setMsgs((m) => [...m, { role: "assistant", text: j.message ?? "Something went wrong. Please try again.", notice: true }]);
      }
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: "Ask Spark couldn't be reached. Check your connection and try again.", notice: true }]);
    } finally {
      setSending(false);
    }
  }

  if (status === "resting") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5" data-ask-state="resting">
        <p className="font-semibold text-ink">{RESTING_MESSAGE}</p>
        <CalculatorLinks />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white shadow-sm" data-ask-state={status}>
      <p className="px-4 pt-4 text-sm font-medium text-amber-800" role="note">
        {AI_LABEL}
      </p>
      <div className="px-4 py-3 space-y-4 max-h-[60vh] overflow-y-auto" aria-live="polite">
        {msgs.length === 0 && (
          <div>
            <p className="text-stone-700 mb-2">Ask about solar, backup power, EV charging at home, heat pumps, electric boats, incentives or your bill. Answers come from our fact-checked pages.</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((e) => (
                <button key={e} type="button" disabled={status !== "open"} onClick={() => send(e)} className="rounded-full border border-black/15 px-3 py-1.5 text-sm hover:border-spark-orange disabled:opacity-50">
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-2xl bg-stone-100 px-3 py-2 text-ink whitespace-pre-wrap">
              {m.text}
            </div>
          ) : (
            <div key={i} className="max-w-[95%] text-stone-800 leading-relaxed">
              {m.paras ? <Answer paras={m.paras} /> : <p className={m.notice ? "text-amber-800" : ""}>{m.text}</p>}
              {m.paras && <p className="mt-1 text-xs text-muted">{AI_LABEL}</p>}
            </div>
          ),
        )}
        {sending && <p className="text-sm text-muted">Ask Spark is checking our pages…</p>}
        <div ref={endRef} />
      </div>
      {status === "busy" && <p className="px-4 text-sm text-amber-800">Ask Spark has answered all it can for today. Try again tomorrow, or use our calculators.</p>}
      <form
        className="border-t border-black/10 p-3 flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(q);
        }}
      >
        <label htmlFor="ask-spark-q" className="sr-only">
          Your question
        </label>
        <textarea
          id="ask-spark-q"
          value={q}
          maxLength={MAX_QUESTION_CHARS}
          rows={2}
          disabled={status !== "open"}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(q);
            }
          }}
          placeholder="Ask a question about going electric"
          className="w-full rounded-xl border border-black/20 px-3 py-2 text-base"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted">
            {q.length}/{MAX_QUESTION_CHARS}
          </span>
          <button
            type="submit"
            disabled={status !== "open" || sending || !q.trim()}
            className="rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange px-5 py-2 text-sm font-bold text-white shadow disabled:opacity-50"
          >
            Ask
          </button>
        </div>
        <p className="text-xs text-muted">
          {PRIVACY_NOTE}{" "}
          <Link href="/privacy#ask-spark" className="underline">
            Privacy
          </Link>
        </p>
      </form>
      {msgs.length > 0 && (
        <div className="border-t border-black/10 px-4 pb-4">
          <p className="pt-3 text-sm font-semibold text-ink">Run your own numbers</p>
          <CalculatorLinks />
        </div>
      )}
    </div>
  );
}

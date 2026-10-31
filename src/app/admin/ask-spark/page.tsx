import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminToken } from "@/lib/admin-auth";
import { DAILY_CAP_USD, MONTHLY_CAP_USD } from "@/lib/ask-spark/config";
import { liveDeps, status } from "@/lib/ask-spark/engine";

/** Weekly review of Ask Spark: spend against the caps and the last 7 days of anonymous Q&A. */
async function Review() {
  const cookieStore = await cookies();
  if (!(await isAdminToken(cookieStore.get(ADMIN_COOKIE)?.value))) redirect("/admin/login");
  const deps = liveDeps();
  const [spend, state, entries] = await Promise.all([deps.store.getSpend(), status(deps), deps.store.recent(7)]);
  const usd = (n: number) => `$${n.toFixed(n < 1 ? 4 : 2)}`;
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">Ask Spark review</h1>
      <p>
        Status: <strong>{state}</strong> · This month: <strong>{usd(spend.monthUsd)}</strong> of ${MONTHLY_CAP_USD} · Today:{" "}
        <strong>{usd(spend.dayUsd)}</strong> of ${DAILY_CAP_USD} · Questions in the last 7 days: <strong>{entries.length}</strong>
      </p>
      <ul className="space-y-4">
        {entries.map((e, i) => (
          <li key={i} className="rounded-xl border border-black/10 p-4 text-sm">
            <p className="text-muted">
              {e.t} · {e.outcome} · {usd(e.costUsd)}
              {e.products.length ? ` · products: ${e.products.join(", ")}` : ""}
            </p>
            <p className="font-semibold mt-1">Q: {e.q}</p>
            <p className="whitespace-pre-wrap mt-1">A: {e.a || "(none)"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AskSparkReviewPage() {
  return (
    <Suspense fallback={<p className="p-10 text-muted">Loading…</p>}>
      <Review />
    </Suspense>
  );
}

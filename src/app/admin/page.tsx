import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

// ── Umami helpers ────────────────────────────────────────────────────────────

const UMAMI_API = "https://api.umami.is/v1";
const WEBSITE_ID = "d044bc8b-0fdc-43ca-a02a-a96ab8ea0e04";

async function umamiFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
  const apiKey = process.env.UMAMI_API_KEY;
  if (!apiKey) return null;

  const url = new URL(`${UMAMI_API}/websites/${WEBSITE_ID}${endpoint}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString(), {
      headers: { "x-umami-api-key": apiKey },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

type UmamiStats = {
  pageviews: { value: number; prev: number };
  visitors: { value: number; prev: number };
  visits: { value: number; prev: number };
  bounces: { value: number; prev: number };
  totaltime: { value: number; prev: number };
};

type UmamiPageview = { x: string; y: number };
type UmamiMetric = { x: string; y: number };
type UmamiActive = { visitors?: number; x?: number };

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-black/6 p-6 shadow-sm">
      <div className="text-sm text-muted font-medium mb-1">{label}</div>
      <div className={`text-3xl font-extrabold ${accent ?? "text-foreground"}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}

function BarChart({
  title,
  data,
  total,
}: {
  title: string;
  data: { label: string; count: number }[];
  total: number;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div className="bg-surface rounded-2xl border border-black/6 p-6 shadow-sm">
      <h3 className="font-bold mb-4 text-sm text-muted uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-3">
        {data.slice(0, 10).map(({ label, count }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-32 text-sm font-medium truncate shrink-0" title={label}>{label}</div>
            <div className="flex-1 bg-amber-50 rounded-full h-5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-spark-yellow to-spark-orange rounded-full transition-all"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <div className="text-sm font-bold w-10 text-right">{count.toLocaleString()}</div>
            <div className="text-xs text-muted w-8 text-right">
              {total > 0 ? Math.round((count / total) * 100) : 0}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function delta(current: number, prev: number): string | undefined {
  if (!Number.isFinite(current) || !Number.isFinite(prev) || prev === 0) return undefined;
  const pct = Math.round(((current - prev) / prev) * 100);
  if (!Number.isFinite(pct)) return undefined;
  return `${pct >= 0 ? "+" : ""}${pct}% vs prior period`;
}

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function activeVisitorsCount(active: UmamiActive | null | undefined): number | undefined {
  const count = active?.visitors ?? active?.x;
  return Number.isFinite(count) ? count : undefined;
}

// ── Page ─────────────────────────────────────────────────────────────────────

async function AdminContent() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth")?.value;
  if (token !== process.env.ADMIN_PASSWORD) redirect("/admin/login");

  const apiKey = process.env.UMAMI_API_KEY;

  // Time ranges
  const nowDate = new Date();
  const now = nowDate.getTime();
  const dayMs = 86_400_000;
  const startOfTodayDate = new Date(nowDate);
  startOfTodayDate.setHours(0, 0, 0, 0);
  const startOfToday = startOfTodayDate.getTime();
  const thirtyDaysAgo = now - 30 * dayMs;

  // Fetch all Umami data in parallel
  const [stats30d, statsToday, active, pageviewsDaily, topPages, topReferrers, topBrowsers, topCountries, topDevices] = await Promise.all([
    umamiFetch<UmamiStats>("/stats", {
      startAt: String(thirtyDaysAgo),
      endAt: String(now),
    }),
    umamiFetch<UmamiStats>("/stats", {
      startAt: String(startOfToday),
      endAt: String(now),
    }),
    umamiFetch<UmamiActive>("/active"),
    umamiFetch<{ pageviews: UmamiPageview[]; sessions: UmamiPageview[] }>("/pageviews", {
      startAt: String(thirtyDaysAgo),
      endAt: String(now),
      unit: "day",
    }),
    umamiFetch<UmamiMetric[]>("/metrics", {
      startAt: String(thirtyDaysAgo),
      endAt: String(now),
      type: "url",
    }),
    umamiFetch<UmamiMetric[]>("/metrics", {
      startAt: String(thirtyDaysAgo),
      endAt: String(now),
      type: "referrer",
    }),
    umamiFetch<UmamiMetric[]>("/metrics", {
      startAt: String(thirtyDaysAgo),
      endAt: String(now),
      type: "browser",
    }),
    umamiFetch<UmamiMetric[]>("/metrics", {
      startAt: String(thirtyDaysAgo),
      endAt: String(now),
      type: "country",
    }),
    umamiFetch<UmamiMetric[]>("/metrics", {
      startAt: String(thirtyDaysAgo),
      endAt: String(now),
      type: "device",
    }),
  ]);

  const hasData = apiKey && stats30d;

  // Derived values
  const pageviews30d = stats30d?.pageviews.value ?? 0;
  const visitors30d = stats30d?.visitors.value ?? 0;
  const visits30d = stats30d?.visits.value ?? 0;
  const bounces30d = stats30d?.bounces.value ?? 0;
  const bounceRate = visits30d > 0 ? Math.round((bounces30d / visits30d) * 100) : 0;
  const avgTime = visits30d > 0 ? (stats30d?.totaltime.value ?? 0) / visits30d : 0;

  const pageviewsToday = statsToday?.pageviews.value ?? 0;
  const visitorsToday = statsToday?.visitors.value ?? 0;
  const activeVisitors = activeVisitorsCount(active);

  // Chart data
  const dailyData = pageviewsDaily?.pageviews ?? [];
  const dailyMax = Math.max(...dailyData.map((d) => d.y), 1);

  const pagesData = (topPages ?? []).map((m) => ({ label: m.x || "/", count: m.y }));
  const referrerData = (topReferrers ?? []).filter((m) => m.x).map((m) => ({ label: m.x, count: m.y }));
  const browserData = (topBrowsers ?? []).map((m) => ({ label: m.x || "Unknown", count: m.y }));
  const countryData = (topCountries ?? []).map((m) => ({ label: m.x || "Unknown", count: m.y }));
  const deviceData = (topDevices ?? []).map((m) => ({ label: m.x || "Unknown", count: m.y }));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-black/6 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="font-bold text-lg leading-none">Spark Powered Admin</h1>
              <p className="text-xs text-muted mt-0.5">Site analytics dashboard</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {!apiKey && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-start gap-3 text-sm">
            <span className="text-amber-500 text-lg leading-tight">⚠</span>
            <span className="text-muted">
              <strong className="text-foreground">Umami API key not configured</strong> — set{" "}
              <code className="bg-amber-100 px-1 rounded text-xs">UMAMI_API_KEY</code> in your
              environment variables to see live analytics data here.
            </span>
          </div>
        )}

        {apiKey && !hasData && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-start gap-3 text-sm">
            <span className="text-amber-500 text-lg leading-tight">⚠</span>
            <span className="text-muted">
              <strong className="text-foreground">Could not fetch analytics</strong> — check that
              your API key is valid and Umami Cloud is reachable.
            </span>
          </div>
        )}

        {/* Overview stats */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Overview — Last 30 Days</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              label="Active Now"
              value={activeVisitors ?? "—"}
              sub="Real-time visitors"
              accent="text-green-600"
            />
            <StatCard
              label="Pageviews"
              value={hasData ? pageviews30d.toLocaleString() : "—"}
              sub={hasData ? delta(stats30d.pageviews.value, stats30d.pageviews.prev) : undefined}
              accent="text-spark-orange"
            />
            <StatCard
              label="Unique Visitors"
              value={hasData ? visitors30d.toLocaleString() : "—"}
              sub={hasData ? delta(stats30d.visitors.value, stats30d.visitors.prev) : undefined}
            />
            <StatCard
              label="Bounce Rate"
              value={hasData ? `${bounceRate}%` : "—"}
              sub={hasData ? `${visits30d.toLocaleString()} total visits` : undefined}
            />
            <StatCard
              label="Avg. Visit Duration"
              value={hasData ? formatDuration(avgTime) : "—"}
              sub={hasData ? `${pageviewsToday.toLocaleString()} pageviews today` : undefined}
            />
          </div>
        </section>

        {/* Today highlight */}
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Today</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-extrabold text-spark-orange">
                {hasData ? pageviewsToday.toLocaleString() : "—"}
              </div>
              <div className="text-sm text-muted mt-1">Pageviews today</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-spark-orange">
                {hasData ? visitorsToday.toLocaleString() : "—"}
              </div>
              <div className="text-sm text-muted mt-1">Unique visitors today</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-spark-orange">
                {activeVisitors ?? "—"}
              </div>
              <div className="text-sm text-muted mt-1">On the site right now</div>
            </div>
          </div>
        </section>

        {/* Daily pageviews trend */}
        <section className="bg-surface rounded-2xl border border-black/6 p-6 shadow-sm">
          <h3 className="font-bold mb-4 text-sm text-muted uppercase tracking-wide">
            Daily Pageviews (last 30 days)
          </h3>
          {dailyData.length === 0 ? (
            <p className="text-sm text-muted">No data yet.</p>
          ) : (
            <div className="flex items-end gap-[3px] h-28">
              {dailyData.map((d, i) => {
                const date = new Date(d.x);
                const showLabel = i % 7 === 0;
                return (
                  <div key={d.x} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-6 bg-foreground text-background text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}: {d.y}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-spark-orange to-spark-yellow rounded-t-sm transition-all"
                      style={{ height: `${(d.y / dailyMax) * 96}px`, minHeight: d.y > 0 ? "2px" : "0" }}
                    />
                    {showLabel && (
                      <span className="text-[10px] text-muted">
                        {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Breakdown charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <BarChart title="Top Pages" data={pagesData} total={pageviews30d} />
          <BarChart title="Referrers" data={referrerData} total={visitors30d} />
          <BarChart title="Browsers" data={browserData} total={visitors30d} />
          <BarChart title="Countries" data={countryData} total={visitors30d} />
        </div>

        {/* Device breakdown */}
        {deviceData.length > 0 && (
          <section className="bg-surface rounded-2xl border border-black/6 p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-sm text-muted uppercase tracking-wide">
              Devices
            </h3>
            <div className="flex gap-6 text-sm flex-wrap">
              {deviceData.map((d) => (
                <div key={d.label}>
                  <span className="text-2xl font-extrabold text-spark-orange">{d.count.toLocaleString()}</span>
                  <span className="text-muted ml-2">
                    {d.label} ({visitors30d > 0 ? Math.round((d.count / visitors30d) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted">Loading…</div>}>
      <AdminContent />
    </Suspense>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import type { Lead } from "@/app/api/leads/route";
import { STATE_NAMES } from "@/lib/zipToState";
import installers from "@/data/installers";
import LogoutButton from "./LogoutButton";

// ── Data helpers ─────────────────────────────────────────────────────────────

async function getLeads(): Promise<Lead[]> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "data", "leads.json"),
      "utf-8"
    );
    return JSON.parse(raw) as Lead[];
  } catch {
    return [];
  }
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function weeksAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n * 7);
  return d;
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
        {data.slice(0, 8).map(({ label, count }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-24 text-sm font-medium truncate shrink-0">{label}</div>
            <div className="flex-1 bg-amber-50 rounded-full h-5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-spark-yellow to-spark-orange rounded-full transition-all"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <div className="text-sm font-bold w-8 text-right">{count}</div>
            <div className="text-xs text-muted w-8 text-right">
              {total > 0 ? Math.round((count / total) * 100) : 0}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  // Double-check auth server-side (middleware handles redirect, this is a backup)
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth")?.value;
  if (token !== process.env.ADMIN_PASSWORD) redirect("/admin/login");

  const leads = await getLeads();
  const now = new Date();
  const today = startOfDay(now);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const leadsToday = leads.filter((l) => new Date(l.timestamp) >= today).length;
  const leadsThisMonth = leads.filter((l) => new Date(l.timestamp) >= thisMonth).length;
  const leadsLastMonth = leads.filter(
    (l) =>
      new Date(l.timestamp) >= lastMonth &&
      new Date(l.timestamp) <= lastMonthEnd
  ).length;
  const monthDelta = leadsLastMonth > 0
    ? Math.round(((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100)
    : null;

  // Leads by state
  const byState: Record<string, number> = {};
  leads.forEach((l) => {
    const key = l.state ? `${STATE_NAMES[l.state] ?? l.state} (${l.state})` : "Unknown";
    byState[key] = (byState[key] ?? 0) + 1;
  });
  const byStateData = Object.entries(byState)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  // Leads by interest
  const byInterest: Record<string, number> = {};
  leads.forEach((l) =>
    l.interest.forEach((i) => {
      byInterest[i] = (byInterest[i] ?? 0) + 1;
    })
  );
  const interestLabels: Record<string, string> = {
    solar: "Solar Panels",
    battery: "Home Battery",
    "ev-charger": "EV Charger",
    community: "Community Solar",
  };
  const byInterestData = Object.entries(byInterest)
    .map(([key, count]) => ({ label: interestLabels[key] ?? key, count }))
    .sort((a, b) => b.count - a.count);

  // Leads by monthly bill
  const byBill: Record<string, number> = {};
  leads.forEach((l) => {
    const label =
      l.monthlyBill === "low"
        ? "Under $100"
        : l.monthlyBill === "mid"
        ? "$100–$200"
        : l.monthlyBill === "high"
        ? "$200–$400"
        : l.monthlyBill === "vhigh"
        ? "$400+"
        : "Not stated";
    byBill[label] = (byBill[label] ?? 0) + 1;
  });
  const billOrder = ["Under $100", "$100–$200", "$200–$400", "$400+", "Not stated"];
  const byBillData = billOrder
    .filter((k) => byBill[k])
    .map((label) => ({ label, count: byBill[label] }));

  // Leads by installer
  const byInstaller: Record<string, number> = {};
  leads.forEach((l) => {
    if (l.installerName) {
      byInstaller[l.installerName] = (byInstaller[l.installerName] ?? 0) + 1;
    }
  });
  const byInstallerData = Object.entries(byInstaller)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  // Weekly trend (last 8 weeks)
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = weeksAgo(7 - i);
    const weekEnd = weeksAgo(6 - i);
    return {
      label: `W${i + 1}`,
      count: leads.filter((l) => {
        const t = new Date(l.timestamp);
        return t >= weekStart && t < weekEnd;
      }).length,
    };
  });
  const weekMax = Math.max(...weeklyData.map((w) => w.count), 1);

  // Homeowner breakdown
  const homeOwners = leads.filter((l) => l.homeOwner === "Yes").length;
  const renters = leads.filter((l) => l.homeOwner === "No").length;

  // Revenue potential (rough)
  const featuredSlots = byStateData.length;
  const revenueEstimate = featuredSlots * 150; // $150/mo per featured state slot

  const recent = [...leads].reverse().slice(0, 20);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-black/6 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="font-bold text-lg leading-none">Spark Powered Admin</h1>
              <p className="text-xs text-muted mt-0.5">Lead analytics &amp; monetization dashboard</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Storage notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-start gap-3 text-sm">
          <span className="text-amber-500 text-lg leading-tight">ℹ</span>
          <span className="text-muted">
            <strong className="text-foreground">Local file storage</strong> — leads are saved to{" "}
            <code className="bg-amber-100 px-1 rounded text-xs">data/leads.json</code> on this server.
            For production, replace with Supabase, PlanetScale, or similar.
          </span>
        </div>

        {/* Summary stats */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Leads"
              value={leads.length}
              sub="All time"
              accent="text-spark-orange"
            />
            <StatCard
              label="This Month"
              value={leadsThisMonth}
              sub={
                monthDelta !== null
                  ? `${monthDelta >= 0 ? "+" : ""}${monthDelta}% vs last month`
                  : "First month"
              }
            />
            <StatCard label="Today" value={leadsToday} sub={now.toLocaleDateString()} />
            <StatCard
              label="States with Demand"
              value={byStateData.filter((d) => !d.label.startsWith("Unknown")).length}
              sub="Potential featured slots"
            />
          </div>
        </section>

        {/* Revenue potential */}
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
            Monetization Potential
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-extrabold text-spark-orange">
                ${revenueEstimate.toLocaleString()}/mo
              </div>
              <div className="text-sm text-muted mt-1">
                If each active state had 1 featured installer @ $150/mo
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-spark-orange">
                ${(leads.length * 75).toLocaleString()}
              </div>
              <div className="text-sm text-muted mt-1">
                If all leads sold @ $75/lead to installers
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-spark-orange">
                {installers.filter((i) => i.tier === "featured").length} / {installers.length}
              </div>
              <div className="text-sm text-muted mt-1">
                Featured installers in database
                {installers.filter((i) => i.tier === "featured").length === 0 && " — none yet"}
              </div>
            </div>
          </div>
        </section>

        {/* Weekly trend */}
        <section className="bg-surface rounded-2xl border border-black/6 p-6 shadow-sm">
          <h3 className="font-bold mb-4 text-sm text-muted uppercase tracking-wide">
            Weekly Lead Volume (last 8 weeks)
          </h3>
          {leads.length === 0 ? (
            <p className="text-sm text-muted">No leads yet.</p>
          ) : (
            <div className="flex items-end gap-2 h-24">
              {weeklyData.map((w) => (
                <div key={w.label} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-spark-orange to-spark-yellow rounded-t-md transition-all"
                    style={{ height: `${(w.count / weekMax) * 80}px`, minHeight: w.count > 0 ? "4px" : "0" }}
                  />
                  <span className="text-xs text-muted">{w.label}</span>
                  <span className="text-xs font-bold">{w.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Charts grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <BarChart title="Leads by State" data={byStateData} total={leads.length} />
          <BarChart title="Interests" data={byInterestData} total={leads.length} />
          <BarChart title="Monthly Bill Size" data={byBillData} total={leads.length} />
          {byInstallerData.length > 0 && (
            <BarChart title="Installer Quote Requests" data={byInstallerData} total={leads.length} />
          )}
        </div>

        {/* Homeowner split */}
        {leads.length > 0 && (
          <section className="bg-surface rounded-2xl border border-black/6 p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-sm text-muted uppercase tracking-wide">
              Homeowner vs Renter
            </h3>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-2xl font-extrabold text-spark-orange">{homeOwners}</span>
                <span className="text-muted ml-2">homeowners ({leads.length > 0 ? Math.round((homeOwners / leads.length) * 100) : 0}%)</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-electric-blue">{renters}</span>
                <span className="text-muted ml-2">renters — potential community solar customers</span>
              </div>
            </div>
          </section>
        )}

        {/* Recent leads table */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
            Recent Leads ({recent.length} of {leads.length})
          </h2>
          {leads.length === 0 ? (
            <div className="bg-surface rounded-2xl border border-black/6 p-12 text-center shadow-sm">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-muted">No leads yet. Submit the Solar Finder form to see data here.</p>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-black/6 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/6 bg-surface-light text-left">
                      {["Date", "Name", "Email", "Phone", "ZIP / State", "Bill", "Interests", "Installer"].map((h) => (
                        <th key={h} className="px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((lead, i) => (
                      <tr key={lead.id} className={`border-b border-black/4 hover:bg-amber-50/50 transition-colors ${i % 2 === 0 ? "" : "bg-surface-light/30"}`}>
                        <td className="px-4 py-3 whitespace-nowrap text-muted text-xs">
                          {new Date(lead.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{lead.name}</td>
                        <td className="px-4 py-3 text-muted">
                          <a href={`mailto:${lead.email}`} className="hover:text-spark-orange transition-colors">
                            {lead.email}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-muted whitespace-nowrap">{lead.phone || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium">{lead.zip}</span>
                          {lead.state && <span className="text-muted ml-1">({lead.state})</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-muted">
                          {lead.monthlyBill === "low" ? "<$100"
                            : lead.monthlyBill === "mid" ? "$100–200"
                            : lead.monthlyBill === "high" ? "$200–400"
                            : lead.monthlyBill === "vhigh" ? "$400+"
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {lead.interest.map((i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded text-xs bg-amber-100 text-spark-amber">
                                {i === "solar" ? "☀️" : i === "battery" ? "🔋" : i === "ev-charger" ? "⚡" : "🏘️"}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                          {lead.installerName || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

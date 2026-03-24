import Link from "next/link";
import SparkBackground from "@/components/SparkBackground";

function FeatureCard({
  icon,
  title,
  description,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="card-glow block bg-surface rounded-2xl p-8 border border-black/6 group"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-spark-orange transition-colors">
        {title}
      </h3>
      <p className="text-muted text-sm leading-relaxed mb-4">{description}</p>
      <span className="text-spark-orange text-sm font-semibold group-hover:underline">
        {cta} &rarr;
      </span>
    </Link>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-sm text-muted mt-1">{label}</div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/60 to-sky-50">
        <SparkBackground />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,rgba(251,191,36,0.18)_0%,transparent_60%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-spark-amber text-sm font-semibold">
            ⚡ The future is electric
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight mb-6 text-foreground">
            Power Your Life{" "}
            <span className="bg-gradient-to-r from-spark-yellow via-spark-orange to-spark-amber bg-clip-text text-transparent gradient-animated">
              With Sparks
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Electric vehicles. Solar panels. Home batteries. The clean energy
            revolution isn&apos;t coming &mdash; it&apos;s here. Let us help you
            make the switch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/calculator"
              className="spark-btn inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all"
            >
              Find Your EV
            </Link>
            <Link
              href="/news"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-amber-200 text-foreground font-bold text-lg bg-white/70 hover:bg-white hover:border-amber-300 transition-all"
            >
              Latest News
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-black/6 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value="$1,500+" label="Annual fuel savings with EVs" />
          <StatCard value="30%" label="Tax credits available" />
          <StatCard value="25yr" label="Solar panel lifespan" />
          <StatCard value="90%" label="EV owner satisfaction" />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Explore the Electric Future
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Whether you&apos;re shopping for your first EV, considering solar
              panels, or want to store your own energy, we&apos;ve got you
              covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="20" width="32" height="14" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                  <circle cx="15" cy="36" r="3" fill="#ea580c" />
                  <circle cx="33" cy="36" r="3" fill="#ea580c" />
                  <path d="M26 14l-4 6h4l-2 6" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              title="Electric Vehicles"
              description="From city commuters to family haulers, find the perfect EV for your lifestyle and budget."
              href="/calculator"
              cta="Find your EV"
            />
            <FeatureCard
              icon={
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="10" y="14" width="28" height="20" rx="2" fill="#fef9c3" stroke="#f59e0b" strokeWidth="2" />
                  <path d="M24 6v8M15 9l2.5 4.5M33 9l-2.5 4.5" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="10" y1="24" x2="38" y2="24" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
                  <line x1="24" y1="14" x2="24" y2="34" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
                </svg>
              }
              title="Solar Power"
              description="Harness the sun to power your home. Learn about panels, installation, and incentives."
              href="/solar-finder"
              cta="Find installers"
            />
            <FeatureCard
              icon={
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="14" y="10" width="20" height="28" rx="3" fill="#f0fdf4" stroke="#16a34a" strokeWidth="2" />
                  <rect x="18" y="16" width="12" height="4" rx="1" fill="#16a34a" />
                  <rect x="18" y="22" width="12" height="4" rx="1" fill="#16a34a" opacity="0.6" />
                  <rect x="18" y="28" width="12" height="4" rx="1" fill="#16a34a" opacity="0.3" />
                  <rect x="22" y="6" width="4" height="4" rx="1" fill="#ea580c" />
                </svg>
              }
              title="Home Batteries"
              description="Store energy for when you need it. Backup power, savings, and energy independence."
              href="/news"
              cta="Explore options"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,rgba(234,88,12,0.08)_0%,transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Make the Switch?
          </h2>
          <p className="text-muted text-lg mb-8 max-w-2xl mx-auto">
            Thousands of people are switching to electric every day. Use our
            tools to find the right EV, bust the myths, and join the clean
            energy revolution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/calculator"
              className="spark-btn inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all"
            >
              Take the EV Quiz
            </Link>
            <Link
              href="/objections"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-amber-200 font-bold bg-white/70 hover:bg-white hover:border-amber-300 transition-all"
            >
              Read the FAQs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

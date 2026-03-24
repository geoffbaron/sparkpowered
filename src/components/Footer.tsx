import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent mb-3">
              Spark Powered
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Igniting the transition to clean energy. Your guide to EVs, solar
              power, and home battery solutions.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Explore
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/news", label: "Latest News" },
                { href: "/calculator", label: "EV Finder" },
                { href: "/objections", label: "Objections & FAQs" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-spark-yellow transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Topics
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>Electric Vehicles</li>
              <li>Solar Power</li>
              <li>Home Batteries</li>
              <li>Clean Energy Policy</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} Spark Powered. Built with clean
          energy enthusiasm.
        </div>
      </div>
    </footer>
  );
}

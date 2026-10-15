/**
 * Outbound partner links and the disclosure that must accompany them.
 *
 * Every link to a place a reader can buy something goes through <PartnerLink>
 * so the rel attributes, new-tab behaviour and tracking rules live in one
 * place. Any page that renders a PartnerLink must also render
 * <AffiliateDisclosure> above the first one.
 */

import Link from "next/link";
import { DISCLOSURE_TEXT, partnerUrl, solarQuotesUrl, type BrandId } from "@/data/affiliates";

export const PARTNER_REL = "sponsored nofollow noopener";

export function PartnerLink({
  brand,
  productId,
  productUrl,
  category,
  children,
  className,
  variant = "text",
}: {
  brand: BrandId;
  productId?: string;
  productUrl?: string;
  category?: "home" | "battery" | "solar";
  children: React.ReactNode;
  className?: string;
  variant?: "text" | "button";
}) {
  const link = partnerUrl(brand, { productId, productUrl, category });
  const cls =
    variant === "button"
      ? "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white text-sm font-bold shadow hover:shadow-md transition-shadow"
      : "underline underline-offset-2 text-spark-orange hover:text-spark-amber";
  return (
    <a
      href={link.href}
      target="_blank"
      rel={PARTNER_REL}
      data-partner={brand}
      data-tracked={link.tracked ? "1" : "0"}
      className={className ?? cls}
    >
      {children}
      {variant === "button" && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-sm text-stone-700 bg-surface-light border border-black/8 rounded-xl px-4 py-3 ${className}`}
      data-testid="affiliate-disclosure"
    >
      <strong>Disclosure:</strong> {DISCLOSURE_TEXT}{" "}
      <Link href="/disclaimer#affiliate-disclosure" className="underline underline-offset-2 hover:text-spark-orange">
        How we make money
      </Link>
      .
    </p>
  );
}

/** Clearly labelled EnergySage referral box for solar pages. */
export function SolarQuotesCta({ context }: { context?: string }) {
  const link = solarQuotesUrl();
  return (
    <aside
      aria-label="Compare solar quotes"
      className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 sm:p-6"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-spark-amber mb-1">Partner link · EnergySage</p>
      <h2 className="text-lg font-bold mb-1">Compare rooftop solar quotes{context ? ` ${context}` : ""}</h2>
      <p className="text-sm text-stone-700 mb-2 max-w-2xl">
        EnergySage is a free marketplace where pre-screened installers send you quotes you can compare side by side.
        Use our break-even price per watt to judge them.
      </p>
      <p className="text-xs text-stone-600 mb-4 max-w-2xl" data-testid="affiliate-disclosure">
        {DISCLOSURE_TEXT}{" "}
        <Link href="/disclaimer#affiliate-disclosure" className="underline underline-offset-2">
          How we make money
        </Link>
        .
      </p>
      <a
        href={link.href}
        target="_blank"
        rel={PARTNER_REL}
        data-partner="energysage"
        data-tracked={link.tracked ? "1" : "0"}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white text-sm font-bold shadow hover:shadow-md transition-shadow"
      >
        Get quotes on EnergySage
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </aside>
  );
}

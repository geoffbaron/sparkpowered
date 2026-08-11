import type { Metadata } from "next";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const TITLE = "Solar Finder — Compare Local Solar Installers by ZIP Code";
const DESCRIPTION =
  "Enter your ZIP code and see vetted solar installers serving your area, ranked with ratings and specialties. Free, no-pressure quotes for solar panels, home batteries and EV chargers.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/solar-finder",
});

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": url("/solar-finder#app"),
  name: "Solar Finder",
  url: url("/solar-finder"),
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires JavaScript",
  description: DESCRIPTION,
  areaServed: { "@type": "Country", name: "United States" },
  isPartOf: { "@id": url("/#website") },
  publisher: { "@id": url("/#organization") },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

/**
 * The page itself is a client component and so cannot export metadata. This
 * layout carries the route's title, canonical and structured data.
 */
export default function SolarFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}

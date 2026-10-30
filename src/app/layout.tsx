import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  JsonLd,
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  url,
} from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Spark Powered — EV, Solar & Home Battery Calculators",
    template: "%s | Spark Powered",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Clean Energy",
  // No site-wide canonical here: each page sets its own via pageMetadata().
  // A default of "/" made pages without one (like the 404 page) point at the home page.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
    title: "Spark Powered — EV, Solar & Home Battery Calculators",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spark Powered — EV, Solar & Home Battery Calculators",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  verification: {
    google: "cG0gVqtz4mgGTJadC8OFgakrDaQw1FzD9zdTvncIDyg",
    other: {
      "fo-verify": "3c3711c9-f239-4c8e-8a17-c475544cb3ec",
      "p:domain_verify": "c488b883c298dc9c1122e0e72d2b2d44",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

/**
 * Site-wide identity graph. Gives search and answer engines a stable subject to
 * attach every page to, plus a sitelinks search box on the SERP.
 */
const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": url("/#organization"),
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: url("/apple-icon"),
        width: 180,
        height: 180,
      },
      description:
        "Spark Powered publishes free, independent calculators and state-by-state data on electric vehicles, solar power and home battery storage for US households.",
      founder: { "@id": url("/about#editor") },
      areaServed: { "@type": "Country", name: "United States" },
      knowsAbout: [
        "Electric vehicles",
        "Solar power",
        "Home battery storage",
        "EV charging infrastructure",
        "Clean energy incentives",
      ],
    },
    {
      "@type": "Person",
      "@id": url("/about#editor"),
      name: "Geoff Baron",
      jobTitle: "Owner and editor",
      url: url("/about"),
      worksFor: { "@id": url("/#organization") },
    },
    {
      "@type": "WebSite",
      "@id": url("/#website"),
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": url("/#organization") },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <head>
        {/* impact.com site verification, in the exact form impact.com asks for (value attribute). */}
        <meta name="impact-site-verification" {...{ value: "1daf2570-8c42-4207-898d-a7885836ebd8" }} />
        {/* AvantLink affiliate site verification. Their checker string-matches the exact tag they gave
            (http, raw "&"), which React would escape, so the exact text is emitted verbatim inside a
            noscript (inert to browsers) and loaded for real over https. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<script type="text/javascript" src="http://classic.avantlink.com/affiliate_app_confirm.php?mode=js&authResponse=4a49886173dc86f56ae1d4eb573e2f8c6cbb46bc"></script>',
          }}
        />
        <script type="text/javascript" src="https://classic.avantlink.com/affiliate_app_confirm.php?mode=js&authResponse=4a49886173dc86f56ae1d4eb573e2f8c6cbb46bc" async />
        {/* The icon font (globals.css) is only used by the two quizzes, so it is not preloaded site-wide. */}
        <script
          defer
          src="https://mylastlap.com/ll.js"
          data-site="lls_538a3e5fe57f5934a45946cb"
        />
        <JsonLd data={organizationSchema} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="d044bc8b-0fdc-43ca-a02a-a96ab8ea0e04"
          strategy="afterInteractive"
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:m-3 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Spark Powered — EVs, Solar & Home Batteries, Explained",
    template: "%s | Spark Powered",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Clean Energy",
  keywords: [
    "electric vehicles",
    "EV news",
    "which EV should I buy",
    "home battery",
    "home battery sizing",
    "solar panels",
    "solar installers",
    "EV charging",
    "clean energy news",
    "EV myths",
    "federal EV tax credit",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
    title: "Spark Powered — EVs, Solar & Home Batteries, Explained",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spark Powered — EVs, Solar & Home Batteries, Explained",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
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
        url: url("/icon"),
        width: 32,
        height: 32,
      },
      description:
        "Spark Powered publishes independent guidance and daily news on electric vehicles, solar power and home battery storage.",
      knowsAbout: [
        "Electric vehicles",
        "Solar power",
        "Home battery storage",
        "EV charging infrastructure",
        "Clean energy incentives",
      ],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
        />
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

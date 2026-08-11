import type { Metadata } from "next";

/**
 * robots.txt asks crawlers not to fetch /admin; this makes sure that anything
 * that fetches it anyway (or finds it via a link) still refuses to index it.
 */
export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

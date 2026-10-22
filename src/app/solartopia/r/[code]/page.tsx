import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Stars } from "@/components/solartopia/Stars";
import { DAYS, MAX_STARS, PAGE } from "@/data/solartopia";
import { decodeStars, shareSentence, totalStars } from "@/lib/solartopia/share";
import { SITE_NAME } from "@/lib/seo";

type Props = { params: Promise<{ code: string }> };

/** A few samples are prebuilt; every other code renders on demand. */
export function generateStaticParams() {
  return [{ code: "33333" }, { code: "22222" }, { code: "11111" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const stars = decodeStars(code);
  const title = stars ? `${totalStars(stars)} of ${MAX_STARS} stars in Solartopia` : "Solartopia";
  const description = stars ? shareSentence(stars) : PAGE.description;
  return {
    title,
    description,
    alternates: { canonical: PAGE.path },
    robots: { index: false, follow: true },
    openGraph: { type: "website", siteName: SITE_NAME, title, description, url: `/solartopia/r/${code}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharePage({ params }: Props) {
  const { code } = await params;
  const stars = decodeStars(code);
  if (!stars) notFound();
  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber">Solartopia</p>
      <h1 className="text-3xl font-extrabold mt-2">{totalStars(stars)} of {MAX_STARS} stars</h1>
      <p className="text-lg text-stone-600 mt-3">{shareSentence(stars)}</p>
      <ul className="mt-6 grid gap-2 text-left">
        {DAYS.map((d, i) => (
          <li key={d.n} className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-2">
            <span>
              Day {d.n}: {d.title}
            </span>
            <Stars n={stars[i]} size={24} />
          </li>
        ))}
      </ul>
      <Link href="/solartopia" className="btn btn-primary mt-8 inline-flex">
        Play Solartopia, it is free
      </Link>
    </div>
  );
}

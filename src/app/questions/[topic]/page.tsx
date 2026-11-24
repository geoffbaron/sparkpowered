import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QuestionHub from "@/components/QuestionHub";
import { TOPICS as ALL_TOPICS } from "@/data/questions";

/** Nov 24 2026: only the home backup questions are published (src/lib/removed.ts redirects the rest). */
const TOPICS = ALL_TOPICS.filter((t) => t.slug === "home-batteries-backup");
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.slug }));
}

type Props = { params: Promise<{ topic: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const t = TOPICS.find((x) => x.slug === topic);
  if (!t) return {};
  return pageMetadata({ title: t.title, description: t.description, path: t.path, type: "article" });
}

export default async function QuestionTopicPage({ params }: Props) {
  const { topic } = await params;
  const t = TOPICS.find((x) => x.slug === topic);
  if (!t) notFound();
  return <QuestionHub topic={t} />;
}

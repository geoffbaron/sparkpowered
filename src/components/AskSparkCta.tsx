import Link from "next/link";

/** "Ask Spark" button for key pages. Plain link: the chat itself lives on /ask. */
export default function AskSparkCta({ className = "" }: { className?: string }) {
  return (
    <aside className={`rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between ${className}`}>
      <div>
        <p className="font-bold text-ink">Have a question about going electric?</p>
        <p className="text-sm text-stone-600">Ask Spark answers from our fact-checked pages and links each one. It&apos;s an AI assistant and can be wrong.</p>
      </div>
      <Link
        href="/ask"
        className="shrink-0 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange px-5 py-2.5 text-sm font-bold text-white shadow hover:shadow-md"
      >
        Ask Spark
      </Link>
    </aside>
  );
}

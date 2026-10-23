import { url } from "@/lib/seo";

/**
 * "Free to use with a credit" box for pages with a state table: a CSV
 * download and a ready-made credit line. Reporters and bloggers who reuse the
 * numbers are the site's best source of links.
 */
export function UseThisData({ path, title, csv }: { path: string; title: string; csv: string }) {
  const credit = `<a href="${url(path)}">${title}, Spark Powered</a>`;
  return (
    <aside className="mt-10 rounded-2xl border border-black/10 bg-surface p-5 sm:p-6" data-testid="use-this-data">
      <h2 className="text-lg font-extrabold text-ink">Use this data</h2>
      <p className="text-sm text-stone-700 mt-1 max-w-3xl">
        Reporters, bloggers and teachers are welcome to use these numbers and the state ranking. Please credit Spark Powered with a link
        to this page.
      </p>
      <div className="mt-3 flex flex-wrap gap-3 items-center">
        <a href={csv} download className="btn btn-primary btn-sm">Download the state table (CSV)</a>
      </div>
      <label className="block mt-4 text-sm">
        <span className="font-semibold text-ink">Credit line to copy</span>
        <textarea
          readOnly
          rows={2}
          defaultValue={credit}
          className="mt-1 block w-full rounded-lg border border-black/20 bg-white px-3 py-2 font-mono text-xs"
        />
      </label>
    </aside>
  );
}

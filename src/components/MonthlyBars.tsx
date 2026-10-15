const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * A twelve-bar chart drawn with plain HTML so it renders on the server, needs no
 * chart library, and stays readable to crawlers and screen readers via the
 * accompanying table.
 */
export default function MonthlyBars({ title, values }: { title: string; values: number[] }) {
  const max = Math.max(...values);
  return (
    <figure className="bg-surface rounded-xl border border-black/8 p-5">
      <figcaption className="text-sm font-semibold mb-4">{title}</figcaption>
      <div className="flex items-end gap-1.5 h-40" aria-hidden="true">
        {values.map((v, i) => (
          <div key={MONTHS[i]} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="text-[10px] text-stone-600 tabular-nums mb-1">{Math.round(v)}</span>
            <div
              className="w-full rounded-t bg-gradient-to-t from-spark-orange to-spark-yellow"
              style={{ height: `${(v / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1.5" aria-hidden="true">
        {MONTHS.map((m) => (
          <span key={m} className="flex-1 text-center text-[10px] text-stone-600">
            {m[0]}
          </span>
        ))}
      </div>
      <div className="sr-only">
      <table>
        <caption>{title}</caption>
        <tbody>
          {values.map((v, i) => (
            <tr key={MONTHS[i]}>
              <th scope="row">{MONTHS[i]}</th>
              <td>{Math.round(v)} kWh</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}

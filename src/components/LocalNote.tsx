"use client";

/**
 * One reserved line under a state picker: "Showing numbers for Texas · Change".
 * Always rendered (with neutral text before we know the state) so nothing
 * jumps when the visitor's state arrives.
 */
export default function LocalNote({
  name,
  local,
  selectId,
  className = "",
}: {
  /** State currently shown, or null for US averages. */
  name: string | null;
  /** True when the state is the visitor's own (picked, linked or estimated), false when it is just the page's example. */
  local: boolean;
  /** id of the <select> that "Change" opens. */
  selectId: string;
  className?: string;
}) {
  const open = () => {
    const el = document.getElementById(selectId) as HTMLSelectElement | null;
    if (!el) return;
    el.focus();
    try {
      el.showPicker?.();
    } catch {}
  };
  const text = !name ? "Showing US averages." : local ? `Showing numbers for ${name}.` : `Showing ${name} as an example.`;
  return (
    <p className={`text-xs text-muted mt-1 min-h-[1rem] ${className}`} data-testid="local-note">
      {text}{" "}
      <button type="button" onClick={open} className="underline font-medium text-spark-orange hover:text-ink">
        {name && local ? "Change" : "Pick your state"}
      </button>
    </p>
  );
}

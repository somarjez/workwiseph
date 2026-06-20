export default function KpiCard({ label, value, unit, previous }: {
  label: string; value: number | null; unit: string; previous?: number | null;
}) {
  const display =
    value == null ? "—"
    : unit === "percent" ? `${value.toFixed(1)}%`
    : unit === "persons" ? `${(value / 1000).toFixed(1)}M`  // levels stored in thousands
    : value.toLocaleString();

  let delta: { text: string; up: boolean } | null = null;
  if (value != null && previous != null && previous !== 0) {
    if (unit === "percent") {
      const d = value - previous;
      delta = { text: `${Math.abs(d).toFixed(1)} pp`, up: d >= 0 };
    } else {
      const d = ((value - previous) / previous) * 100;
      delta = { text: `${Math.abs(d).toFixed(1)}%`, up: d >= 0 };
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/40">
      <div className="nums text-3xl font-semibold leading-none tracking-tight text-ink">{display}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-xs font-medium text-muted">{label}</span>
        {delta && (
          <span className="nums ml-auto text-[11px] font-medium text-muted" title="vs same month, prior year">
            <span aria-hidden>{delta.up ? "▲" : "▼"}</span> {delta.text}
          </span>
        )}
      </div>
    </div>
  );
}

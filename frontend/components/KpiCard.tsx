export default function KpiCard({ label, value, unit }: {
  label: string; value: number | null; unit: string;
}) {
  const display =
    value == null ? "—"
    : unit === "percent" ? `${value.toFixed(1)}%`
    : unit === "persons" ? `${(value / 1000).toFixed(1)}M`  // levels stored in thousands
    : value.toLocaleString();
  return (
    <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/40">
      <div className="nums text-3xl font-semibold leading-none tracking-tight text-ink">{display}</div>
      <div className="mt-2 text-xs font-medium text-muted">{label}</div>
    </div>
  );
}

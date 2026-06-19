export default function KpiCard({ label, value, unit }: {
  label: string; value: number | null; unit: string;
}) {
  const display =
    value == null ? "—"
    : unit === "percent" ? `${value.toFixed(1)}%`
    : unit === "persons" ? `${(value / 1000).toFixed(1)}M`  // levels stored in thousands
    : value.toLocaleString();
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-2xl font-bold text-slate-900">{display}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}

"use client";
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import type { ForecastResp } from "@/lib/api";

const fmt = (iso: string) => iso.slice(0, 7); // YYYY-MM

export default function ForecastChart({ data, label }: { data: ForecastResp; label: string }) {
  const hist = data.history
    .filter((h) => h.value != null)
    .map((h) => ({ name: fmt(h.reference_date), actual: h.value as number }));
  const fc = data.forecast.map((f) => ({
    name: fmt(f.month), forecast: f.value, range: [f.lower, f.upper] as [number, number],
  }));
  const rows: Record<string, unknown>[] = [...hist, ...fc];
  // bridge the actual and forecast lines at the seam
  if (hist.length && fc.length) {
    rows[hist.length - 1] = { ...rows[hist.length - 1], forecast: hist[hist.length - 1].actual };
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{label}</h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} minTickGap={28} />
          <YAxis tick={{ fontSize: 10 }} width={40} />
          <Tooltip />
          <Legend />
          <Area dataKey="range" name="Forecast 95% band" stroke="none" fill="#bfdbfe" />
          <Line dataKey="actual" name="Actual" stroke="#1e293b" dot={false} strokeWidth={2} />
          <Line dataKey="forecast" name="Forecast" stroke="#2563eb" dot={false}
            strokeWidth={2} strokeDasharray="5 4" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

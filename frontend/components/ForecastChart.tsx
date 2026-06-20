"use client";
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import type { ForecastResp } from "@/lib/api";
import ChartCard from "./ChartCard";

const fmt = (iso: string) => iso.slice(0, 7); // YYYY-MM

export default function ForecastChart({ data, label }: { data: ForecastResp; label: string }) {
  const hist = data.history
    .filter((h) => h.value != null)
    .map((h) => ({ name: fmt(h.reference_date), actual: h.value as number }));
  const fc = data.forecast.map((f) => ({
    name: fmt(f.month), forecast: f.value, range: [f.lower, f.upper] as [number, number],
  }));
  const rows: Record<string, unknown>[] = [...hist, ...fc];
  if (hist.length && fc.length) {
    rows[hist.length - 1] = { ...rows[hist.length - 1], forecast: hist[hist.length - 1].actual };
  }
  const csv = [
    ...hist.map((h) => ({ period: h.name, actual: h.actual })),
    ...data.forecast.map((f) => ({ period: fmt(f.month), forecast: f.value, lower: f.lower, upper: f.upper })),
  ];

  return (
    <ChartCard title={label} csvData={csv}>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} minTickGap={28} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} width={40} />
          <Tooltip />
          <Legend />
          <Area dataKey="range" name="Forecast 95% band" stroke="none" fill="#bfdbfe" />
          <Line dataKey="actual" name="Actual" stroke="#1e293b" dot={false} strokeWidth={2} />
          <Line dataKey="forecast" name="Forecast" stroke="#2563eb" dot={false}
            strokeWidth={2} strokeDasharray="5 4" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

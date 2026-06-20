"use client";
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import type { ForecastResp } from "@/lib/api";
import { CHART } from "@/lib/chart";
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
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} strokeOpacity={0.25} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART.tick }} tickLine={false} axisLine={false} minTickGap={28} />
          <YAxis tick={{ fontSize: 11, fill: CHART.tick }} tickLine={false} axisLine={false} width={44} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area dataKey="range" name="95% interval" stroke="none" fill={CHART.band} fillOpacity={0.14} />
          <Line dataKey="actual" name="Actual" stroke={CHART.neutral} dot={false} strokeWidth={2} />
          <Line dataKey="forecast" name="Forecast" stroke={CHART.accent} dot={false}
            strokeWidth={2} strokeDasharray="5 4" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

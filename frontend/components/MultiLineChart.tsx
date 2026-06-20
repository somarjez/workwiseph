"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import type { Point } from "@/lib/api";
import { CHART } from "@/lib/chart";
import ChartCard from "./ChartCard";

export interface NamedSeries { name: string; color: string; data: Point[]; }

export default function MultiLineChart({ series, label, lastYears }: {
  series: NamedSeries[]; label: string; lastYears?: number;
}) {
  const maxYear = Math.max(0, ...series.flatMap((s) =>
    s.data.filter((p) => p.value != null).map((p) => p.year)));
  const minYear = lastYears ? maxYear - lastYears : 0;

  // Merge series by period. The first series defines row order (all sex series
  // share identical, reference-date-ordered periods), so no re-sort is needed.
  const byPeriod = new Map<string, Record<string, unknown>>();
  for (const s of series) {
    for (const p of s.data) {
      if (p.value == null || p.year < minYear) continue;
      const key = `${p.month ?? ""} ${p.year}`.trim();
      const row = byPeriod.get(key) ?? { name: key };
      row[s.name] = p.value;
      byPeriod.set(key, row);
    }
  }
  const data = [...byPeriod.values()];

  return (
    <ChartCard title={label} csvData={data}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} strokeOpacity={0.25} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART.tick }} tickLine={false} axisLine={false} minTickGap={32} />
          <YAxis tick={{ fontSize: 11, fill: CHART.tick }} tickLine={false} axisLine={false} width={44} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((s) => (
            <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color} dot={false} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

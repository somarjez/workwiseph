"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { AgeRow } from "@/lib/api";
import { CHART } from "@/lib/chart";
import ChartCard from "./ChartCard";

export default function AgeBarChart({ rows, label }: { rows: AgeRow[]; label: string }) {
  // Latest period with data, exclude the Total aggregate.
  const withData = rows.filter((r) => r.value != null && r.age_group !== "Total");
  const latestYear = Math.max(...withData.map((r) => r.year), 0);
  const latest = withData.filter((r) => r.year === latestYear);
  const data = latest.map((r) => ({ name: r.age_group.replace(" Years Old", ""), value: r.value }));
  return (
    <ChartCard title={label} csvData={data}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} strokeOpacity={0.25} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART.tick }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: CHART.tick }} tickLine={false} axisLine={false} width={44} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} cursor={{ fill: CHART.accent, fillOpacity: 0.06 }} />
          <Bar dataKey="value" fill={CHART.accent} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { CategoryRow } from "@/lib/api";
import { CHART } from "@/lib/chart";
import ChartCard from "./ChartCard";

export default function CategoryBarChart({
  rows, label, topN = 8,
}: { rows: CategoryRow[]; label: string; topN?: number }) {
  const data = rows
    .filter((r) => r.value != null && r.category.toUpperCase() !== "TOTAL")
    .slice(0, topN)
    .map((r) => ({ name: r.category.length > 24 ? r.category.slice(0, 23) + "…" : r.category, value: r.value }));
  return (
    <ChartCard title={label} csvData={data}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} strokeOpacity={0.25} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: CHART.tick }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: CHART.tick }} tickLine={false} axisLine={false} width={150} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} cursor={{ fill: CHART.accent, fillOpacity: 0.06 }} />
          <Bar dataKey="value" fill={CHART.accent} radius={[0, 4, 4, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

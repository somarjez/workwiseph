"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { CategoryRow } from "@/lib/api";
import ChartCard from "./ChartCard";

export default function CategoryBarChart({
  rows, label, topN = 8,
}: { rows: CategoryRow[]; label: string; topN?: number }) {
  const data = rows
    .filter((r) => r.value != null && r.category.toUpperCase() !== "TOTAL")
    .slice(0, topN)
    .map((r) => ({ name: r.category.length > 22 ? r.category.slice(0, 21) + "…" : r.category, value: r.value }));
  return (
    <ChartCard title={label} csvData={data}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} width={140} />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

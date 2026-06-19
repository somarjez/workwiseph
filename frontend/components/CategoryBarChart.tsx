"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { CategoryRow } from "@/lib/api";

export default function CategoryBarChart({
  rows, label, topN = 8,
}: { rows: CategoryRow[]; label: string; topN?: number }) {
  // Exclude the TOTAL aggregate; show the largest `topN` categories.
  const data = rows
    .filter((r) => r.value != null && r.category.toUpperCase() !== "TOTAL")
    .slice(0, topN)
    .map((r) => ({ name: r.category.length > 22 ? r.category.slice(0, 21) + "…" : r.category, value: r.value }));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{label}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

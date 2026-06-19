"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { AgeRow } from "@/lib/api";

export default function AgeBarChart({ rows, label }: { rows: AgeRow[]; label: string }) {
  // Latest period with data, exclude the Total aggregate.
  const withData = rows.filter((r) => r.value != null && r.age_group !== "Total");
  const latestYear = Math.max(...withData.map((r) => r.year), 0);
  const latest = withData.filter((r) => r.year === latestYear);
  const data = latest.map((r) => ({ name: r.age_group.replace(" Years Old", ""), value: r.value }));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{label}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} width={40} />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

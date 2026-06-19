"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { Series } from "@/lib/api";

export default function LineSeriesChart({ series, label }: { series: Series; label: string }) {
  const data = series.data
    .filter((p) => p.value != null)
    .map((p) => ({ name: `${p.month ?? ""} ${p.year}`.trim(), value: p.value }));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{label}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} minTickGap={32} />
          <YAxis tick={{ fontSize: 10 }} width={40} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#2563eb" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

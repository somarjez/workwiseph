"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { Series } from "@/lib/api";
import ChartCard from "./ChartCard";

export default function LineSeriesChart({ series, label }: { series: Series; label: string }) {
  const data = series.data
    .filter((p) => p.value != null)
    .map((p) => ({ name: `${p.month ?? ""} ${p.year}`.trim(), value: p.value }));
  return (
    <ChartCard title={label} csvData={data}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} minTickGap={32} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} width={40} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#2563eb" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

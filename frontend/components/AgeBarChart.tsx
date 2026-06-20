"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { AgeRow } from "@/lib/api";
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
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} width={40} />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

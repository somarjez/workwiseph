"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import type { AgeRow } from "@/lib/api";
import { CHART } from "@/lib/chart";
import ChartCard from "./ChartCard";

export default function GroupedAgeBarChart({ male, female, label }: {
  male: AgeRow[]; female: AgeRow[]; label: string;
}) {
  const all = [...male, ...female].filter((r) => r.value != null && r.age_group !== "Total");
  const latestYear = Math.max(0, ...all.map((r) => r.year));
  const m = new Map(male.filter((r) => r.year === latestYear).map((r) => [r.age_group, r.value]));
  const f = new Map(female.filter((r) => r.year === latestYear).map((r) => [r.age_group, r.value]));
  const ages = [...new Set(all.filter((r) => r.year === latestYear).map((r) => r.age_group))];
  const data = ages.map((a) => ({
    name: a.replace(" Years Old", ""),
    Male: m.get(a) ?? null,
    Female: f.get(a) ?? null,
  }));

  return (
    <ChartCard title={label} csvData={data}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} strokeOpacity={0.25} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART.tick }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: CHART.tick }} tickLine={false} axisLine={false} width={44} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} cursor={{ fill: CHART.accent, fillOpacity: 0.06 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Male" fill={CHART.accent} radius={[3, 3, 0, 0]} />
          <Bar dataKey="Female" fill={CHART.accent2} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

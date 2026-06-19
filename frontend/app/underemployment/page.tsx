"use client";
import { useApi } from "@/lib/useApi";
import type { UnderSummary } from "@/lib/api";
import LineSeriesChart from "@/components/LineSeriesChart";
import AgeBarChart from "@/components/AgeBarChart";
import StateWrapper from "@/components/StateWrapper";

export default function Underemployment() {
  const { data, error, isLoading } = useApi<UnderSummary>("/underemployment/summary");
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Underemployment Deep Dive</h2>
      <StateWrapper isLoading={isLoading} error={error} isEmpty={!data}>
        {data && (
          <div className="grid gap-6 lg:grid-cols-2">
            <LineSeriesChart series={data.rate} label="Underemployment Rate over time" />
            <AgeBarChart rows={data.by_age.data} label="Underemployed persons by age group (latest year)" />
          </div>
        )}
      </StateWrapper>
    </div>
  );
}

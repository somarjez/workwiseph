"use client";
import { useApi } from "@/lib/useApi";
import type { UnderSummary } from "@/lib/api";
import LineSeriesChart from "@/components/LineSeriesChart";
import AgeBarChart from "@/components/AgeBarChart";
import StateWrapper from "@/components/StateWrapper";
import PageHeader from "@/components/PageHeader";

export default function Underemployment() {
  const { data, error, isLoading } = useApi<UnderSummary>("/underemployment/summary");
  return (
    <div>
      <PageHeader
        title="Underemployment Deep Dive"
        context="The project's focus: workers who have jobs but want more hours or better pay — how the rate has moved, and who carries it."
      />
      <StateWrapper isLoading={isLoading} error={error} isEmpty={!data}>
        {data && (
          <div className="grid gap-6 lg:grid-cols-2">
            <LineSeriesChart series={data.rate} label="Underemployment rate over time" />
            <AgeBarChart rows={data.by_age.data} label="Underemployed persons by age group (latest year)" />
          </div>
        )}
      </StateWrapper>
    </div>
  );
}

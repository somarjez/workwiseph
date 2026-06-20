"use client";
import { useState } from "react";
import { useApi } from "@/lib/useApi";
import type { UnderSummary } from "@/lib/api";
import { SEX_OPTIONS, RANGE_OPTIONS, rangeYears, type Sex, type Range } from "@/lib/filters";
import LineSeriesChart from "@/components/LineSeriesChart";
import AgeBarChart from "@/components/AgeBarChart";
import StateWrapper from "@/components/StateWrapper";
import PageHeader from "@/components/PageHeader";
import PillGroup from "@/components/PillGroup";

export default function Underemployment() {
  const [sex, setSex] = useState<Sex>("Both Sexes");
  const [range, setRange] = useState<Range>("all");
  const { data, error, isLoading } = useApi<UnderSummary>(
    `/underemployment/summary?sex=${encodeURIComponent(sex)}`);

  return (
    <div>
      <PageHeader
        title="Underemployment Deep Dive"
        context="The project's focus: workers who have jobs but want more hours or better pay — how the rate has moved, and who carries it.">
        <PillGroup label="Sex" options={SEX_OPTIONS} value={sex} onChange={setSex} />
        <PillGroup label="Range" options={RANGE_OPTIONS} value={range} onChange={setRange} />
      </PageHeader>
      <StateWrapper isLoading={isLoading} error={error} isEmpty={!data}>
        {data && (
          <div className="grid gap-6 lg:grid-cols-2">
            <LineSeriesChart series={data.rate} lastYears={rangeYears(range)} label="Underemployment rate over time" />
            <AgeBarChart rows={data.by_age.data} label="Underemployed persons by age group (latest year)" />
          </div>
        )}
      </StateWrapper>
    </div>
  );
}

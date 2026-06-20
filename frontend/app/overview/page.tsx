"use client";
import { useState } from "react";
import { useApi } from "@/lib/useApi";
import type { Kpi } from "@/lib/api";
import { SEX_FILTER_OPTIONS, RANGE_OPTIONS, rangeYears, type SexFilter, type Range } from "@/lib/filters";
import KpiCard from "@/components/KpiCard";
import StateWrapper from "@/components/StateWrapper";
import PageHeader from "@/components/PageHeader";
import PillGroup from "@/components/PillGroup";
import SexComparableLine from "@/components/SexComparableLine";

export default function Overview() {
  const [sex, setSex] = useState<SexFilter>("Both Sexes");
  const [range, setRange] = useState<Range>("all");
  const kpis = useApi<Kpi[]>("/kpis");
  const years = rangeYears(range);

  return (
    <div>
      <PageHeader
        title="Labor Market Overview"
        context="The headline indicators from the Philippine Labor Force Survey — the rates and counts that frame everything else in this report.">
        <PillGroup label="Sex" options={SEX_FILTER_OPTIONS} value={sex} onChange={setSex} />
        <PillGroup label="Range" options={RANGE_OPTIONS} value={range} onChange={setRange} />
      </PageHeader>

      <StateWrapper isLoading={kpis.isLoading} error={kpis.error} isEmpty={!kpis.data?.length}>
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {kpis.data?.map((k) => (
            <KpiCard key={k.indicator_name} label={k.indicator_name} value={k.value} unit={k.unit} previous={k.previous} />
          ))}
        </div>
      </StateWrapper>

      <div className="grid gap-6 lg:grid-cols-2">
        <SexComparableLine indicator="Unemployment Rate" sex={sex} lastYears={years} label="Unemployment rate" />
        <SexComparableLine indicator="Underemployment Rate" sex={sex} lastYears={years} label="Underemployment rate" />
      </div>
    </div>
  );
}

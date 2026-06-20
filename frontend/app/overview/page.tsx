"use client";
import { useState } from "react";
import { useApi } from "@/lib/useApi";
import type { Kpi, Series } from "@/lib/api";
import { SEX_OPTIONS, RANGE_OPTIONS, rangeYears, type Sex, type Range } from "@/lib/filters";
import KpiCard from "@/components/KpiCard";
import LineSeriesChart from "@/components/LineSeriesChart";
import StateWrapper from "@/components/StateWrapper";
import PageHeader from "@/components/PageHeader";
import PillGroup from "@/components/PillGroup";

export default function Overview() {
  const [sex, setSex] = useState<Sex>("Both Sexes");
  const [range, setRange] = useState<Range>("all");
  const q = `&sex=${encodeURIComponent(sex)}`;

  const kpis = useApi<Kpi[]>("/kpis");
  const unemp = useApi<Series>(`/labor/rates?indicator=Unemployment%20Rate${q}`);
  const under = useApi<Series>(`/labor/rates?indicator=Underemployment%20Rate${q}`);
  const years = rangeYears(range);

  return (
    <div>
      <PageHeader
        title="Labor Market Overview"
        context="The headline indicators from the Philippine Labor Force Survey — the rates and counts that frame everything else in this report.">
        <PillGroup label="Sex" options={SEX_OPTIONS} value={sex} onChange={setSex} />
        <PillGroup label="Range" options={RANGE_OPTIONS} value={range} onChange={setRange} />
      </PageHeader>

      <StateWrapper isLoading={kpis.isLoading} error={kpis.error} isEmpty={!kpis.data?.length}>
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {kpis.data?.map((k) => (
            <KpiCard key={k.indicator_name} label={k.indicator_name} value={k.value} unit={k.unit} />
          ))}
        </div>
      </StateWrapper>

      <div className="grid gap-6 lg:grid-cols-2">
        <StateWrapper isLoading={unemp.isLoading} error={unemp.error} isEmpty={!unemp.data?.data.length}>
          {unemp.data && <LineSeriesChart series={unemp.data} lastYears={years} label="Unemployment rate over time" />}
        </StateWrapper>
        <StateWrapper isLoading={under.isLoading} error={under.error} isEmpty={!under.data?.data.length}>
          {under.data && <LineSeriesChart series={under.data} lastYears={years} label="Underemployment rate over time" />}
        </StateWrapper>
      </div>
    </div>
  );
}

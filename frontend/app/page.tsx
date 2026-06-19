"use client";
import { useApi } from "@/lib/useApi";
import type { Kpi, Series } from "@/lib/api";
import KpiCard from "@/components/KpiCard";
import LineSeriesChart from "@/components/LineSeriesChart";
import StateWrapper from "@/components/StateWrapper";

export default function Overview() {
  const kpis = useApi<Kpi[]>("/kpis");
  const unemp = useApi<Series>("/labor/rates?indicator=Unemployment%20Rate");
  const under = useApi<Series>("/labor/rates?indicator=Underemployment%20Rate");

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Labor Market Overview</h2>
      <StateWrapper isLoading={kpis.isLoading} error={kpis.error} isEmpty={!kpis.data?.length}>
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {kpis.data?.map((k) => (
            <KpiCard key={k.indicator_name} label={k.indicator_name} value={k.value} unit={k.unit} />
          ))}
        </div>
      </StateWrapper>
      <div className="grid gap-6 lg:grid-cols-2">
        <StateWrapper isLoading={unemp.isLoading} error={unemp.error}>
          {unemp.data && <LineSeriesChart series={unemp.data} label="Unemployment Rate over time" />}
        </StateWrapper>
        <StateWrapper isLoading={under.isLoading} error={under.error}>
          {under.data && <LineSeriesChart series={under.data} label="Underemployment Rate over time" />}
        </StateWrapper>
      </div>
    </div>
  );
}

"use client";
import { Suspense } from "react";
import { useApi } from "@/lib/useApi";
import type { Kpi, Series, SectorResp, ForecastResp } from "@/lib/api";
import { useQueryState } from "@/lib/useQueryState";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { SEX_OPTIONS, type Sex } from "@/lib/filters";
import KpiCard from "@/components/KpiCard";
import LineSeriesChart from "@/components/LineSeriesChart";
import CategoryBarChart from "@/components/CategoryBarChart";
import ForecastChart from "@/components/ForecastChart";
import StateWrapper from "@/components/StateWrapper";
import PillGroup from "@/components/PillGroup";

function ReportInner() {
  useDocumentTitle("Report");
  const [sex, setSex] = useQueryState<Sex>("sex", "Both Sexes");
  const q = `&sex=${encodeURIComponent(sex)}`;

  const kpis = useApi<Kpi[]>("/kpis");
  const unemp = useApi<Series>(`/labor/rates?indicator=Unemployment%20Rate${q}`);
  const under = useApi<Series>(`/labor/rates?indicator=Underemployment%20Rate${q}`);
  const industry = useApi<SectorResp>("/industry/employment");
  const forecast = useApi<ForecastResp>("/forecast?indicator=Unemployment%20Rate&method=ets");
  const today = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <PillGroup label="Sex" options={SEX_OPTIONS} value={sex} onChange={setSex} />
        <button onClick={() => window.print()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
          Download PDF
        </button>
      </div>

      <header className="avoid-break mb-8 border-b border-border pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">WorkWise PH · Labor Market Report</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">Philippine Labor Market Snapshot</h1>
        <p className="mt-1 text-sm text-muted">Generated {today} · {sex} · Source: PSA Labor Force Survey (2005–2026)</p>
      </header>

      <section className="avoid-break mb-8">
        <h2 className="mb-3 font-display text-xl font-medium">Key indicators</h2>
        <StateWrapper isLoading={kpis.isLoading} error={kpis.error} isEmpty={!kpis.data?.length}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {kpis.data?.map((k) => (
              <KpiCard key={k.indicator_name} label={k.indicator_name} value={k.value} unit={k.unit} previous={k.previous} />
            ))}
          </div>
        </StateWrapper>
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <StateWrapper isLoading={unemp.isLoading} error={unemp.error} isEmpty={!unemp.data?.data.length}>
          {unemp.data && <LineSeriesChart series={unemp.data} label="Unemployment rate over time" />}
        </StateWrapper>
        <StateWrapper isLoading={under.isLoading} error={under.error} isEmpty={!under.data?.data.length}>
          {under.data && <LineSeriesChart series={under.data} label="Underemployment rate over time" />}
        </StateWrapper>
      </section>

      <section className="avoid-break mb-8">
        <StateWrapper isLoading={industry.isLoading} error={industry.error} isEmpty={!industry.data?.latest.length}>
          {industry.data && <CategoryBarChart rows={industry.data.latest} label="Top industries by employment (latest)" />}
        </StateWrapper>
      </section>

      <section className="avoid-break">
        <StateWrapper isLoading={forecast.isLoading} error={forecast.error} isEmpty={!forecast.data?.history.length}>
          {forecast.data && <ForecastChart data={forecast.data} label="Unemployment rate: actual vs 6-month forecast" />}
        </StateWrapper>
      </section>
    </div>
  );
}

export default function Report() {
  return <Suspense><ReportInner /></Suspense>;
}
